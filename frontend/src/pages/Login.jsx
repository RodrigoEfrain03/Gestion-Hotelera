import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(username.trim(), password); navigate(location.state?.from || "/", { replace: true }); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return <main className="login-page">
    <section className="login-card">
      <div className="login-brand"><div className="brand-mark login-mark">▦</div><div><strong>Hotel Marriott Yacuiba</strong><span>Gestión hotelera</span></div></div>
      <div className="login-copy"><span className="eyebrow">ACCESO SEGURO</span><h1>Iniciar sesión</h1><p>Ingresa con tu cuenta de administrador o recepción.</p></div>
      {error && <div className="alert alert--error">{error}</div>}
      <form className="login-form" onSubmit={submit}>
        <label className="field"><span>Usuario</span><input autoFocus autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)} placeholder="Tu usuario" /></label>
        <label className="field"><span>Contraseña</span><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Tu contraseña" /></label>
        <button className="primary-button login-button" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
      </form>
      <small className="login-foot">Las credenciales se validan en Django y los datos permanecen en Supabase.</small>
    </section>
  </main>;
}
