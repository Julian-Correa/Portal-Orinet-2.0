import { useState, useEffect } from "react";
import { adminApi } from "../../lib/api/adminApi.js";

export default function AdminDashboard({ session }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ visits: 0, comprobanteClicks: 0 });
  const [costos, setCostos] = useState({ 
    recargoReconexion: 0, 
    costoCompromiso: 0, 
    umbralDeudaVencida: 0 
  });
  const [popup, setPopup] = useState({ enabled: false, imageUrl: "", linkUrl: "" });
  const [savingCostos, setSavingCostos] = useState(false);
  const [savingPopup, setSavingPopup] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [savingPlanes, setSavingPlanes] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const adminCode = session.code;

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, costosData, popupData, planesData] = await Promise.all([
          adminApi.getMetrics(adminCode),
          adminApi.getCostos(adminCode),
          adminApi.getPopup(adminCode),
          adminApi.getPlanes(adminCode)
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

  const handleSaveCostos = async (e) => {
    e.preventDefault();
    setSavingCostos(true);
    setMessage("");
    try {
      await adminApi.updateCostos(adminCode, costos);
      setMessage("Costos guardados correctamente.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Error al guardar los costos.");
    } finally {
      setSavingCostos(false);
    }
  };

  const handleSavePopup = async (e) => {
    e.preventDefault();
    setSavingPopup(true);
    setMessage("");
    try {
      await adminApi.updatePopup(adminCode, popup);
      setMessage("Configuración del popup guardada.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Error al guardar el popup.");
    } finally {
      setSavingPopup(false);
    }
  };

  const handleAddPlan = () => {
    setPlanes([...planes, { id: Date.now().toString(), nombre: "", velocidad: "", precio: "", descripcion: "" }]);
  };

  const handleRemovePlan = (id) => {
    setPlanes(planes.filter(p => p.id !== id));
  };

  const handlePlanChange = (id, field, value) => {
    setPlanes(planes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSavePlanes = async (e) => {
    e.preventDefault();
    setSavingPlanes(true);
    setMessage("");
    try {
      await adminApi.updatePlanes(adminCode, planes);
      setMessage("Catálogo de planes guardado correctamente.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Error al guardar los planes.");
    } finally {
      setSavingPlanes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-white">
        <p className="text-xl animate-pulse">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-gray-800">
      <div className="mb-8 text-white">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-gray-300 mt-2">Configuración general y métricas del portal</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button className="float-right font-bold" onClick={() => setError("")}>&times;</button>
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Métricas */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-xl mr-3 bg-white/10 text-white p-2.5 rounded-xl border border-white/5 shadow-sm">📊</span> Métricas de Uso
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center transition-transform hover:scale-[1.02] shadow-sm backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Visitas Totales</p>
              <p className="text-5xl font-light text-white">{metrics.visits}</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center transition-transform hover:scale-[1.02] shadow-sm backdrop-blur-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Comprobantes</p>
              <p className="text-5xl font-light text-white">{metrics.comprobanteClicks}</p>
            </div>
          </div>
        </div>

        {/* Costos Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-xl mr-3 bg-white/10 text-white p-2.5 rounded-xl border border-white/5 shadow-sm">💰</span> Reglas y Costos
          </h2>
          <form onSubmit={handleSaveCostos} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Recargo por reconexión ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all min-h-[44px]"
                value={costos.recargoReconexion}
                onChange={e => setCostos({...costos, recargoReconexion: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Costo de compromiso de pago ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all min-h-[44px]"
                value={costos.costoCompromiso}
                onChange={e => setCostos({...costos, costoCompromiso: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Umbral max. deuda vencida ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all min-h-[44px]"
                value={costos.umbralDeudaVencida}
                onChange={e => setCostos({...costos, umbralDeudaVencida: Number(e.target.value)})}
              />
            </div>
            <button 
              type="submit" 
              disabled={savingCostos}
              className="w-full mt-2 bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 text-white font-semibold tracking-wide py-3 px-4 rounded-xl transition-all shadow-sm min-h-[44px] flex justify-center items-center backdrop-blur-sm"
            >
              {savingCostos ? "Guardando..." : "Guardar Costos"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Popup Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="text-xl mr-3 bg-white/10 text-white p-2.5 rounded-xl border border-white/5 shadow-sm">🖼️</span> Popup Comercial
          </h2>
          <form onSubmit={handleSavePopup} className="space-y-5">
            <div className="flex items-center mb-6 p-4 bg-black/20 rounded-xl border border-white/5">
              <input 
                type="checkbox" 
                id="popupEnabled"
                className="h-5 w-5 text-white bg-white/10 border-white/20 rounded focus:ring-white/30 focus:ring-offset-0 min-h-[44px] min-w-[44px] transition-all"
                checked={popup.enabled}
                onChange={e => setPopup({...popup, enabled: e.target.checked})}
              />
              <label htmlFor="popupEnabled" className="ml-3 block text-base font-medium text-white cursor-pointer">
                Habilitar popup publicitario en el inicio
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">URL de la Imagen</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  value={popup.imageUrl}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  onChange={e => setPopup({...popup, imageUrl: e.target.value})}
                  disabled={!popup.enabled}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Enlace al hacer click (opcional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  value={popup.linkUrl}
                  placeholder="https://ejemplo.com/promo"
                  onChange={e => setPopup({...popup, linkUrl: e.target.value})}
                  disabled={!popup.enabled}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={savingPopup}
              className="mt-6 w-full md:w-auto bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 text-white font-semibold tracking-wide py-3 px-8 rounded-xl transition-all shadow-sm min-h-[44px] backdrop-blur-sm"
            >
              {savingPopup ? "Guardando..." : "Guardar Popup"}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="text-xl mr-3 bg-white/10 text-white p-2.5 rounded-xl border border-white/5 shadow-sm">📋</span> Catálogo de Planes
          </h2>
          <button 
            onClick={handleAddPlan}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold tracking-wide py-2.5 px-5 rounded-xl text-sm transition-all min-h-[44px] backdrop-blur-sm flex items-center justify-center"
          >
            + Agregar Plan
          </button>
        </div>
        
        {planes.length === 0 ? (
          <div className="bg-black/20 border border-white/5 p-8 rounded-xl text-center">
            <p className="text-slate-400 italic">No hay planes cargados en el catálogo comercial.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {planes.map((plan, index) => (
              <div key={plan.id} className="p-5 bg-black/20 border border-white/10 rounded-xl relative transition-all focus-within:ring-2 focus-within:ring-sky-500/50">
                <button 
                  onClick={() => handleRemovePlan(plan.id)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg p-2 font-bold min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  title="Eliminar plan"
                  aria-label="Eliminar plan"
                >
                  &times;
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pr-12 md:pr-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre</label>
                    <input 
                      type="text" 
                      value={plan.nombre}
                      onChange={(e) => handlePlanChange(plan.id, 'nombre', e.target.value)}
                      placeholder="Ej: Plan Fibra 100"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Velocidad</label>
                    <input 
                      type="text" 
                      value={plan.velocidad}
                      onChange={(e) => handlePlanChange(plan.id, 'velocidad', e.target.value)}
                      placeholder="Ej: 100 Mbps"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Precio</label>
                    <input 
                      type="text" 
                      value={plan.precio}
                      onChange={(e) => handlePlanChange(plan.id, 'precio', e.target.value)}
                      placeholder="Ej: $ 15.000"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all min-h-[44px]"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción breve</label>
                    <input 
                      type="text" 
                      value={plan.descripcion}
                      onChange={(e) => handlePlanChange(plan.id, 'descripcion', e.target.value)}
                      placeholder="Ej: Ideal para familias, Netflix y juegos."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/30 transition-all min-h-[44px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={handleSavePlanes}
          disabled={savingPlanes}
          className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50 text-white font-semibold tracking-wide py-3 px-8 rounded-xl transition-all shadow-sm min-h-[44px] backdrop-blur-sm"
        >
          {savingPlanes ? "Guardando..." : "Guardar Catálogo de Planes"}
        </button>
      </div>
    </div>
  );
}
