import "dotenv/config";
import webpush from "web-push";
import { getCustomerSummaryService, getCache } from "../../server/app/runtime.js";

// Configurar Web Push
webpush.setVapidDetails(
  "mailto:contacto@orinet.com.ar",
  process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, context) {
  try {
    const today = new Date().getDate();
    // Validar que solo corra dias 9 y 24
    if (today !== 9 && today !== 24) {
      return new Response("Not the target day", { status: 200 });
    }

    const cache = await getCache();
    const subscriptions = await cache.getAllSubscriptions();
    
    if (subscriptions.length === 0) {
      return new Response("No subscriptions found", { status: 200 });
    }

    const customerSummaryService = await getCustomerSummaryService();

    let sentCount = 0;

    for (const sub of subscriptions) {
      try {
        const { dni, subscription } = sub;
        
        // Evitar uso de cache interno en el resumen de deuda para tener dato actual?
        // El cache dura poco (120s), no deberia ser problema grande, pero lo consultamos:
        const summary = await customerSummaryService.getSummaryByDni(dni);

        if (!summary || summary.error) {
          continue; // No se pudo verificar la deuda
        }

        const customer = summary.data.customer;
        const debt = parseFloat(customer.debt || "0");
        const duedebt = parseFloat(customer.duedebt || "0");

        if (debt > 0 || duedebt > 0) {
          let title = "OriNet Portal";
          let body = "Tienes una nueva notificacion";
          
          if (today === 9) {
            title = "Aviso de Vencimiento";
            body = "Te recordamos que el 1er vencimiento de tu factura esta proximo.";
          } else if (today === 24) {
            title = "Aviso Importante";
            body = "Aviso de 2do vencimiento y fecha limite de corte.";
          }

          const payload = JSON.stringify({
            title,
            body,
            url: "/facturacion"
          });

          await webpush.sendNotification(subscription, payload);
          sentCount++;
        }
      } catch (err) {
        console.error(`Error enviando push a dni ${dni}:`, err);
      }
    }

    return new Response(`Notificaciones enviadas: ${sentCount}`, { status: 200 });
  } catch (error) {
    console.error("Cron error:", error);
    return new Response("Error executing cron", { status: 500 });
  }
}

export const config = {
  schedule: "0 10 9,24 * *" // A las 10:00 AM los dias 9 y 24
};
