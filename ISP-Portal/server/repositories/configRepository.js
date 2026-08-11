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
    const defaultPlanes = [
      { id: "1", velocidad: "100 MB", precio: 28000, descripcion: "Ideal para navegación y redes sociales." },
      { id: "2", velocidad: "200 MB", precio: 31000, descripcion: "Streaming, trabajo y entretenimiento." },
      { id: "3", velocidad: "300 MB", precio: 34000, descripcion: "Mayor velocidad para toda tu casa." },
      { id: "app-tv", velocidad: "APP TV", precio: 9000, descripcion: "2 PANTALLAS" },
      { id: "app-tv-3", velocidad: "APP TV", precio: 11000, descripcion: "3 PANTALLAS" }
    ];
    const planes = await configStore.get("config:planes");
    return planes && planes.length > 0 ? planes : defaultPlanes;
  },

  async updatePlanes(planesArray) {
    if (!Array.isArray(planesArray)) throw new Error("Los planes deben ser un array");
    await configStore.setJSON("config:planes", planesArray);
    return planesArray;
  }
};
