import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenu }) {
  const { user } = useAuth();
  const initials = (user?.name || user?.username || "U").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={onMenu} aria-label="Abrir menú"><span></span><span></span><span></span></button>
        <div><span className="eyebrow">PANEL DE CONTROL</span><h2>Gestión hotelera</h2></div>
      </div>
      <div className="topbar-actions">
        <span className={`connection-pill ${online ? "is-online" : "is-offline"}`} role="status"><i></i>{online ? "En línea" : "Sin conexión"}</span>
        <div className="topbar-profile"><div className="avatar">{initials}</div><div><strong>{user?.name || user?.username}</strong><span>{user?.role}</span></div></div>
      </div>
    </header>
  );
}
