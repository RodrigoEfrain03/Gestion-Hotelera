import { useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Reservas from "./pages/Reservas";
import Clientes from "./pages/Clientes";
import Habitaciones from "./pages/Habitaciones";
import Checkin from "./pages/Checkin";
import Pagos from "./pages/Pagos";
import Login from "./pages/Login";
import Usuarios from "./pages/Usuarios";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

function NotFound() {
  return <section className="panel not-found"><strong>404</strong><h1>Página no encontrada</h1><p>La sección solicitada no existe dentro del sistema hotelero.</p><Link className="primary-button" to="/">Volver al Dashboard</Link></section>;
}

function Protected({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <main className="auth-loading"><span className="spinner"></span><p>Validando sesión...</p></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) return <section className="panel not-found"><strong>403</strong><h1>Sin permisos</h1><p>Esta sección requiere rol Administrador.</p><Link className="primary-button" to="/">Volver al Dashboard</Link></section>;
  return children;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return <div className="app-shell">
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    <div className="app-main">
      <Navbar onMenu={() => setSidebarOpen(true)} />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/habitaciones" element={<Habitaciones />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/pagos" element={<Pagos />} />
          <Route path="/usuarios" element={<Protected adminOnly><Usuarios /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  </div>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/*" element={<Protected><AppLayout /></Protected>} />
  </Routes>;
}

export default function App() {
  return <ErrorBoundary><BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter></ErrorBoundary>;
}
