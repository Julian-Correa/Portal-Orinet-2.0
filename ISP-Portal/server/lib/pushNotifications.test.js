import { beforeEach, describe, expect, it, vi } from "vitest";
import { enviarPushAClientes } from "./pushNotifications.js";

const { sendNotification, getCache, getCustomerSummaryService } = vi.hoisted(() => ({
  sendNotification: vi.fn(),
  getCache: vi.fn(),
  getCustomerSummaryService: vi.fn(),
}));

vi.mock("web-push", () => ({
  default: { setVapidDetails: vi.fn(), sendNotification },
}));

vi.mock("../app/runtime.js", () => ({
  getCache,
  getCustomerSummaryService,
}));

function suscripciones(...dnis) {
  getCache.mockResolvedValue({
    getAllSubscriptions: async () =>
      dnis.map((dni) => ({ dni, subscription: { endpoint: `https://push/${dni}` } })),
  });
}

function resumenes(porDni) {
  getCustomerSummaryService.mockResolvedValue({
    getSummaryByDni: async (dni) => porDni[dni],
  });
}

function payloadDePrueba() {
  return { title: "Aviso", body: "Mensaje", url: "/facturacion" };
}

describe("enviarPushAClientes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("envia el payload a clientes habilitados", async () => {
    suscripciones("20111222");
    resumenes({ "20111222": { data: { customer: { status: "active", debt: "1000" } } } });

    const armarPayload = vi.fn().mockReturnValue(payloadDePrueba());
    const resultado = await enviarPushAClientes({ armarPayload });

    expect(armarPayload).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith(
      { endpoint: "https://push/20111222" },
      JSON.stringify(payloadDePrueba())
    );
    expect(resultado).toEqual({ enviados: 1, encontrados: 1 });
  });

  it.each(["blocked", "suspendido", "disabled", "no_service"])(
    "no envia a clientes con status %s",
    async (status) => {
      suscripciones("20111222");
      resumenes({ "20111222": { data: { customer: { status, debt: "1000" } } } });

      const armarPayload = vi.fn().mockReturnValue(payloadDePrueba());
      const resultado = await enviarPushAClientes({ armarPayload });

      expect(armarPayload).not.toHaveBeenCalled();
      expect(sendNotification).not.toHaveBeenCalled();
      expect(resultado).toEqual({ enviados: 0, encontrados: 1 });
    }
  );

  it("no envia cuando el filtro descarta al cliente", async () => {
    suscripciones("20111222");
    resumenes({ "20111222": { data: { customer: { status: "active", debt: "0" } } } });

    const armarPayload = vi.fn().mockReturnValue(null);
    const resultado = await enviarPushAClientes({ armarPayload });

    expect(sendNotification).not.toHaveBeenCalled();
    expect(resultado).toEqual({ enviados: 0, encontrados: 1 });
  });

  it("saltea suscripciones sin resumen valido", async () => {
    suscripciones("20111222");
    resumenes({ "20111222": { error: "cliente no encontrado", status: 404 } });

    const armarPayload = vi.fn().mockReturnValue(payloadDePrueba());
    const resultado = await enviarPushAClientes({ armarPayload });

    expect(sendNotification).not.toHaveBeenCalled();
    expect(resultado).toEqual({ enviados: 0, encontrados: 1 });
  });

  it("un fallo en una suscripcion no corta el resto del envio", async () => {
    suscripciones("20111222", "20999888");
    getCustomerSummaryService.mockResolvedValue({
      getSummaryByDni: async (dni) => {
        if (dni === "20111222") throw new Error("isp caido");
        return { data: { customer: { status: "active", debt: "500" } } };
      },
    });

    const armarPayload = vi.fn().mockReturnValue(payloadDePrueba());
    const resultado = await enviarPushAClientes({ armarPayload });

    expect(sendNotification).toHaveBeenCalledTimes(1);
    expect(sendNotification).toHaveBeenCalledWith(
      { endpoint: "https://push/20999888" },
      JSON.stringify(payloadDePrueba())
    );
    expect(resultado).toEqual({ enviados: 1, encontrados: 2 });
  });

  it("no hace nada cuando no hay suscripciones", async () => {
    suscripciones();

    const armarPayload = vi.fn();
    const resultado = await enviarPushAClientes({ armarPayload });

    expect(getCustomerSummaryService).not.toHaveBeenCalled();
    expect(armarPayload).not.toHaveBeenCalled();
    expect(resultado).toEqual({ enviados: 0, encontrados: 0 });
  });
});
