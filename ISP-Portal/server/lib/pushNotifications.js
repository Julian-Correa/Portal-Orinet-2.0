import webpush from "web-push";
import { getCache, getCustomerSummaryService } from "../app/runtime.js";
import { isServiceEnabled } from "../../src/lib/utils/customer.js";

if (process.env.VAPID_PRIVATE_KEY && (process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY)) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contacto@orinet.com.ar",
    process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Ejecuta `tarea` sobre cada item con a lo sumo `limite` ejecuciones concurrentes.
export async function enParaleloLimitado(items, limite, tarea) {
  let siguiente = 0;
  const trabajadores = Array.from(
    { length: Math.max(1, Math.min(limite, items.length)) },
    async () => {
      while (siguiente < items.length) {
        const actual = siguiente++;
        await tarea(items[actual], actual);
      }
    }
  );
  await Promise.all(trabajadores);
}

// `deadlineMs = 0` significa sin limite (crons). Los endpoints dentro de la
// function api (limite de 10s en Netlify) pasan un presupuesto acotado para
// responder resultado parcial antes de que el gateway corte con 504.
export async function enviarPushAClientes({ armarPayload, concurrencia = 5, deadlineMs = 0 }) {
  const cache = await getCache();
  const subscriptions = await cache.getAllSubscriptions();

  if (subscriptions.length === 0) {
    return { enviados: 0, encontrados: 0, pendientes: 0, completo: true };
  }

  const customerSummaryService = await getCustomerSummaryService();

  const inicio = Date.now();
  let enviados = 0;
  let procesadas = 0;
  let cortado = false;

  await enParaleloLimitado(subscriptions, concurrencia, async (sub) => {
    if (deadlineMs > 0 && Date.now() - inicio >= deadlineMs) {
      cortado = true;
      return;
    }

    const { dni, subscription } = sub;
    try {
      const summary = await customerSummaryService.getSummaryByDni(dni);

      if (!summary || summary.error) {
        return; // No se pudo verificar el estado del cliente
      }

      const customer = summary.data.customer;

      if (!isServiceEnabled(customer.status)) {
        return; // Solo clientes habilitados
      }

      const payload = armarPayload(customer);
      if (!payload) {
        return;
      }

      await webpush.sendNotification(subscription, JSON.stringify(payload));
      enviados++;
    } catch (err) {
      console.error(`Error enviando push a dni ${dni}:`, err);
    } finally {
      procesadas++;
    }
  });

  const pendientes = subscriptions.length - procesadas;

  return {
    enviados,
    encontrados: subscriptions.length,
    pendientes,
    completo: !cortado && pendientes === 0,
  };
}
