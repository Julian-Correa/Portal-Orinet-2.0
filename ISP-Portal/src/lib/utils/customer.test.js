import { describe, expect, it } from "vitest";
import { isServiceEnabled, getServiceStatus } from "./customer.js";

describe("isServiceEnabled - Clientes habilitados", () => {
  it("acepta los estados de servicio activo", () => {
    expect(isServiceEnabled("active")).toBe(true);
    expect(isServiceEnabled("activo")).toBe(true);
    expect(isServiceEnabled("enabled")).toBe(true);
  });

  it("normaliza mayusculas y espacios", () => {
    expect(isServiceEnabled("Active")).toBe(true);
    expect(isServiceEnabled("  ACTIVO  ")).toBe(true);
  });

  it("rechaza estados suspendidos y sin servicio", () => {
    expect(isServiceEnabled("blocked")).toBe(false);
    expect(isServiceEnabled("bloqueado")).toBe(false);
    expect(isServiceEnabled("suspended")).toBe(false);
    expect(isServiceEnabled("suspendido")).toBe(false);
    expect(isServiceEnabled("disabled")).toBe(false);
    expect(isServiceEnabled("no_service")).toBe(false);
  });

  it("rechaza estados vacios o desconocidos", () => {
    expect(isServiceEnabled("")).toBe(false);
    expect(isServiceEnabled(null)).toBe(false);
    expect(isServiceEnabled(undefined)).toBe(false);
    expect(isServiceEnabled("pendiente")).toBe(false);
  });

  it("coincide con lo que la UI muestra como Activo", () => {
    const estados = ["active", "activo", "enabled", "blocked", "no_service", "otro"];
    for (const status of estados) {
      const habilitado = isServiceEnabled(status);
      const etiquetaActivo = getServiceStatus(status).label === "Activo";
      expect(habilitado).toBe(etiquetaActivo);
    }
  });
});
