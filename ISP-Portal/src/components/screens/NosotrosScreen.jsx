import React from "react";
import { WHATSAPP_URL } from "../../lib/config/portalConfig";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import PageTransition from "../layout/PageTransition.jsx";

export default function NosotrosScreen() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">Sobre OriNet</h1>
        
        <div className="prose prose-invert max-w-none text-slate-300">
          <p className="text-lg leading-relaxed mb-6">
            Somos una empresa proveedora de servicios de Internet (ISP) dedicada a brindar 
            conectividad de alta velocidad y estabilidad a hogares y empresas. Nuestro compromiso 
            es mantenerte conectado con lo que más importa.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Nuestra Misión</h2>
          <p className="mb-6">
            Brindar un servicio de excelencia tecnológica, con soporte local rápido y eficiente, 
            garantizando que nuestros clientes disfruten de la mejor experiencia de navegación sin interrupciones.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Ubicación de Nuestro Local</h2>
          <div className="bg-white/10 rounded-xl p-1 flex justify-center items-center mb-8 border border-white/5 overflow-hidden w-full">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3276.767880562612!2d-58.31740092483132!3d-34.78661836717963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a32dfddb75d2c7%3A0xa461b67fded2ef37!2sOriNet!5e0!3m2!1ses-419!2sar!4v1786206778763!5m2!1ses-419!2sar" 
              className="w-full h-[300px] sm:h-[450px] rounded-lg"
              style={{ border: 0 }}
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4 border-b border-white/10 pb-2">Contacto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <h3 className="text-white font-medium mb-1">Atención al Cliente</h3>
              <p className="text-sm text-slate-400 mb-3">Consultas comerciales y administrativas.</p>
              <a 
                href={WHATSAPP_URL("Hola OriNet, tengo una consulta general.")}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#4ade80] hover:text-[#22c55e] transition-colors text-sm font-semibold"
              >
                <WhatsAppIcon size={16} /> Escribir a Administración
              </a>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <h3 className="text-white font-medium mb-1">Soporte Técnico</h3>
              <p className="text-sm text-slate-400 mb-3">Problemas de conexión y asistencia técnica.</p>
              <a 
                href={WHATSAPP_URL("Hola OriNet, necesito asistencia técnica.")}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#38bdf8] hover:text-[#0ea5e9] transition-colors text-sm font-semibold"
              >
                <WhatsAppIcon size={16} /> Contactar Soporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
