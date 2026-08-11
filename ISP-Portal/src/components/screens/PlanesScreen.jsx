import React, { useState, useEffect } from "react";
import { WHATSAPP_URL } from "../../lib/config/portalConfig";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import PageTransition from "../layout/PageTransition.jsx";
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

  const getWhatsAppMessage = (plan) => {
    const isTv = (plan.velocidad || "").toLowerCase().includes("tv") || (plan.nombre || "").toLowerCase().includes("tv");
    
    let planDisplayName = plan.nombre || plan.velocidad;
    if (isTv && plan.descripcion) {
      planDisplayName = `${planDisplayName} (${plan.descripcion})`;
    }

    return `Hola OriNet! Soy ${formatName(customer?.name || "")}, DNI ${customer?.doc_number || ""}. Quiero solicitar información sobre el plan *${planDisplayName}*.`;
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Catálogo de Planes</h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Conocé nuestras opciones de conectividad y encontrá el plan que mejor se adapte a tus necesidades.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[250px] animate-pulse flex flex-col justify-between">
              <div>
                <div className="h-8 bg-white/10 rounded-lg w-3/4 mb-4"></div>
                <div className="h-6 bg-white/10 rounded-lg w-1/2 mb-6"></div>
                <div className="h-10 bg-white/10 rounded-lg w-2/3"></div>
              </div>
              <div className="h-12 bg-white/10 rounded-xl w-full mt-6"></div>
            </div>
          ))}
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
        {!loading && !error && planes.map((plan) => {
          const isTv = (plan.velocidad || "").toLowerCase().includes("tv") || (plan.nombre || "").toLowerCase().includes("tv");
          const mainTitle = isTv ? plan.descripcion : (plan.velocidad || plan.nombre);
          const subTitle = isTv ? (plan.nombre || plan.velocidad) : plan.descripcion;
          const badgeText = isTv ? "Televisión" : "Internet Banda Ancha";

          return (
            <div 
              key={plan.id}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Badge Categoría */}
                <div className="mb-6">
                  <span className="bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(14,165,233,0.15)]">
                    {badgeText}
                  </span>
                </div>
                
                {/* Título Principal (Velocidad o Pantallas) */}
                <div className="mb-4">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tighter drop-shadow-md">
                    {mainTitle}
                  </h2>
                </div>
                
                {/* Subtítulo (Descripción o Nombre del Plan) */}
                <div className="mb-8 min-h-[3rem]">
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {subTitle}
                  </p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>
                
                {/* Precio */}
                <div className="mb-8 flex items-end gap-1.5">
                  <span className="text-4xl font-black text-emerald-400 tracking-tight drop-shadow-md">
                    ${parseFloat(plan.precio).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </span>
                  <span className="text-slate-400 text-sm font-medium mb-1.5">/mes</span>
                </div>
              </div>
              
              <a
                href={WHATSAPP_URL(getWhatsAppMessage(plan))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#25d366] to-[#128c7e] hover:from-[#22c55e] hover:to-[#16a34a] text-white rounded-xl py-4 text-base font-bold shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <WhatsAppIcon size={20} /> Solicitar Plan
              </a>
            </div>
          );
        })}
      </div>
    </div>
    </PageTransition>
  );
}
