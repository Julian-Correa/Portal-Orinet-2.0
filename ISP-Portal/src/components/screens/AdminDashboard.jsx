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
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
            <span className="text-2xl mr-2">📊</span> Métricas de Uso
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Visitas Totales</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{metrics.visits}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">Comprobantes</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{metrics.comprobanteClicks}</p>
            </div>
          </div>
        </div>

        {/* Costos Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
            <span className="text-2xl mr-2">💰</span> Reglas y Costos
          </h2>
          <form onSubmit={handleSaveCostos} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recargo por reconexión ($)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={costos.recargoReconexion}
                onChange={e => setCostos({...costos, recargoReconexion: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo de compromiso de pago ($)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={costos.costoCompromiso}
                onChange={e => setCostos({...costos, costoCompromiso: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Umbral max. deuda vencida ($)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={costos.umbralDeudaVencida}
                onChange={e => setCostos({...costos, umbralDeudaVencida: Number(e.target.value)})}
              />
            </div>
            <button 
              type="submit" 
              disabled={savingCostos}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {savingCostos ? "Guardando..." : "Guardar Costos"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Popup Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
            <span className="text-2xl mr-2">🖼️</span> Popup Comercial
          </h2>
          <form onSubmit={handleSavePopup} className="space-y-4">
            <div className="flex items-center mb-4">
              <input 
                type="checkbox" 
                id="popupEnabled"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={popup.enabled}
                onChange={e => setPopup({...popup, enabled: e.target.checked})}
              />
              <label htmlFor="popupEnabled" className="ml-2 block text-sm font-medium text-gray-700">
                Habilitar popup publicitario en el inicio
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la Imagen</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={popup.imageUrl}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  onChange={e => setPopup({...popup, imageUrl: e.target.value})}
                  disabled={!popup.enabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enlace al hacer click (opcional)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {savingPopup ? "Guardando..." : "Guardar Popup"}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-700 flex items-center">
            <span className="text-2xl mr-2">📋</span> Catálogo de Planes
          </h2>
          <button 
            onClick={handleAddPlan}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded-md text-sm transition-colors"
          >
            + Agregar Plan
          </button>
        </div>
        
        {planes.length === 0 ? (
          <p className="text-gray-500 italic mb-4">No hay planes cargados en el catálogo comercial.</p>
        ) : (
          <div className="space-y-4 mb-4">
            {planes.map((plan, index) => (
              <div key={plan.id} className="p-4 border border-gray-200 rounded-lg relative">
                <button 
                  onClick={() => handleRemovePlan(plan.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold px-2 py-1"
                  title="Eliminar plan"
                >
                  &times;
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Nombre</label>
                    <input 
                      type="text" 
                      value={plan.nombre}
                      onChange={(e) => handlePlanChange(plan.id, 'nombre', e.target.value)}
                      placeholder="Ej: Plan Fibra 100"
                      className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Velocidad</label>
                    <input 
                      type="text" 
                      value={plan.velocidad}
                      onChange={(e) => handlePlanChange(plan.id, 'velocidad', e.target.value)}
                      placeholder="Ej: 100 Mbps"
                      className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase">Precio</label>
                    <input 
                      type="text" 
                      value={plan.precio}
                      onChange={(e) => handlePlanChange(plan.id, 'precio', e.target.value)}
                      placeholder="Ej: $ 15.000"
                      className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Descripción breve</label>
                    <input 
                      type="text" 
                      value={plan.descripcion}
                      onChange={(e) => handlePlanChange(plan.id, 'descripcion', e.target.value)}
                      placeholder="Ej: Ideal para familias, Netflix y juegos."
                      className="w-full mt-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {savingPlanes ? "Guardando..." : "Guardar Catálogo de Planes"}
        </button>
      </div>
    </div>
  );
}
