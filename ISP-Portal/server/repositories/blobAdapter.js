import fs from "fs/promises";
import path from "path";
import { getStore } from "@netlify/blobs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_STORE_PATH = path.join(__dirname, "../../.local-blobs.json");

/**
 * Adapter para manejar Netlify Blobs en producción
 * y un archivo JSON en desarrollo local (ya que corremos con npm run dev).
 */
export class BlobAdapter {
  constructor(storeName) {
    this.storeName = storeName;
    // Si estamos en Netlify (usualmente NETLIFY=true o hay context de blobs)
    // O si estamos en entorno productivo
    this.isLocal = !process.env.NETLIFY && process.env.NODE_ENV !== "production";
  }

  async _readLocalData() {
    try {
      const data = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return {};
      }
      throw error;
    }
  }

  async _writeLocalData(data) {
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  }

  async get(key) {
    if (this.isLocal) {
      const data = await this._readLocalData();
      const storeData = data[this.storeName] || {};
      return storeData[key] || null;
    } else {
      const store = getStore(this.storeName);
      return await store.get(key, { type: "json" });
    }
  }

  async setJSON(key, value) {
    if (this.isLocal) {
      const data = await this._readLocalData();
      if (!data[this.storeName]) {
        data[this.storeName] = {};
      }
      data[this.storeName][key] = value;
      await this._writeLocalData(data);
    } else {
      const store = getStore(this.storeName);
      await store.setJSON(key, value);
    }
  }
}
