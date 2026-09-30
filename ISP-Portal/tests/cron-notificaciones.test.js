import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler, { config } from "../netlify/functions/cron-notificaciones.js";

const { enviarPushAClientes, getAvisosPush } = vi.hoisted(() => ({
  enviarPushAClientes: vi.fn(),
  getAvisosPush: vi.fn(),
}));

vi.mock("../server/lib/pushNotifications.js", () => ({ enviarPushAClientes }));

vi.mock("../server/repositories/configRepository.js", () => ({
  configRepository: { getAvisosPush },
}));

describe("cron-notificaciones (vencimientos 9 y 24)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.useFakeTimers({ toFake: ["Date"] });
    getAvisosPush.mockResolvedValue({ 9: { title: "", body: "" }, 24: { title: "", body: "" } });
    enviarPushAClientes.mockResolvedValue({ enviados: 2, encontrados: 3 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("esta programado los dias 9 y 24 a las 10:00", () => {
    expect(config.schedule).toBe("0 10 9,24 * *");
  });

  it("no corre en otros dias", async () => {
    vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0));

    const response = await handler();

    expect(enviarPushAClientes).not.toHaveBeenCalled();
    expect(await response.text()).toBe("Not the target day");
  });

  it("el dia 9 avisa sobre el 1er vencimiento solo a deudores", async () => {
    vi.setSystemTime(new Date(2026, 0, 9, 10, 0, 0));

    await handler();

    const { armarPayload } = enviarPushAClientes.mock.calls[0][0];
    expect(armarPayload({ debt: "1000", duedebt: "0" })).toEqual({
      title: "Aviso de Vencimiento",
      body: "Te recordamos que el 1er vencimiento de tu factura esta proximo.",
      url: "/facturacion",
    });
    expect(armarPayload({ debt: "0", duedebt: "0" })).toBeNull();
  });

  it("el dia 24 avisa sobre el 2do vencimiento y el corte", async () => {
    vi.setSystemTime(new Date(2026, 0, 24, 10, 0, 0));

    await handler();

    const { armarPayload } = enviarPushAClientes.mock.calls[0][0];
    expect(armarPayload({ debt: "0", duedebt: "500" })).toEqual({
      title: "Aviso Importante",
      body: "Aviso de 2do vencimiento y fecha limite de corte.",
      url: "/facturacion",
    });
    expect(armarPayload({ debt: "0", duedebt: "0" })).toBeNull();
  });

  it("usa el texto guardado desde el panel para el dia correspondiente", async () => {
    getAvisosPush.mockResolvedValue({ 9: { title: "", body: "Mensaje guardado" } });
    vi.setSystemTime(new Date(2026, 0, 9, 10, 0, 0));

    await handler();

    const { armarPayload } = enviarPushAClientes.mock.calls[0][0];
    expect(armarPayload({ debt: "100" })).toEqual({
      title: "Aviso de Vencimiento",
      body: "Mensaje guardado",
      url: "/facturacion",
    });
  });

  it("informa cuando no hay suscripciones", async () => {
    vi.setSystemTime(new Date(2026, 0, 9, 10, 0, 0));
    enviarPushAClientes.mockResolvedValue({ enviados: 0, encontrados: 0 });

    const response = await handler();

    expect(await response.text()).toBe("No subscriptions found");
  });
});
