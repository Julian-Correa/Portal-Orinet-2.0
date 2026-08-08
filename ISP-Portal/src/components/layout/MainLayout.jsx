import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import ErrorBoundary from "../ErrorBoundary.jsx";

export default function MainLayout({ session, onLogout }) {
  // Protect routes - if no session, redirect to login
  if (!session) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = session.isAdmin === true;

  return (
    <div 
      className="min-h-screen flex flex-col pb-16 md:pb-0" // added pb-16 for mobile bottom nav spacing
      style={{
        background: "linear-gradient(160deg, #0a0f1e 0%, #0d2240 55%, #0a1a35 100%)",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <Navbar onLogout={onLogout} isAdmin={isAdmin} />
      
      <main className="flex-grow w-full">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <MobileBottomNav isAdmin={isAdmin} />
    </div>
  );
}
