import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { numero: "", tipo: "", precio: "", estado: "disponible" };
const estados = ["disponible", "reservada", "ocupada", "limpieza", "mantenimiento"];

export default function Habitaciones() {
  const { isAdmin } = useAuth();
  const [habitaciones, setHabitaciones] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("todas");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setHabitaciones(await api.getHabitaciones()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return habitaciones.filter(h => (filter === "todas" || h.estado === filter) && (!q || [h.numero,h.tipo,h.estado].some(v => String(v||"").toLowerCase().includes(q))));
  }, [habitaciones, filter, search]);

  const reset = () => { setEditing(null); setForm(initialForm); setError(""); };
  const edit = (h) => { setEditing(h); setForm({numero:h.numero,tipo:h.tipo,precio:String(h.precio),estado:h.estado}); setSuccess(""); setError(""); window.scrollTo({top:0,behavior:"smooth"}); };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const payload = { ...form, numero: form.numero.trim(), tipo: form.tipo.trim(), precio: Number(form.precio) };
      if (editing) await api.updateHabitacion(editing.id, payload); else await api.createHabitacion(payload);
      setSuccess(editing ? "Habitación actualizada correctamente." : "Habitación guardada correctamente.");
      reset(); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const changeEstado = async (room, estado) => {
    setError(""); setSuccess("");
    try { await api.updateHabitacion(room.id, {estado}); setSuccess(`Habitación ${room.numero}: ${estado}.`); await load(); }
    catch (e) { setError(e.message); }
  };

  const remove = async (room) => {
    if (!window.confirm(`¿Eliminar la habitación ${room.numero}?`)) return;
    setError(""); setSuccess("");
    try { await api.deleteHabitacion(room.id); setSuccess("Habitación eliminada."); await load(); }
    catch (e) { setError(e.message); }
  };

  return <div className="page-stack">
    <section className="welcome-row"><div><h1>Habitaciones</h1><p>Administra inventario, tarifas y estado operativo.</p></div></section>
    <section className="module-grid module-grid--form">
      <article className="panel">
        <div className="panel-header"><div><h3>{editing ? `Editar habitación ${editing.numero}` : "Nueva habitación"}</h3><p>{editing ? "Actualiza tarifa, tipo o estado." : "Crea una habitación en el inventario."}</p></div>{editing&&<button className="text-button" onClick={reset}>Cancelar edición</button>}</div>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {success && <div className="alert alert--success" role="status">{success}</div>}
        <form className="form-grid" onSubmit={submit}>
          <label className="field"><span>Número</span><input maxLength="10" required value={form.numero} onChange={(e)=>setForm({...form,numero:e.target.value})} placeholder="204" /></label>
          <label className="field"><span>Tipo</span><input maxLength="50" required value={form.tipo} onChange={(e)=>setForm({...form,tipo:e.target.value})} placeholder="Doble, Suite..." /></label>
          <label className="field"><span>Precio (Bs)</span><input type="number" min="0.01" step="0.01" required value={form.precio} onChange={(e)=>setForm({...form,precio:e.target.value})} placeholder="350.00" /></label>
          <label className="field"><span>Estado</span><select value={form.estado} onChange={(e)=>setForm({...form,estado:e.target.value})}>{estados.map(e=><option key={e} value={e}>{e}</option>)}</select></label>
          <div className="form-actions field--full">{editing&&<button type="button" className="secondary-button" onClick={reset}>Cancelar</button>}<button className="primary-button" disabled={saving}>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Guardar habitación"}</button></div>
        </form>
      </article>
      <article className="panel">
        <div className="toolbar-row"><input aria-label="Buscar habitaciones" className="compact-search compact-search--wide" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar número, tipo o estado..."/><select className="period-select" value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="todas">Todos los estados</option>{estados.map(e=><option key={e} value={e}>{e}</option>)}</select></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Nº</th><th>Tipo</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="5" className="table-empty"><span className="spinner"></span>Cargando habitaciones...</td></tr> : filtered.length ? filtered.map(h => <tr key={h.id}><td><strong>{h.numero}</strong></td><td>{h.tipo}</td><td>Bs {Number(h.precio).toFixed(2)}</td><td><select className={`status-select status-${h.estado}`} value={h.estado} onChange={(e)=>changeEstado(h,e.target.value)}>{estados.map(e=><option key={e} value={e}>{e}</option>)}</select></td><td><div className="table-actions"><button className="text-action" onClick={()=>edit(h)}>Editar</button>{isAdmin&&<button className="danger-link" onClick={()=>remove(h)}>Eliminar</button>}</div></td></tr>) : <tr><td colSpan="5" className="table-empty">No hay habitaciones para este filtro.</td></tr>}
        </tbody></table></div>
      </article>
    </section>
  </div>;
}
