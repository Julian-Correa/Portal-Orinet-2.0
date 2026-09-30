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

export async function enviarPushAClientes({ armarPayload }) {
  const cache = await getCache();
  const subscriptions = await cache.getAllSubscriptions();

  if (subscriptions.length === 0) {
    return { enviados: 0, encontrados: 0 };
  }

  const customerSummaryService = await getCustomerSummaryService();

  let enviados = 0;

  for (const sub of subscriptions) {
    const { dni, subscription } = sub;
    try {
      const summary = await customerSummaryService.getSummaryByDni(dni);

      if (!summary || summary.error) {
        continue; // No se pudo verificar el estado del cliente
      }

      const customer = summary.data.customer;

      if (!isServiceEnabled(customer.status)) {
        continue; // Solo clientes habilitados
      }

      const payload = armarPayload(customer);
      if (!payload) {
        continue;
      }

      await webpush.sendNotification(subscription, JSON.stringify(payload));
      enviados++;
    } catch (err) {
      console.error(`Error enviando push a dni ${dni}:`, err);
    }
  }

  return { enviados, encontrados: subscriptions.length };
}
