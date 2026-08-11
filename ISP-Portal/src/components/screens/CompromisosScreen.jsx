import React, { useState } from "react";
import { WHATSAPP_URL } from "../../lib/config/portalConfig";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import PageTransition from "../layout/PageTransition.jsx";
import { formatName } from "../../lib/utils/format";
import { getServiceStatus } from "../../lib/utils/customer";
import { calculateCompromisoWindow, isSuspendedCompromisoAllowed } from "../../lib/utils/compromisos";

export default function CompromisosScreen({ customer }) {
  const [selectedDate, setSelectedDate] = useState("");
  const today = new Date();
  
  const serviceStatus = getServiceStatus(customer?.status);
  const isSuspended = serviceStatus.suspended;
  
  // Lógica para detectar si es un deudor viejo (bloqueado en un mes anterior al actual)
  let isOldDebtor = false;
  if (isSuspended && customer?.block_date) {
    const blockDate = new Date(customer.block_date);
    // Comparar año y mes
    if (
      blockDate.getFullYear() < today.getFullYear() ||
      (blockDate.getFullYear() === today.getFullYear() && blockDate.getMonth() < today.getMonth())
    ) {
      isOldDebtor = true;
    }
  }

  const windowInfo = calculateCompromisoWindow(today, isSuspended);
  const allowedForSuspended = isSuspended ? isSuspendedCompromisoAllowed(today) : true;
  
  const canRequest = isSuspended ? allowedForSuspended : windowInfo.isOpen;
  
  // Usar hora local para evitar desfasajes por zona horaria con toISOString()
  const formatDateForInput = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const minDate = formatDateForInput(windowInfo.minSelectable);
  const maxDate = formatDateForInput(windowInfo.maxSelectable);

  // Validar si la fecha seleccionada está dentro del rango
  const isDateValid = selectedDate && selectedDate >= minDate && selectedDate <= maxDate;

  const getWhatsAppMessage = () => {
    if (!isDateValid) return "";
    
    // Convert YYYY-MM-DD to DD/MM/YYYY for the message
    const [year, month, day] = selectedDate.split("-");
    const formattedSelectedDate = `${day}/${month}/${year}`;
    
    return `Hola OriNet! Soy ${formatName(customer?.name || "")}, DNI ${customer?.doc_number || ""}. Solicito un compromiso de pago. Me comprometo a abonar el saldo pendiente el día ${formattedSelectedDate}.`;
  };

  return (
    <PageTransition>
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 mb-20 md:mb-0">
        <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">Compromiso de Pago</h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto px-2">
          Solicitá una prórroga para el pago de tu factura.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-8 w-full max-w-2xl mx-auto shadow-2xl">
        {isOldDebtor ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/20 text-red-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Bloqueo por deuda antigua</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-6">
              No puede generar compromiso de pago. Para más información comunicarse por WhatsApp.
            </p>
            <a
              href={WHATSAPP_URL(`Hola OriNet soy ${formatName(customer?.name || "")}, DNI ${customer?.doc_number || ""} y quiero restablecer mi servicio con DEUDA.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#1ebd5b] transition-all shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95"
            >
              <WhatsAppIcon />
              <span>Contactar Soporte</span>
            </a>
          </div>
        ) : !canRequest ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/20 text-red-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Período cerrado</h3>
            <p className="text-sm sm:text-base text-slate-400">
              {isSuspended 
                ? "Los clientes con servicio suspendido solo pueden solicitar compromisos de pago los días 26 y 27 de cada mes." 
                : "Actualmente no se encuentra abierto el período para solicitar compromisos de pago. Estará disponible a partir del día 26."}
            </p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-100">
              <p className="text-xs sm:text-sm">
                <strong>Información:</strong> Puedes solicitar fecha de pago hasta el {windowInfo.end.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' })}.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-yellow-200">
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong>Importante:</strong> El compromiso tiene un costo de $2000 y en caso de que no se abone en la fecha indicada se abonará +$2000 de reconexión.
              </p>
            </div>
            
            <div>
              <label htmlFor="compromise-date" className="block text-sm font-medium text-slate-300 mb-2">
                ¿Qué día te comprometes a pagar?
              </label>
                <input
                  type="date"
                  id="compromise-date"
                  value={selectedDate}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full max-w-full min-w-0 bg-slate-800/50 border border-slate-600 text-white rounded-xl px-3 sm:px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition-all appearance-none"
                  style={{ display: "block" }}
                />
              <p className="mt-2 text-xs text-slate-400">
                Seleccioná una fecha válida dentro del rango permitido.
              </p>
              
              {selectedDate && !isDateValid && (
                <p className="mt-2 text-xs text-red-400 font-medium">
                  La fecha seleccionada no está permitida.
                </p>
              )}
            </div>

            <a
              href={isDateValid ? WHATSAPP_URL(getWhatsAppMessage()) : "#"}
              target={isDateValid ? "_blank" : "_self"}
              rel={isDateValid ? "noopener noreferrer" : ""}
              className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-white transition-all transform ${
                isDateValid 
                  ? "bg-[#25D366] hover:bg-[#1ebd5b] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#25D366]/20" 
                  : "bg-slate-700 cursor-not-allowed opacity-50"
              }`}
              onClick={(e) => {
                if (!isDateValid) {
                  e.preventDefault();
                }
              }}
            >
              <WhatsAppIcon />
              <span className="text-center">Solicitar Compromiso</span>
            </a>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}