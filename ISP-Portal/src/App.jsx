import { Routes, Route, Navigate } from "react-router-dom";
import { useCustomerSession } from "./hooks/useCustomerSession.js";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import PopupImage from "./components/PopupImage.jsx";
import LoginScreen from "./components/screens/LoginScreen.jsx";
import ProfileScreen from "./components/screens/ProfileScreen.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import AdminDashboard from "./components/screens/AdminDashboard.jsx";
import { POPUP_CONFIG } from "./lib/config/portalConfig.js";

import NosotrosScreen from "./components/screens/NosotrosScreen.jsx";
import FacturacionScreen from "./components/screens/FacturacionScreen.jsx";
import ServiciosScreen from "./components/screens/ServiciosScreen.jsx";
import PlanesScreen from "./components/screens/PlanesScreen.jsx";
import CompromisosScreen from "./components/screens/CompromisosScreen.jsx";
const PlaceholderScreen = ({ title }) => (
  <div className="bg-white p-8 rounded shadow text-center">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="mt-4 text-gray-600">Pantalla en construcción...</p>
  </div>
);

export default function App() {
  const { session, setSession, updateCustomer, logout } = useCustomerSession();

  return (
    <ErrorBoundary>
      {/* Global Popup if session exists and is not admin */}
      {session && !session.isAdmin && <PopupImage config={POPUP_CONFIG} />}
      
      <Routes>
        {/* Public Route */}
        <Route 
          path="/" 
          element={
            session ? (
              <Navigate to={session.isAdmin ? "/admin" : "/perfil"} replace />
            ) : (
              <LoginScreen onLogin={setSession} />
            )
          } 
        />

        {/* Protected Routes */}
        <Route element={<MainLayout session={session} onLogout={logout} />}>
          
          {/* Admin Routes */}
          {session?.isAdmin && (
            <>
              <Route path="/admin" element={<AdminDashboard session={session} />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          )}

          {/* Customer Routes */}
          {session && !session.isAdmin && (
            <>
              <Route 
                path="/perfil" 
                element={
                  <ProfileScreen
                    customer={session.customer}
                    cutDay={session.cutDay}
                    invoiceUrl={session.invoiceUrl}
                    planInfo={session.planInfo}
                    recargoReconexion={session.recargoReconexion}
                    recargoSegundoVencimiento={session.recargoSegundoVencimiento}
                    onUpdateCustomer={updateCustomer}
                    onLogout={logout} // Not strictly needed in ProfileScreen anymore if it's in Navbar, but kept for compatibility
                  />
                } 
              />
              <Route path="/facturacion" element={<FacturacionScreen customer={session.customer} invoiceUrl={session.invoiceUrl} />} />
              <Route path="/servicios" element={<ServiciosScreen customer={session.customer} planInfo={session.planInfo} />} />
              <Route path="/planes" element={<PlanesScreen customer={session.customer} />} />
              <Route path="/compromisos" element={<CompromisosScreen customer={session.customer} />} />
              <Route path="/nosotros" element={<NosotrosScreen />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/perfil" replace />} />
            </>
          )}
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
