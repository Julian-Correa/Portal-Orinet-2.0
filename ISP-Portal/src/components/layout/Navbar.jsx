import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ onLogout, isAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav style={{
      background: "rgba(255,255,255,0.03)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    }} className="text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="font-bold text-xl tracking-wider flex items-baseline gap-2">
              OriNet
              {isAdmin && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:inline-block">Panel Administrador</span>}
            </div>
            
            {isAdmin ? (
              <div className="hidden md:flex space-x-4">
                <Link to="/admin" className="hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
              </div>
            ) : (
              <div className="hidden md:flex space-x-1">
                <Link to="/perfil" className="hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Perfil</Link>
                <Link to="/facturacion" className="hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Facturación</Link>
                <Link to="/servicios" className="hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Mis Servicios</Link>
                <Link to="/planes" className="hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Planes</Link>
                <Link to="/compromisos" className="hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Compromisos</Link>
                <Link to="/nosotros" className="hover:bg-white/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">Nosotros</Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={handleLogout}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-[#f8fafc] px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
