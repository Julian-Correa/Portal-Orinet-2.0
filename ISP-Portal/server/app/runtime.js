import { env } from "../config/env.js";
import { CacheClient } from "../lib/cache.js";
import { IspRepository } from "../repositories/ispRepository.js";
import { CustomerSummaryService } from "../services/customerSummaryService.js";

import { configRepository } from "../repositories/configRepository.js";

let runtimePromise;

export async function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const cache = new CacheClient({ redisUrl: env.redisUrl });
      await cache.connect();

      const ispRepository = new IspRepository({
        ispConfig: env.isp,
        cache,
        tokenTtlSeconds: env.tokenTtlSeconds,
        requestTimeoutMs: env.requestTimeoutMs,
      });

      const customerSummaryService = new CustomerSummaryService({
        cache,
        ispRepository,
        configRepository,
        cacheTtlSeconds: env.cacheTtlSeconds,
        billingRules: {
          // cutDay y recargoSegundoVencimiento siguen en env por ahora (no estaban explicitamente en Blobs)
          // pero el servicio ahora usará configRepository para los dinámicos
          recargoSegundoVencimiento: env.recargoSegundoVencimiento,
          cutDay: env.cutDay,
        },
      });

      return { cache, customerSummaryService };
    })();
  }

  return runtimePromise;
}

export async function getCustomerSummaryService() {
  return (await getRuntime()).customerSummaryService;
}

export async function getHealthStatus() {
  const { cache } = await getRuntime();
  return {
    ok: true,
    redis: cache.isRedisEnabled(),
  };
}
