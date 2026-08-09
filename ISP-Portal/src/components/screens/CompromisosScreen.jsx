import React, { useState } from "react";
import { WHATSAPP_URL } from "../../lib/config/portalConfig";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import { formatName } from "../../lib/utils/format";
import { getServiceStatus } from "../../lib/utils/customer";
import { calculateCompromisoWindow, isSuspendedCompromisoAllowed } from "../../lib/utils/compromisos";

export default function CompromisosScreen({ customer }) {
  const [selectedDate, setSelectedDate] = useState("");
  const today = new Date();
  
  const serviceStatus = getServiceStatus(customer?.status);
  const isSuspended = serviceStatus.suspended;
  
  const windowInfo = calculateCompromisoWindow(today);
  const allowedForSuspended = isSuspended ? isSuspendedCompromisoAllowed(today) : true;
  
  const canRequest = isSuspended ? allowedForSuspended : windowInfo.isOpen;
  
  const formatDateForInput = (dateObj) => {
    return dateObj.toISOString().split("T")[0];
  };

  const minDate = formatDateForInput(windowInfo.minSelectable);
  const maxDate = formatDateForInput(windowInfo.maxSelectable);

  const getWhatsAppMessage = () => {
    if (!selectedDate) return "";
    
    // Convert YYYY-MM-DD to DD/MM/YYYY for the message
    const [year, month, day] = selectedDate.split("-");
    const formattedSelectedDate = `${day}/${month}/${year}`;
    
    return `Hola OriNet! Soy ${formatName(customer?.name || "")}, DNI ${customer?.doc_number || ""}. Solicito un compromiso de pago. Me comprometo a abonar el saldo pendiente el día ${formattedSelectedDate}.`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-[fadeUp_0.4s_ease]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Compromiso de Pago</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Solicitá una prórroga para el pago de tu factura.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl">
        {!canRequest ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Período cerrado</h3>
            <p className="text-slate-400">
              {isSuspended 
                ? "Los clientes con servicio suspendido solo pueden solicitar compromisos de pago los días 26 y 27 de cada mes." 
                : "Actualmente no se encuentra abierto el período para solicitar compromisos de pago. Estará disponible a partir del día 26."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-100">
              <p className="text-sm">
                <strong>Información:</strong> Puedes solicitar fecha de pago hasta el {windowInfo.end.toLocaleDateString("es-AR", { day: '2-digit', month: '2-digit' })}.
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
                className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition-all"
              />
              <p className="mt-2 text-xs text-slate-400">
                Seleccioná una fecha dentro del rango permitido.
              </p>
            </div>

            <a
              href={`${WHATSAPP_URL}?text=${encodeURIComponent(getWhatsAppMessage())}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white transition-all transform ${
                selectedDate 
                  ? "bg-[#25D366] hover:bg-[#1ebd5b] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#25D366]/20" 
                  : "bg-slate-700 cursor-not-allowed opacity-50"
              }`}
              onClick={(e) => {
                if (!selectedDate) {
                  e.preventDefault();
                }
              }}
            >
              <WhatsAppIcon />
              <span>Solicitar Compromiso por WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
