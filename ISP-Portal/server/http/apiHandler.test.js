import { describe, expect, it, vi } from "vitest";

import { createApiHandler } from "./apiHandler.js";
import { env } from "../config/env.js";
import { AVISOS } from "../lib/notificaciones.js";

function createService() {
  return {
    getSummaryByDni: vi.fn().mockResolvedValue({
      cacheStatus: "MISS",
      data: {
        customer: { id: 7 },
        cutDay: 26,
        invoiceUrl: null,
        planInfo: { plan: "300 MB", price: "$ 12.345,00" },
        recargoReconexion: 2000,
        recargoSegundoVencimiento: 2000,
      },
      status: 200,
    }),
    updateEmail: vi.fn().mockResolvedValue({
      data: { customer: { id: 7, contact_emails: [{ email: "ada@example.com" }] } },
      status: 200,
    }),
  };
}

describe("apiHandler", () => {
  it("resuelve el path canonico de Netlify", async () => {
    const service = createService();
    const handler = createApiHandler({
      getCustomerSummaryService: async () => service,
      getHealthStatus: async () => ({ ok: true, redis: false }),
    });

    const response = await handler({
      headers: {},
      httpMethod: "GET",
      path: "/.netlify/functions/api/customer-summary",
      queryStringParameters: { dni: "20123456" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-cache"]).toBe("MISS");
    expect(JSON.parse(response.body)).toEqual(expect.objectContaining({ cutDay: 26 }));
    expect(service.getSummaryByDni).toHaveBeenCalledWith("20123456");
  });

  it("bloquea el PUT sin Origin permitido", async () => {
    const service = createService();
    const handler = createApiHandler({
      getCustomerSummaryService: async () => service,
      getHealthStatus: async () => ({ ok: true, redis: false }),
    });

    const response = await handler({
      body: JSON.stringify({ email: "ada@example.com" }),
      headers: {},
      httpMethod: "PUT",
      isBase64Encoded: false,
      path: "/customers/20123456/email",
    });

    expect(response.statusCode).toBe(403);
    expect(service.updateEmail).not.toHaveBeenCalled();
  });
});

describe("apiHandler - avisos push", () => {
  function createPushHandler() {
    const configRepo = {
      getAvisosPush: vi.fn().mockResolvedValue({}),
      updateAvisosPush: vi.fn(),
    };
    const enviarPush = vi.fn(async ({ armarPayload }) => {
      const payload = armarPayload({ status: "active", debt: "500" });
      return { enviados: payload ? 1 : 0, encontrados: 2 };
    });

    const handler = createApiHandler({
      getCustomerSummaryService: async () => createService(),
      getHealthStatus: async () => ({ ok: true, redis: false }),
      configRepo,
      enviarPush,
    });

    return { handler, configRepo, enviarPush };
  }

  const adminHeaders = () => ({ "x-admin-code": env.adminAccessCode });

  it("ejecuta manualmente el aviso de un dia con el texto guardado", async () => {
    const { handler, configRepo, enviarPush } = createPushHandler();
    configRepo.getAvisosPush.mockResolvedValue({ 9: { title: "Titulo guardado", body: "Mensaje guardado" } });

    const response = await handler({
      path: "/api/admin/push/trigger",
      httpMethod: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ dia: 9 }),
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ ok: true, dia: 9, enviados: 1, encontrados: 2 });

    const { armarPayload } = enviarPush.mock.calls[0][0];
    expect(armarPayload({ debt: "100" })).toEqual({
      title: "Titulo guardado",
      body: "Mensaje guardado",
      url: "/facturacion",
    });
  });

  it("ejecuta el aviso con el texto enviado desde el panel", async () => {
    const { handler, enviarPush } = createPushHandler();

    const response = await handler({
      path: "/api/admin/push/trigger",
      httpMethod: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ dia: 1, title: "Titular nuevo", body: "Mensaje nuevo" }),
    });

    expect(response.statusCode).toBe(200);

    const { armarPayload } = enviarPush.mock.calls[0][0];
    expect(armarPayload({ debt: "0" })).toEqual({
      title: "Titular nuevo",
      body: "Mensaje nuevo",
      url: "/facturacion",
    });
  });

  it("valida el codigo admin y el dia", async () => {
    const { handler, enviarPush } = createPushHandler();

    const sinAdmin = await handler({
      path: "/api/admin/push/trigger",
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ dia: 9 }),
    });
    expect(sinAdmin.statusCode).toBe(401);

    const diaInvalido = await handler({
      path: "/api/admin/push/trigger",
      httpMethod: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ dia: 15 }),
    });
    expect(diaInvalido.statusCode).toBe(400);
    expect(enviarPush).not.toHaveBeenCalled();
  });

  it("devuelve los textos por defecto y los guardados", async () => {
    const { handler, configRepo } = createPushHandler();
    configRepo.getAvisosPush.mockResolvedValue({ 1: { title: "", body: "Editado" } });

    const response = await handler({
      path: "/api/admin/push/avisos",
      httpMethod: "GET",
      headers: adminHeaders(),
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.defaults["9"]).toEqual({ title: AVISOS[9].title, body: AVISOS[9].body });
    expect(body.avisos).toEqual({ 1: { title: "", body: "Editado" } });
  });

  it("guarda los textos editados", async () => {
    const { handler, configRepo } = createPushHandler();
    configRepo.updateAvisosPush.mockResolvedValue({ 24: { title: "Nuevo", body: "Texto" } });

    const response = await handler({
      path: "/api/admin/push/avisos",
      httpMethod: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({ 24: { title: "Nuevo", body: "Texto" } }),
    });

    expect(response.statusCode).toBe(200);
    expect(configRepo.updateAvisosPush).toHaveBeenCalledWith({ 24: { title: "Nuevo", body: "Texto" } });
    expect(JSON.parse(response.body)).toEqual({ avisos: { 24: { title: "Nuevo", body: "Texto" } } });
  });
});
