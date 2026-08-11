import { describe, expect, it } from "vitest";
import { calculateCompromisoWindow, isSuspendedCompromisoAllowed } from "./compromisos.js";

describe("Compromisos de Pago - Lógica de Fechas", () => {
  
  describe("Días de ciclo normal (26 al 10)", () => {
    it("Calcula correctamente si hoy es 27 de Agosto", () => {
      // 27 de agosto 2026
      const today = new Date(2026, 7, 27); // Mes 7 = Agosto
      const result = calculateCompromisoWindow(today);
      
      expect(result.isOpen).toBe(true);
      
      // Inicio ventana = 26 de agosto
      expect(result.start.getFullYear()).toBe(2026);
      expect(result.start.getMonth()).toBe(7);
      expect(result.start.getDate()).toBe(26);
      
      // Fin ventana = 10 de septiembre
      expect(result.end.getFullYear()).toBe(2026);
      expect(result.end.getMonth()).toBe(8); // Mes 8 = Septiembre
      expect(result.end.getDate()).toBe(10);
      
      // Mínima seleccionable = 27 de agosto (hoy), no puede elegir 26 porque ya pasó
      expect(result.minSelectable.getDate()).toBe(27);
    });

    it("Calcula correctamente si hoy es 5 de Septiembre", () => {
      // 5 de septiembre 2026
      const today = new Date(2026, 8, 5); 
      const result = calculateCompromisoWindow(today);
      
      expect(result.isOpen).toBe(true);
      
      // Inicio ventana = 26 de agosto
      expect(result.start.getMonth()).toBe(7);
      expect(result.start.getDate()).toBe(26);
      
      // Fin ventana = 10 de septiembre
      expect(result.end.getMonth()).toBe(8);
      expect(result.end.getDate()).toBe(10);
      
      // Mínima seleccionable = 5 de septiembre (hoy), no puede elegir agosto porque ya pasó
      expect(result.minSelectable.getDate()).toBe(5);
    });
  });

  describe("Días fuera de ciclo (11 al 25)", () => {
    it("Permite a clientes habilitados seleccionar para la próxima ventana si hoy es 15 de Agosto", () => {
      // 15 de agosto 2026
      const today = new Date(2026, 7, 15);
      const result = calculateCompromisoWindow(today, false); // isSuspended = false
      
      expect(result.isOpen).toBe(true);
      
      // Próxima ventana = 26 de agosto al 10 de septiembre
      expect(result.start.getMonth()).toBe(7);
      expect(result.start.getDate()).toBe(26);
      
      // Mínima seleccionable debe saltar al 26 de agosto (no puede elegir 15)
      expect(result.minSelectable.getDate()).toBe(26);
      expect(result.minSelectable.getMonth()).toBe(7);
    });

    it("Cierra la ventana para clientes suspendidos si hoy es 15 de Agosto", () => {
      // 15 de agosto 2026
      const today = new Date(2026, 7, 15);
      const result = calculateCompromisoWindow(today, true); // isSuspended = true
      
      expect(result.isOpen).toBe(false);
      
      // Mínima seleccionable igual salta al 26
      expect(result.minSelectable.getDate()).toBe(26);
      expect(result.minSelectable.getMonth()).toBe(7);
    });
  });

  describe("Cambio de año", () => {
    it("Calcula correctamente cruzando Diciembre a Enero", () => {
      // 28 de diciembre 2026
      const today = new Date(2026, 11, 28); // Mes 11 = Diciembre
      const result = calculateCompromisoWindow(today);
      
      expect(result.start.getFullYear()).toBe(2026);
      expect(result.start.getMonth()).toBe(11); // Diciembre
      
      expect(result.end.getFullYear()).toBe(2027); // Año nuevo!
      expect(result.end.getMonth()).toBe(0); // Enero
      expect(result.end.getDate()).toBe(10);
    });
  });

  describe("Clientes Suspendidos", () => {
    it("Permite solicitar los días 26 y 27 (por defecto)", () => {
      expect(isSuspendedCompromisoAllowed(new Date(2026, 7, 26))).toBe(true);
      expect(isSuspendedCompromisoAllowed(new Date(2026, 7, 27))).toBe(true);
      expect(isSuspendedCompromisoAllowed(new Date(2026, 7, 28))).toBe(false); // 28 no
      expect(isSuspendedCompromisoAllowed(new Date(2026, 7, 10))).toBe(false); // 10 no
    });
    
    it("Soporta configuración dinámica de días desde la BD", () => {
      const dbConfig = [10, 15, 20];
      expect(isSuspendedCompromisoAllowed(new Date(2026, 7, 15), dbConfig)).toBe(true);
      expect(isSuspendedCompromisoAllowed(new Date(2026, 7, 26), dbConfig)).toBe(false);
    });
  });
});
