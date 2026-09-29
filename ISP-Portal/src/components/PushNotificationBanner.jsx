import React, { useState, useEffect } from 'react';
import { useCustomerSession } from '../hooks/useCustomerSession';

const PORTAL_API_BASE = import.meta.env.VITE_PORTAL_API_BASE || "";

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function keysEqual(a, b) {
  if (!a || !b) return false;
  const arrA = a instanceof ArrayBuffer ? new Uint8Array(a) : new Uint8Array(a.buffer || a);
  const arrB = b instanceof ArrayBuffer ? new Uint8Array(b) : new Uint8Array(b.buffer || b);
  if (arrA.length !== arrB.length) return false;
  return arrA.every((byte, i) => byte === arrB[i]);
}

async function ensureSubscription() {
  const registration = await navigator.serviceWorker.ready;
  const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

  let subscription = await registration.pushManager.getSubscription();

  // Si la suscripcion existe pero fue creada con otra clave VAPID (ej: rotacion de claves),
  // hay que volver a suscribirse con la clave actual.
  if (subscription && !keysEqual(subscription.options.applicationServerKey, convertedVapidKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  }

  return subscription;
}

export function PushNotificationBanner() {
  const { session } = useCustomerSession();
  const [showBanner, setShowBanner] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);
  const [subError, setSubError] = useState("");

  useEffect(() => {
    if (!session || !session.customer || !session.customer.doc_number) {
      setShowBanner(false);
      return;
    }
    // Si ya esta concedido o denegado, no mostramos el banner.
    // Solo lo mostramos si esta 'default'
    if (Notification.permission === 'default') {
      setShowBanner(true);
    }
  }, [session, permission]);

  // Si el permiso ya esta concedido, re-registramos la suscripcion en el backend.
  // Asi nos recuperamos si el servidor perdio las suscripciones (RAM efimera)
  // o si se rotaron las claves VAPID.
  useEffect(() => {
    if (!session || !session.customer || !session.customer.doc_number) return;
    if (Notification.permission !== 'granted') return;

    let cancelled = false;

    (async () => {
      try {
        const subscription = await ensureSubscription();
        const res = await fetch(`${PORTAL_API_BASE}/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dni: session.customer.doc_number,
            subscription
          })
        });
        if (!res.ok) {
          console.error('No se pudo registrar la suscripcion push:', res.status, await res.text());
        } else if (!cancelled) {
          setSubError("");
        }
      } catch (error) {
        console.error('Error re-suscribiendo push:', error);
      }
    })();

    return () => { cancelled = true; };
  }, [session]);

  const handleSubscribe = async () => {
    setSubError("");
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setShowBanner(false);
        return;
      }

      const subscription = await ensureSubscription();

      const res = await fetch(`${PORTAL_API_BASE}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni: session.customer.doc_number,
          subscription
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setShowBanner(false);
    } catch (error) {
      console.error('Error suscribiendo a notificaciones push:', error);
      setSubError('No se pudo activar. Revisa tu conexion e intenta de nuevo.');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-sky-500/10 border border-sky-500/30 text-sky-200 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg mx-4 mt-4 mb-2 animate-fade-in z-50">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="text-sm font-medium">
          {subError || 'Activa las notificaciones para recibir avisos importantes sobre tu cuenta.'}
        </span>
      </div>
      <div className="flex space-x-2 shrink-0 ml-4">
        <button onClick={handleSubscribe} className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Activar</button>
        <button onClick={handleDismiss} className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Ahora no</button>
      </div>
    </div>
  );
}
