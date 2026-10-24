import "dotenv/config";
import { enviarPushAClientes } from "../../server/lib/pushNotifications.js";
import { armarPayloadAviso } from "../../server/lib/notificaciones.js";
import { configRepository } from "../../server/repositories/configRepository.js";
import { pushRunsRepository } from "../../server/repositories/pushRunsRepository.js";

export default async function handler() {
  try {
    const today = new Date().getDate();
    // Validar que solo corra dias 9 y 24
    if (today !== 9 && today !== 24) {
      return new Response("Not the target day", { status: 200 });
    }

    const avisos = await configRepository.getAvisosPush();
    const run = await pushRunsRepository.getRun(today);

    const { enviados, encontrados, enviadosDnis } = await enviarPushAClientes({
      armarPayload: (customer) =>
        armarPayloadAviso({ dia: today, customer, texto: avisos[today] }),
      exceptoDnis: run.enviados,
    });

    await pushRunsRepository.registrarEnviados(today, enviadosDnis);

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
  schedule: "0 10 9,24 * *" // A las 10:00 AM los dias 9 y 24
};
