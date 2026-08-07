import { BlobAdapter } from "./blobAdapter.js";

const configStore = new BlobAdapter("orinet-config");

export const configRepository = {
  // --- Costos ---
  async getCostos() {
    const defaultCostos = {
      recargoReconexion: 2000,
      costoCompromiso: 0,
      umbralDeudaVencida: 10000,
      diasCompromisoBloqueado: [26, 27]
    };
    const costos = await configStore.get("config:costos");
    return costos ? { ...defaultCostos, ...costos } : defaultCostos;
  },

  async updateCostos(costosData) {
    // Merge con los existentes
    const current = await this.getCostos();
    const updated = { ...current, ...costosData };
    await configStore.setJSON("config:costos", updated);
    return updated;
  },

  // --- Popup ---
  async getPopupConfig() {
    const defaultPopup = {
      enabled: false,
      imageUrl: "",
      linkUrl: ""
    };
    const popup = await configStore.get("config:popup");
    return popup ? { ...defaultPopup, ...popup } : defaultPopup;
  },

  async updatePopupConfig(popupData) {
    const current = await this.getPopupConfig();
    const updated = { ...current, ...popupData };
    await configStore.setJSON("config:popup", updated);
    return updated;
  },

  // --- Planes ---
  async getPlanes() {
    const planes = await configStore.get("config:planes");
    return planes || [];
  },

  async updatePlanes(planesArray) {
    if (!Array.isArray(planesArray)) throw new Error("Los planes deben ser un array");
    await configStore.setJSON("config:planes", planesArray);
    return planesArray;
  }
};
