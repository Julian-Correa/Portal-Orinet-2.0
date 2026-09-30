import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler, { config } from "../netlify/functions/cron-facturacion.js";

const { enviarPushAClientes, getAvisosPush } = vi.hoisted(() => ({
  enviarPushAClientes: vi.fn(),
  getAvisosPush: vi.fn(),
}));

vi.mock("../server/lib/pushNotifications.js", () => ({ enviarPushAClientes }));

vi.mock("../server/repositories/configRepository.js", () => ({
  configRepository: { getAvisosPush },
}));

describe("cron-facturacion (aviso 1er dia de cada mes)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 0, 1, 10, 0, 0));
    getAvisosPush.mockResolvedValue({ 1: { title: "", body: "" } });
    enviarPushAClientes.mockResolvedValue({ enviados: 3, encontrados: 4 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("esta programado el 1 de cada mes a las 10:00", () => {
    expect(config.schedule).toBe("0 10 1 * *");
  });

  it("envia el aviso el 1er dia del mes", async () => {
    const response = await handler();

    expect(enviarPushAClientes).toHaveBeenCalledTimes(1);
    expect(await response.text()).toBe("Notificaciones enviadas: 3");
    expect(response.status).toBe(200);
  });

  it("anuncia la facturacion disponible sin importar la deuda", async () => {
    await handler();

    const { armarPayload } = enviarPushAClientes.mock.calls[0][0];
    expect(armarPayload({ status: "active", debt: "0", duedebt: "0" })).toEqual({
      title: "Facturacion disponible",
      body: "Ya esta disponible tu factura del mes. Ingresa al portal para consultarla y abonarla.",
      url: "/facturacion",
    });
  });

  it("usa el texto guardado desde el panel cuando existe", async () => {
    getAvisosPush.mockResolvedValue({ 1: { title: "Titulo custom", body: "Mensaje custom" } });

    await handler();

    const { armarPayload } = enviarPushAClientes.mock.calls[0][0];
    expect(armarPayload({ debt: "0" })).toEqual({
      title: "Titulo custom",
      body: "Mensaje custom",
      url: "/facturacion",
    });
  });

  it("no corre en los demas dias del mes", async () => {
    vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0));

    const response = await handler();

    expect(enviarPushAClientes).not.toHaveBeenCalled();
    expect(await response.text()).toBe("Not the target day");
  });

  it("informa cuando no hay suscripciones", async () => {
    enviarPushAClientes.mockResolvedValue({ enviados: 0, encontrados: 0 });

    const response = await handler();

    expect(await response.text()).toBe("No subscriptions found");
  });
});
