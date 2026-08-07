/**
 * Calcula la ventana de fechas permitida para compromisos de pago.
 * 
 * Reglas de negocio (Basadas en el ciclo 26 al 10):
 * - Si hoy es >= 26: la ventana es [26 del mes actual] hasta [10 del mes siguiente].
 * - Si hoy es <= 10: la ventana es [26 del mes anterior] hasta [10 del mes actual].
 * - Si hoy está entre el 11 y el 25: la ventana (próxima a abrir) es [26 del mes actual] hasta [10 del mes siguiente].
 * - NUNCA se pueden elegir fechas pasadas. La fecha mínima de selección siempre es max(hoy, inicio_ventana).
 * 
 * @param {Date} today Fecha base para el cálculo (generalmente hoy).
 * @returns {Object} { start: Date, end: Date, minSelectable: Date, maxSelectable: Date, isOpen: boolean }
 */
export function calculateCompromisoWindow(today = new Date()) {
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  let startYear = currentYear;
  let startMonth = currentMonth;
  let endYear = currentYear;
  let endMonth = currentMonth;

  let isOpen = true;

  if (currentDate >= 26) {
    // Del 26 a fin de mes. Ventana: 26 (este mes) al 10 (mes siguiente).
    endMonth = currentMonth + 1;
    if (endMonth > 11) {
      endMonth = 0;
      endYear++;
    }
  } else if (currentDate <= 10) {
    // Del 1 al 10. Ventana: 26 (mes pasado) al 10 (este mes).
    startMonth = currentMonth - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear--;
    }
  } else {
    // Del 11 al 25. La ventana comercialmente está "cerrada" o próxima.
    // El sistema calculará la próxima ventana (26 de este mes al 10 del mes siguiente).
    isOpen = false;
    endMonth = currentMonth + 1;
    if (endMonth > 11) {
      endMonth = 0;
      endYear++;
    }
  }

  const startDate = new Date(startYear, startMonth, 26);
  const endDate = new Date(endYear, endMonth, 10);
  
  // NUNCA se permiten fechas pasadas
  const minSelectable = new Date(Math.max(today.getTime(), startDate.getTime()));
  
  // Limpiamos la hora para que la comparación sea justa en calendarios (00:00:00)
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  minSelectable.setHours(0, 0, 0, 0);
  
  // Si estamos en los días 11-25 y la ventana está cerrada, minSelectable = 26 de este mes.
  if (!isOpen) {
    minSelectable.setTime(startDate.getTime());
  }

  return {
    start: startDate,
    end: endDate,
    minSelectable,
    maxSelectable: endDate,
    isOpen
  };
}

/**
 * Evalúa si un cliente suspendido puede pedir compromiso hoy.
 */
export function isSuspendedCompromisoAllowed(today, allowedDays = [26, 27]) {
  const currentDate = today.getDate();
  return allowedDays.includes(currentDate);
}
