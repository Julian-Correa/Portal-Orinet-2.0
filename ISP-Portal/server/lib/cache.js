import { createClient } from "redis";

export class CacheClient {
  constructor({ redisUrl }) {
    this.redisUrl = redisUrl;
    this.redis = null;
    this.memory = new Map();
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
  async saveSubscription(dni, subscription) {
    if (this.redis) {
      try {
        await this.redis.hSet("push:subscriptions", dni, JSON.stringify(subscription));
        return;
      } catch (error) {
        console.warn("Redis hSet fallback:", error.message);
      }
    }
    // Memory fallback
    let subs = this.memory.get("push:subscriptions");
    if (!subs) {
      subs = new Map();
      this.memory.set("push:subscriptions", subs);
    }
    subs.set(dni, subscription);
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
    // Memory fallback
    const subs = this.memory.get("push:subscriptions");
    return subs ? (subs.get(dni) || null) : null;
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
    // Memory fallback
    const subs = this.memory.get("push:subscriptions");
    if (!subs) return [];
    
    return Array.from(subs.entries()).map(([dni, sub]) => ({
      dni,
      subscription: sub
    }));
  }
}
