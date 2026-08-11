import React from 'react';
import { Link } from 'react-router-dom';
import PageTransition from '../layout/PageTransition.jsx';

export default function NotFoundScreen() {
  return (
    <PageTransition>
      <div 
        className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0d2240 55%, #0a1a35 100%)",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-bold text-sky-400 mb-4">Página no encontrada</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          La dirección a la que intentás acceder no existe o la sesión pudo haber expirado.
        </p>
        <Link 
          to="/"
          className="inline-block w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
    </PageTransition>
  );
}
