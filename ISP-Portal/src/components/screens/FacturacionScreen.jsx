import React from "react";
import DownloadIcon from "../icons/DownloadIcon.jsx";

export default function FacturacionScreen({ customer, invoiceUrl }) {
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 animate-[fadeUp_0.4s_ease]">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Facturación</h1>
        <p className="text-slate-400 mb-8">Descargá tus comprobantes de pago y facturas emitidas.</p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
          <p className="text-lg text-white font-medium mb-1">Última factura generada</p>
          <p className="text-sm text-slate-400 mb-6">Nº de cliente: {customer?.code}</p>
          
          {invoiceUrl ? (
            <div className="flex justify-center">
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl px-6 py-3 font-bold text-base shadow-[0_6px_20px_rgba(99,102,241,0.25)] transition-all hover:scale-[1.02]"
              >
                <DownloadIcon /> Descargar factura en PDF
              </a>
            </div>
          ) : (
            <div className="bg-white/5 inline-block px-6 py-4 rounded-lg border border-white/5">
              <p className="text-slate-300">
                No hay facturas disponibles por el momento.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Si creés que esto es un error, por favor contactá a administración.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
