import { describe, expect, it } from "vitest";
import { AVISOS, armarPayloadAviso, textosPorDefecto } from "./notificaciones.js";

describe("armarPayloadAviso", () => {
  it("usa los textos por defecto cuando no hay customizacion", () => {
    expect(armarPayloadAviso({ dia: 1, customer: { debt: "0" } })).toEqual({
      title: AVISOS[1].title,
      body: AVISOS[1].body,
      url: "/facturacion",
    });
    expect(armarPayloadAviso({ dia: 9, customer: { debt: "100" } })).toEqual({
      title: AVISOS[9].title,
      body: AVISOS[9].body,
      url: "/facturacion",
    });
    expect(armarPayloadAviso({ dia: 24, customer: { debt: "100" } })).toEqual({
      title: AVISOS[24].title,
      body: AVISOS[24].body,
      url: "/facturacion",
    });
  });

  it("usa el texto editado cuando viene informado", () => {
    const payload = armarPayloadAviso({
      dia: 9,
      customer: { debt: "100" },
      texto: { title: "Titulo nuevo", body: "Mensaje nuevo" },
    });

    expect(payload).toEqual({ title: "Titulo nuevo", body: "Mensaje nuevo", url: "/facturacion" });
  });

  it("vuelve al default cuando el texto editado esta vacio o en blanco", () => {
    expect(armarPayloadAviso({ dia: 9, customer: { debt: "100" }, texto: { title: "  ", body: "" } })).toEqual({
      title: AVISOS[9].title,
      body: AVISOS[9].body,
      url: "/facturacion",
    });
  });

  it("no exige deuda para el aviso del dia 1", () => {
    expect(armarPayloadAviso({ dia: 1, customer: { debt: "0", duedebt: "0" } })).not.toBeNull();
  });

  it("exige deuda para los avisos de vencimiento", () => {
    expect(armarPayloadAviso({ dia: 9, customer: { debt: "0", duedebt: "0" } })).toBeNull();
    expect(armarPayloadAviso({ dia: 24, customer: { debt: "0", duedebt: "0" } })).toBeNull();
    expect(armarPayloadAviso({ dia: 9, customer: { debt: "0", duedebt: "150" } })).not.toBeNull();
    expect(armarPayloadAviso({ dia: 24, customer: { debt: "800", duedebt: "0" } })).not.toBeNull();
  });

  it("devuelve null para dias que no son avisos", () => {
    expect(armarPayloadAviso({ dia: 15, customer: { debt: "100" } })).toBeNull();
    expect(armarPayloadAviso({ dia: undefined, customer: { debt: "100" } })).toBeNull();
  });

  it("expone los textos por defecto de cada dia", () => {
    expect(textosPorDefecto()).toEqual({
      1: { title: AVISOS[1].title, body: AVISOS[1].body },
      9: { title: AVISOS[9].title, body: AVISOS[9].body },
      24: { title: AVISOS[24].title, body: AVISOS[24].body },
    });
  });
});
