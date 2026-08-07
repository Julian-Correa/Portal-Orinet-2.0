import React, { useState, useEffect } from "react";
import { WHATSAPP_URL } from "../../lib/config/portalConfig";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import { formatName } from "../../lib/utils/format";
const PORTAL_API_BASE = import.meta.env.VITE_PORTAL_API_BASE || "";

export default function PlanesScreen({ customer }) {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPlanes() {
      try {
        const response = await fetch(`${PORTAL_API_BASE}/planes`);
        if (!response.ok) throw new Error("Error al cargar los planes");
        const data = await response.json();
        setPlanes(data || []);
      } catch (err) {
        setError("No pudimos cargar el catálogo de planes en este momento.");
      } finally {
        setLoading(false);
      }
    }
    loadPlanes();
  }, []);

  const getWhatsAppMessage = (planName) => {
    return `Hola OriNet! Soy ${formatName(customer?.name || "")}, DNI ${customer?.doc_number || ""}. Quiero solicitar información para cambiarme al plan *${planName}*.`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-[fadeUp_0.4s_ease]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Catálogo de Planes</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Conocé nuestras opciones de conectividad y encontrá el plan que mejor se adapte a tus necesidades.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38bdf8]"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center max-w-lg mx-auto">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && planes.length === 0 && (
        <div className="bg-white/5 border border-white/10 text-slate-300 p-8 rounded-xl text-center max-w-lg mx-auto">
          <p className="text-xl mb-2">¡Próximamente!</p>
          <p className="text-sm text-slate-400">Estamos actualizando nuestro catálogo comercial.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && !error && planes.map((plan) => (
          <div 
            key={plan.id}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col justify-between hover:bg-white/10 transition-colors duration-300"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{plan.nombre}</h2>
                {plan.velocidad && (
                  <span className="bg-[#38bdf8]/10 text-[#38bdf8] text-sm font-bold px-3 py-1 rounded-full border border-[#38bdf8]/20">
                    {plan.velocidad}
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-[#10b981]">{plan.precio}</span>
                <span className="text-slate-400 text-sm ml-1">/mes</span>
              </div>
              
              {plan.descripcion && (
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {plan.descripcion}
                </p>
              )}
            </div>
            
            <a
              href={WHATSAPP_URL(getWhatsAppMessage(plan.nombre))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#25d366] to-[#128c7e] hover:from-[#22c55e] hover:to-[#16a34a] text-white rounded-xl py-3.5 font-bold shadow-[0_4px_16px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.02]"
            >
              <WhatsAppIcon size={18} /> Solicitar Plan
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
