import { BlobAdapter } from "./blobAdapter.js";

const metricsStore = new BlobAdapter("orinet-config");

export const metricsRepository = {
  async getMetrics() {
    const defaultMetrics = { visits: 0, comprobanteClicks: 0 };
    
    // Obtenemos visitas
    let visits = await metricsStore.get("metrics:visits");
    // Obtenemos clicks
    let comprobanteClicks = await metricsStore.get("metrics:comprobante-clicks");
    
    return {
      visits: visits || defaultMetrics.visits,
      comprobanteClicks: comprobanteClicks || defaultMetrics.comprobanteClicks
    };
  },

  async incrementVisits() {
    const current = await metricsStore.get("metrics:visits") || 0;
    const nextValue = Number(current) + 1;
    await metricsStore.setJSON("metrics:visits", nextValue);
    return nextValue;
  },

  async incrementComprobanteClicks() {
    const current = await metricsStore.get("metrics:comprobante-clicks") || 0;
    const nextValue = Number(current) + 1;
    await metricsStore.setJSON("metrics:comprobante-clicks", nextValue);
    return nextValue;
  }
};
