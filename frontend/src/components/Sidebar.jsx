import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Icon = ({ name }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    rooms: <><path d="M3 21h18M5 21V4h14v17M9 8h2M9 12h2M9 16h2M15 8h.01M15 12h.01M15 16h.01"/></>,
    hotel: <><path d="M3 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M15 9h5a1 1 0 0 1 1 1v11M7 7h2M7 11h2M7 15h2M11 7h1M11 11h1M11 15h1M2 21h20"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

const links = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/clientes", label: "Clientes", icon: "users" },
  { to: "/habitaciones", label: "Habitaciones", icon: "rooms" },
  { to: "/reservas", label: "Reservas", icon: "calendar" },
  { to: "/checkin", label: "Check-in / Check-out", icon: "check" },
  { to: "/pagos", label: "Pagos", icon: "card" },
];

export default function Sidebar({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const initials = (user?.name || user?.username || "U").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
  const visibleLinks = isAdmin ? [...links, { to: "/usuarios", label: "Usuarios", icon: "shield" }] : links;
  return (
    <>
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Icon name="hotel" /></div>
          <div>
            <strong>Hotel Marriott<br/>Yacuiba</strong>
            <span>Gestión hotelera</span>
          </div>
        </div>

        <div className="sidebar-section-label">MENÚ PRINCIPAL</div>
        <nav className="sidebar-nav">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon"><Icon name={link.icon} /></span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-help">
          <span className="help-icon">?</span>
          <div>
            <strong>¿Necesitas ayuda?</strong>
            <small>Centro de soporte</small>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar--small">{initials}</div>
          <div className="sidebar-user-copy">
            <strong>{user?.name || user?.username}</strong>
            <span>{user?.role}{user?.email ? ` · ${user.email}` : ""}</span>
          </div>
          <button className="icon-button logout-button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">↪</button>
        </div>
      </aside>
      {open && <button className="sidebar-overlay" onClick={onClose} aria-label="Cerrar menú" />}
    </>
  );
}
