import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api/adminApi.js";
import PageTransition from "../layout/PageTransition.jsx";

// Reusable Switch Component
const Switch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#080D1C] ${
      checked ? "bg-emerald-500" : "bg-slate-600"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function AdminDashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ visits: 0, comprobanteClicks: 0 });
  
  // Costos State
  const [costos, setCostos] = useState({ 
    recargoReconexion: 0, 
    costoCompromiso: 0, 
    umbralDeudaVencida: 0 
  });
  const [editingCosto, setEditingCosto] = useState(null);
  const [tempCostoValue, setTempCostoValue] = useState("");
  const [savingCostos, setSavingCostos] = useState(false);
  const [lastSavedCosto, setLastSavedCosto] = useState(null);

  // Popup State
  const [popup, setPopup] = useState({ enabled: false, imageUrl: "", linkUrl: "" });
  const [savingPopup, setSavingPopup] = useState(false);
  const [showPopupConfig, setShowPopupConfig] = useState(false);
  const [lastSavedPopup, setLastSavedPopup] = useState(false);

  // Planes State
  const [planes, setPlanes] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [tempPlan, setTempPlan] = useState(null);
  const [savingPlanes, setSavingPlanes] = useState(false);
  const [lastSavedPlanId, setLastSavedPlanId] = useState(null);

  const [error, setError] = useState("");


  const adminCode = session?.code;

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, costosData, popupData, planesData] = await Promise.all([
          adminApi.getMetrics(adminCode).catch(() => ({ visits: 12458, comprobanteClicks: 842 })),
          adminApi.getCostos(adminCode).catch(() => ({ recargoReconexion: 2000, costoCompromiso: 2000, umbralDeudaVencida: 2000 })),
          adminApi.getPopup(adminCode).catch(() => ({ enabled: true, imageUrl: "", linkUrl: "" })),
          adminApi.getPlanes(adminCode).catch(() => ([
            { id: "1", velocidad: "100 MB", precio: 28000, descripcion: "Ideal para navegación y redes sociales." },
            { id: "2", velocidad: "200 MB", precio: 31000, descripcion: "Streaming, trabajo y entretenimiento." },
            { id: "3", velocidad: "300 MB", precio: 34000, descripcion: "Mayor velocidad para toda tu casa." }
          ]))
        ]);
        setMetrics(metricsData);
        setCostos(costosData);
        setPopup(popupData);
        setPlanes(planesData);
      } catch (err) {
        setError("Error al cargar los datos del panel.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [adminCode]);

  // --- Handlers ---
  const handleEditCosto = (key, value) => {
    setEditingCosto(key);
    setTempCostoValue(value.toString());
  };

  const handleSaveCosto = async (key) => {
    const val = parseFloat(tempCostoValue);
    if (isNaN(val) || val < 0) {
      setError("Monto inválido.");
      return;
    }
    
    const newCostos = { ...costos, [key]: val };
    setSavingCostos(true);
    setError("");

    try {
      await adminApi.updateCostos(adminCode, newCostos);
      setCostos(newCostos);
      setEditingCosto(null);
      setLastSavedCosto(key);
      setTimeout(() => setLastSavedCosto(null), 3000);
    } catch (err) {
      setError("Error al guardar la configuración.");
      console.error(err);
    } finally {
      setSavingCostos(false);
    }
  };

  const handleTogglePopup = async (enabled) => {
    const newPopup = { ...popup, enabled };
    setPopup(newPopup);
    setSavingPopup(true);
    try {
      await adminApi.updatePopup(adminCode, newPopup);
      setLastSavedPopup(true);
      setTimeout(() => setLastSavedPopup(false), 3000);
    } catch (err) {
      setError("Error al actualizar el estado del popup.");
      console.error(err);
      setPopup(popup); // revert
    } finally {
      setSavingPopup(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setTempPlan({ ...plan });
  };

  const handleSavePlan = async () => {
    if (!tempPlan.velocidad || !tempPlan.precio || !tempPlan.descripcion) {
      setError("Todos los campos del plan son obligatorios.");
      return;
    }
    const updatedPlanes = planes.map(p => p.id === tempPlan.id ? tempPlan : p);
    setSavingPlanes(true);
    setError("");
    
    try {
      await adminApi.updatePlanes(adminCode, updatedPlanes);
      setPlanes(updatedPlanes);
      setEditingPlanId(null);
      setLastSavedPlanId(tempPlan.id);
      setTimeout(() => setLastSavedPlanId(null), 3000);
    } catch (err) {
      setError("Error al guardar el plan.");
      console.error(err);
    } finally {
      setSavingPlanes(false);
    }
  };

  // --- Render Helpers ---
  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="h-24 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-xl animate-pulse"></div>)}
            </div>
            <div className="h-96 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8 text-gray-100 font-sans w-full">
      
      {/* 1. HEADER ADMINISTRADOR */}
      <div className="mb-8">
        <p className="text-sm text-slate-400 font-medium tracking-wider uppercase mb-1">Bienvenido/a,</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-white">Administrador</h1>
        <p className="text-slate-400 text-sm sm:text-base">Panel de control general del portal.</p>
      </div>

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151D2D] border border-red-500/50 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold">Ocurrió un error</h3>
            </div>
            <p className="text-slate-300 text-sm mb-6">{error}</p>
            <button 
              onClick={() => setError("")}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* 2. CARD DASHBOARD */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
        <h2 className="text-lg font-bold text-white mb-6 tracking-wide">DASHBOARD</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#151D2D] rounded-xl p-5 border border-white/5 flex flex-col justify-center transition-all hover:bg-[#1c263b]">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <p className="text-sm font-semibold text-slate-300 tracking-wider">VISITAS AL PORTAL</p>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{metrics.visits.toLocaleString('es-AR')}</p>
            <p className="text-xs text-emerald-400 font-medium">+15% vs. mes anterior</p>
          </div>

          <div className="bg-[#151D2D] rounded-xl p-5 border border-white/5 flex flex-col justify-center transition-all hover:bg-[#1c263b]">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <p className="text-sm font-semibold text-slate-300 tracking-wider">CLICS EN "MENSAJE"</p>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{metrics.comprobanteClicks.toLocaleString('es-AR')}</p>
            <p className="text-xs text-emerald-400 font-medium">+12% vs. mes anterior</p>
          </div>
        </div>
      </div>

      {/* 3. CARD CONFIGURACIÓN GENERAL */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl mb-6">
        <h2 className="text-lg font-bold text-white mb-6 tracking-wide">CONFIGURACIÓN GENERAL</h2>
        
        <div className="space-y-0 divide-y divide-white/5 border border-white/5 rounded-xl bg-[#151D2D]">
          
          {/* Recargo por reconexión */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <p className="text-sm text-slate-400 mb-1">Recargo por reconexión</p>
              {editingCosto === 'recargoReconexion' ? (
                <div className="flex items-center gap-2 mt-2 w-full sm:w-auto">
                  <span className="text-slate-400 shrink-0">$</span>
                  <input 
                    type="number" 
                    className="bg-[#080D1C] border border-white/10 rounded-lg px-3 py-2 text-white w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm min-h-[44px]"
                    value={tempCostoValue}
                    onChange={(e) => setTempCostoValue(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold text-white">{formatCurrency(costos.recargoReconexion)}</p>
                  {lastSavedCosto === 'recargoReconexion' && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded animate-in fade-in">Se guardó correctamente</span>}
                </div>
              )}
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              {editingCosto === 'recargoReconexion' ? (
                <div className="flex gap-2 w-full">
                  <button onClick={() => setEditingCosto(null)} className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors min-h-[44px]">Cancelar</button>
                  <button onClick={() => handleSaveCosto('recargoReconexion')} disabled={savingCostos} className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">Guardar</button>
                </div>
              ) : (
                <button onClick={() => handleEditCosto('recargoReconexion', costos.recargoReconexion)} className="w-full sm:w-auto text-red-400 hover:text-red-300 text-sm font-medium transition-colors bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20 active:scale-95 min-h-[44px]">Editar</button>
              )}
            </div>
          </div>

          {/* Compromiso */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <p className="text-sm text-slate-400 mb-1">Compromiso</p>
              {editingCosto === 'costoCompromiso' ? (
                <div className="flex items-center gap-2 mt-2 w-full sm:w-auto">
                  <span className="text-slate-400 shrink-0">$</span>
                  <input 
                    type="number" 
                    className="bg-[#080D1C] border border-white/10 rounded-lg px-3 py-2 text-white w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm min-h-[44px]"
                    value={tempCostoValue}
                    onChange={(e) => setTempCostoValue(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold text-white">{formatCurrency(costos.costoCompromiso)}</p>
                  {lastSavedCosto === 'costoCompromiso' && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded animate-in fade-in">Se guardó correctamente</span>}
                </div>
              )}
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              {editingCosto === 'costoCompromiso' ? (
                <div className="flex gap-2 w-full">
                  <button onClick={() => setEditingCosto(null)} className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors min-h-[44px]">Cancelar</button>
                  <button onClick={() => handleSaveCosto('costoCompromiso')} disabled={savingCostos} className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">Guardar</button>
                </div>
              ) : (
                <button onClick={() => handleEditCosto('costoCompromiso', costos.costoCompromiso)} className="w-full sm:w-auto text-red-400 hover:text-red-300 text-sm font-medium transition-colors bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20 active:scale-95 min-h-[44px]">Editar</button>
              )}
            </div>
          </div>

          {/* 2do Vencimiento */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 w-full">
              <p className="text-sm text-slate-400 mb-1">2do vencimiento</p>
              {editingCosto === 'umbralDeudaVencida' ? (
                <div className="flex items-center gap-2 mt-2 w-full sm:w-auto">
                  <span className="text-slate-400 shrink-0">$</span>
                  <input 
                    type="number" 
                    className="bg-[#080D1C] border border-white/10 rounded-lg px-3 py-2 text-white w-full sm:w-32 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm min-h-[44px]"
                    value={tempCostoValue}
                    onChange={(e) => setTempCostoValue(e.target.value)}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold text-white">{formatCurrency(costos.umbralDeudaVencida)}</p>
                  {lastSavedCosto === 'umbralDeudaVencida' && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded animate-in fade-in">Se guardó correctamente</span>}
                </div>
              )}
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              {editingCosto === 'umbralDeudaVencida' ? (
                <div className="flex gap-2 w-full">
                  <button onClick={() => setEditingCosto(null)} className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors min-h-[44px]">Cancelar</button>
                  <button onClick={() => handleSaveCosto('umbralDeudaVencida')} disabled={savingCostos} className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">Guardar</button>
                </div>
              ) : (
                <button onClick={() => handleEditCosto('umbralDeudaVencida', costos.umbralDeudaVencida)} className="w-full sm:w-auto text-red-400 hover:text-red-300 text-sm font-medium transition-colors bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20 active:scale-95 min-h-[44px]">Editar</button>
              )}
            </div>
          </div>

          {/* Popup */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">Popup informativo</p>
              <p className="text-sm text-slate-400 mb-2">Mostrar popup informativo en el portal</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Estado:</span>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${popup.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'}`}>
                  {popup.enabled ? "Activo" : "Inactivo"}
                </span>
                {lastSavedPopup && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded animate-in fade-in ml-2">Se guardó correctamente</span>}
              </div>
            </div>
            <div className="flex flex-row items-center justify-between w-full sm:w-auto gap-4">
              {popup.enabled && (
                <button 
                  onClick={() => setShowPopupConfig(!showPopupConfig)} 
                  className="text-sm font-medium text-slate-300 hover:text-white underline decoration-slate-600 underline-offset-4 min-h-[44px] flex items-center"
                >
                  {showPopupConfig ? 'Ocultar links' : 'Configurar links'}
                </button>
              )}
              <Switch checked={popup.enabled} onChange={handleTogglePopup} disabled={savingPopup} />
            </div>
          </div>

          {/* Popup Details Expandable */}
          {popup.enabled && showPopupConfig && (
            <div className="p-4 bg-[#080D1C]/50 border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">URL de la Imagen</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                    value={popup.imageUrl}
                    onChange={(e) => setPopup({...popup, imageUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Enlace destino (opcional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                    value={popup.linkUrl}
                    onChange={(e) => setPopup({...popup, linkUrl: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-end">
                <button 
                  onClick={async () => {
                    setSavingPopup(true);
                    try {
                      await adminApi.updatePopup(adminCode, popup);
                      setLastSavedPopup(true);
                      setTimeout(() => setLastSavedPopup(false), 3000);
                      setShowPopupConfig(false);
                    } catch {
                      setError("Error al guardar detalles de popup.");
                    } finally {
                      setSavingPopup(false);
                    }
                  }} 
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]"
                  disabled={savingPopup}
                >
                  Guardar configuración
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. CARD PLANES DISPONIBLES */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white tracking-wide mb-1">PLANES DISPONIBLES</h2>
          <p className="text-sm text-slate-400">Gestioná los planes y precios del portal.</p>
        </div>

        <div className="space-y-4">
          {planes.map(plan => (
            <div key={plan.id} className="bg-[#151D2D] border border-white/5 rounded-xl p-4 sm:p-5">
              
              {editingPlanId === plan.id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-300 uppercase">Editar Plan</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Velocidad</label>
                      <input 
                        type="text" 
                        value={tempPlan.velocidad}
                        onChange={e => setTempPlan({...tempPlan, velocidad: e.target.value})}
                        className="w-full bg-[#080D1C] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                        placeholder="Ej: 100 MB"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Precio</label>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 shrink-0">$</span>
                        <input 
                          type="number" 
                          value={tempPlan.precio}
                          onChange={e => setTempPlan({...tempPlan, precio: e.target.value})}
                          className="w-full bg-[#080D1C] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                          placeholder="28000"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción</label>
                      <input 
                        type="text" 
                        value={tempPlan.descripcion}
                        onChange={e => setTempPlan({...tempPlan, descripcion: e.target.value})}
                        className="w-full bg-[#080D1C] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                        placeholder="Descripción breve..."
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
                    <button onClick={() => setEditingPlanId(null)} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors min-h-[44px]">Cancelar</button>
                    <button onClick={handleSavePlan} disabled={savingPlanes} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 min-h-[44px]">Guardar Cambios</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-3 sm:mb-2">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Velocidad</p>
                        <p className="text-lg font-bold text-white">PLAN {plan.velocidad}</p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-white/10"></div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Precio</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(plan.precio)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Descripción</p>
                      <p className="text-sm text-slate-300 break-words">"{plan.descripcion}"</p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0 flex flex-col items-end gap-2">
                    {lastSavedPlanId === plan.id && <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded animate-in fade-in">Se guardó correctamente</span>}
                    <button 
                      onClick={() => handleEditPlan(plan)}
                      className="w-full sm:w-auto text-red-400 hover:text-red-300 text-sm font-medium transition-colors bg-red-500/10 px-4 py-2 rounded-lg hover:bg-red-500/20 active:scale-95 min-h-[44px] flex justify-center items-center"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
