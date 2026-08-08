import fs from "fs/promises";
import path from "path";
import { getStore } from "@netlify/blobs";
import { fileURLToPath } from "url";

let _currentDirName = "";
if (typeof __dirname !== "undefined") {
  _currentDirName = __dirname;
} else if (typeof import.meta !== "undefined" && import.meta.url) {
  _currentDirName = path.dirname(fileURLToPath(import.meta.url));
} else {
  _currentDirName = process.cwd();
}
let LOCAL_STORE_PATH = path.join(_currentDirName, "../../.local-blobs.json");

/**
 * Adapter para manejar Netlify Blobs en producción
 * y un archivo JSON en desarrollo local (ya que corremos con npm run dev).
 */
export class BlobAdapter {
  constructor(storeName) {
    this.storeName = storeName;
    const isLambda = !!process.env.AWS_EXECUTION_ENV || !!process.env.LAMBDA_TASK_ROOT || !!process.env.LAMBDA_RUNTIME_DIR;
    this.isLocal = !process.env.NETLIFY && !isLambda && process.env.NODE_ENV !== "production";
    
    if (isLambda) {
       LOCAL_STORE_PATH = "/tmp/.local-blobs.json";
    }
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
      try {
        const store = getStore(this.storeName);
        return await store.get(key, { type: "json" });
      } catch (err) {
        if (err.name === 'MissingBlobsEnvironmentError' || err.message.includes('configured to use Netlify Blobs') || err.message.includes('No siteID')) {
          console.warn("Netlify Blobs not configured, falling back to local /tmp filesystem");
          const data = await this._readLocalData();
          const storeData = data[this.storeName] || {};
          return storeData[key] || null;
        }
        throw err;
      }
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
      try {
        const store = getStore(this.storeName);
        await store.setJSON(key, value);
      } catch (err) {
        if (err.name === 'MissingBlobsEnvironmentError' || err.message.includes('configured to use Netlify Blobs') || err.message.includes('No siteID')) {
          console.warn("Netlify Blobs not configured, falling back to local /tmp filesystem");
          const data = await this._readLocalData();
          if (!data[this.storeName]) {
            data[this.storeName] = {};
          }
          data[this.storeName][key] = value;
          await this._writeLocalData(data);
          return;
        }
        throw err;
      }
    }
  }
}
