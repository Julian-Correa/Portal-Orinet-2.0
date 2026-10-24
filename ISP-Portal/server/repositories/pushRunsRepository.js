import { BlobAdapter } from "./blobAdapter.js";

const store = new BlobAdapter("orinet-push");

function mesActual() {
  return new Date().toISOString().slice(0, 7);
}

// Registro de quien ya recibio cada aviso del mes, para que re-ejecutar
// un aviso (manual o cron) solo envie a quienes faltan y nunca duplique.
// La clave es `push:run:{dia}` y se resetea automaticamente al cambiar de mes.
export const pushRunsRepository = {
  async getRun(dia) {
    const run = await store.get(`push:run:${dia}`);
    const mes = mesActual();
    if (!run || run.mes !== mes) {
      return { mes, enviados: [] };
    }
    return run;
  },

  async registrarEnviados(dia, dnis) {
    if (!dnis || dnis.length === 0) return this.getRun(dia);

    const run = await this.getRun(dia);
    const set = new Set(run.enviados);
    for (const dni of dnis) set.add(dni);

    const updated = { mes: run.mes, enviados: Array.from(set) };
    await store.setJSON(`push:run:${dia}`, updated);
    return updated;
  },
};
