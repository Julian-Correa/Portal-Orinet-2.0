import "dotenv/config";
import { enviarPushAClientes } from "../../server/lib/pushNotifications.js";
import { armarPayloadAviso } from "../../server/lib/notificaciones.js";
import { configRepository } from "../../server/repositories/configRepository.js";

export default async function handler() {
  try {
    const today = new Date().getDate();
    // Validar que solo corra el 1er dia de cada mes
    if (today !== 1) {
      return new Response("Not the target day", { status: 200 });
    }

    const avisos = await configRepository.getAvisosPush();

    const { enviados, encontrados } = await enviarPushAClientes({
      armarPayload: (customer) => armarPayloadAviso({ dia: 1, customer, texto: avisos[1] }),
    });

    if (encontrados === 0) {
      return new Response("No subscriptions found", { status: 200 });
    }

    return new Response(`Notificaciones enviadas: ${enviados}`, { status: 200 });
  } catch (error) {
    console.error("Cron error:", error);
    return new Response("Error executing cron", { status: 500 });
  }
}

export const config = {
  schedule: "0 10 1 * *" // A las 10:00 AM el 1 de cada mes
};
