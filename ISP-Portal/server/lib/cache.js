import { createClient } from "redis";
import { BlobAdapter } from "../repositories/blobAdapter.js";

export class CacheClient {
  constructor({ redisUrl }) {
    this.redisUrl = redisUrl;
    this.redis = null;
    this.memory = new Map();
    this.pushStore = new BlobAdapter("orinet-push");
  }

  async connect() {
    if (!this.redisUrl) return;

    try {
      this.redis = createClient({
        url: this.redisUrl,
        socket: {
          connectTimeout: 1000,
          reconnectStrategy: false,
        },
      });
      this.redis.on("error", (err) => {
        console.warn("Redis no disponible, se usa caché en memoria:", err.message);
      });
      await this.redis.connect();
      console.log("Redis conectado");
    } catch (error) {
      console.warn("No se pudo conectar Redis, se usa caché en memoria:", error.message);
      this.redis = null;
    }
  }

  setMemory(key, value, ttlSeconds) {
    this.memory.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  getMemory(key) {
    const entry = this.memory.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async get(key) {
    if (this.redis) {
      try {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.warn("Redis get fallo, se usa cache en memoria:", error.message);
        this.redis = null;
      }
    }
    return this.getMemory(key);
  }

  async set(key, value, ttlSeconds) {
    if (this.redis) {
      try {
        await this.redis.setEx(key, ttlSeconds, JSON.stringify(value));
        return;
      } catch (error) {
        console.warn("Redis set fallo, se usa cache en memoria:", error.message);
        this.redis = null;
      }
    }
    this.setMemory(key, value, ttlSeconds);
  }

  async delete(key) {
    if (this.redis) {
      try {
        await this.redis.del(key);
        return;
      } catch (error) {
        console.warn("Redis delete fallo, se usa cache en memoria:", error.message);
        this.redis = null;
      }
    }
    this.memory.delete(key);
  }

  isRedisEnabled() {
    return Boolean(this.redis);
  }

  // --- Push Subscriptions Management ---
  // Persistencia: Redis (si esta configurado) -> Netlify Blobs -> memoria (ultimo recurso).
  // En Netlify no hay Redis, asi que Blobs es lo que garantiza que las suscripciones
  // sobrevivan entre invocaciones de la lambda (RAM efimera).
  async saveSubscription(dni, subscription) {
    if (this.redis) {
      try {
        await this.redis.hSet("push:subscriptions", dni, JSON.stringify(subscription));
        return;
      } catch (error) {
        console.warn("Redis hSet fallback:", error.message);
      }
    }

    // Blobs: persistente en Netlify y en local (.local-blobs.json)
    try {
      const all = (await this.pushStore.get("push:subscriptions")) || {};
      all[dni] = subscription;
      await this.pushStore.setJSON("push:subscriptions", all);
      this.memory.set(`push:sub:${dni}`, subscription);
      return;
    } catch (error) {
      console.warn("Blobs saveSubscription fallback:", error.message);
    }

    // Memoria (solo si Blobs falla)
    this.memory.set(`push:sub:${dni}`, subscription);
  }

  async getSubscription(dni) {
    if (this.redis) {
      try {
        const val = await this.redis.hGet("push:subscriptions", dni);
        return val ? JSON.parse(val) : null;
      } catch (error) {
        console.warn("Redis hGet fallback:", error.message);
      }
    }

    try {
      const all = await this.pushStore.get("push:subscriptions");
      if (all && all[dni]) return all[dni];
    } catch (error) {
      console.warn("Blobs getSubscription fallback:", error.message);
    }

    return this.memory.get(`push:sub:${dni}`) || null;
  }

  async getAllSubscriptions() {
    if (this.redis) {
      try {
        const all = await this.redis.hGetAll("push:subscriptions");
        return Object.entries(all).map(([dni, sub]) => ({
          dni,
          subscription: JSON.parse(sub)
        }));
      } catch (error) {
        console.warn("Redis hGetAll fallback:", error.message);
      }
    }

    // Unir memoria + Blobs (Blobs tiene prioridad: es lo persistente)
    const map = new Map();
    for (const [key, sub] of this.memory.entries()) {
      if (key.startsWith("push:sub:")) {
        map.set(key.slice("push:sub:".length), sub);
      }
    }

    try {
      const all = await this.pushStore.get("push:subscriptions");
      if (all) {
        for (const [dni, sub] of Object.entries(all)) {
          map.set(dni, sub);
        }
      }
    } catch (error) {
      console.warn("Blobs getAllSubscriptions fallback:", error.message);
    }

    return Array.from(map.entries()).map(([dni, subscription]) => ({
      dni,
      subscription
    }));
  }
}
