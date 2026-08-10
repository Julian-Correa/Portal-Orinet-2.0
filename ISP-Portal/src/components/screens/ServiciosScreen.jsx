import React from "react";
import WhatsAppIcon from "../icons/WhatsAppIcon.jsx";
import { WHATSAPP_SOPORTE_URL } from "../../lib/config/portalConfig.js";
import { formatName } from "../../lib/utils/format.js";

export default function ServiciosScreen({ planInfo, customer, extras = [] }) {
  // Extraemos los extra del cliente (vienen en crudo de ISPCube)
  const legacyExtras = [
    customer?.extra1,
    customer?.extra2,
    customer?.extra3
  ].filter(extra => extra && typeof extra === 'string' && extra.trim() !== "").map(e => ({ description: e }));

  const allExtras = [...(extras || []), ...legacyExtras];

  const soporteMsg = customer ? `Hola, soy ${formatName(customer.name)}, DNI ${customer.doc_number}, código de cliente ${customer.code}, domicilio ${customer.address}. Estoy comunicándome para reportar que no cuento con servicio de internet y solicitar asistencia técnica.` : "";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-[fadeUp_0.4s_ease]">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Mis Servicios</h1>
        <p className="text-slate-400 mb-8">Detalle de tu plan actual y servicios adicionales contratados.</p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🌐</span> Internet Principal
          </h2>
          <div className="bg-black/20 rounded-lg p-5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Plan Contratado</p>
              <p className="text-2xl font-bold text-white">{planInfo?.plan || "No informado"}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Valor Mensual</p>
              <p className="text-2xl font-bold text-[#10b981]">{planInfo?.price || "No informado"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📦</span> Servicios Adicionales (Extras)
          </h2>
          
          {allExtras.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allExtras.map((extra, index) => (
                <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/5 flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-[#38bdf8] text-xl">✧</span>
                    <p className="text-slate-200 font-medium leading-relaxed flex-1">{extra.description}</p>
                  </div>
                  {extra.price && (
                    <p className="text-sm font-bold text-[#10b981] ml-6">
                      ${parseFloat(extra.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black/20 rounded-lg p-6 border border-white/5 text-center">
              <p className="text-slate-400 italic">No hay servicios extra registrados en tu cuenta.</p>
            </div>
          )}
        </div>

        <div
          className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl shrink-0 bg-sky-500/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.12 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 5.61 5.61l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <p className="m-0 text-sky-300 font-bold text-base">Soporte técnico</p>
              <p className="m-0 text-slate-400 text-sm">Sin servicio o problemas de conexión</p>
            </div>
          </div>
          <a
            href={WHATSAPP_SOPORTE_URL(soporteMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 shrink-0 bg-[#25d366]/10 border border-[#25d366]/30 text-[#4ade80] hover:bg-[#25d366]/20 transition-colors rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
          >
            <WhatsAppIcon size={18} /> Contactar soporte
          </a>
        </div>

      </div>
    </div>
  );
}
