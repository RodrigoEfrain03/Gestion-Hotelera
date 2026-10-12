import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const initialForm = { nombre: "", ci: "", telefono: "", correo: "" };

export default function Clientes() {
  const { isAdmin } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setClientes(await api.getClientes()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) => [c.nombre, c.ci, c.telefono, c.correo].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [clientes, search]);

  const reset = () => { setEditing(null); setForm(initialForm); setError(""); };
  const edit = (c) => { setEditing(c); setForm({nombre:c.nombre,ci:c.ci,telefono:c.telefono,correo:c.correo}); setSuccess(""); setError(""); window.scrollTo({top:0,behavior:"smooth"}); };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([k,v]) => [k, typeof v === "string" ? v.trim() : v]));
      if (editing) await api.updateCliente(editing.id, payload); else await api.createCliente(payload);
      setSuccess(editing ? "Cliente actualizado correctamente." : "Cliente guardado correctamente.");
      reset(); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar a ${c.nombre}? Esta acción puede fallar si tiene relaciones protegidas.`)) return;
    setError(""); setSuccess("");
    try { await api.deleteCliente(c.id); setSuccess("Cliente eliminado."); await load(); }
    catch (e) { setError(e.message); }
  };

  return <div className="page-stack">
    <section className="welcome-row"><div><h1>Clientes</h1><p>Registra, actualiza y consulta huéspedes.</p></div></section>
    <section className="module-grid module-grid--form">
      <article className="panel">
        <div className="panel-header"><div><h3>{editing ? "Editar cliente" : "Nuevo cliente"}</h3><p>{editing ? "Actualiza la ficha del huésped." : "Los datos se guardan mediante Django en Supabase."}</p></div>{editing&&<button className="text-button" onClick={reset}>Cancelar edición</button>}</div>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {success && <div className="alert alert--success" role="status">{success}</div>}
        <form className="form-grid" onSubmit={submit}>
          <label className="field field--full"><span>Nombre completo</span><input autoComplete="name" maxLength="100" required value={form.nombre} onChange={(e)=>setForm({...form,nombre:e.target.value})} placeholder="Ej. Ana Pérez" /></label>
          <label className="field"><span>CI / Documento</span><input maxLength="30" required value={form.ci} onChange={(e)=>setForm({...form,ci:e.target.value})} placeholder="Ej. 12345678" /></label>
          <label className="field"><span>Teléfono</span><input type="tel" autoComplete="tel" maxLength="30" required value={form.telefono} onChange={(e)=>setForm({...form,telefono:e.target.value})} placeholder="Ej. 71234567" /></label>
          <label className="field field--full"><span>Correo</span><input type="email" autoComplete="email" maxLength="254" required value={form.correo} onChange={(e)=>setForm({...form,correo:e.target.value})} placeholder="cliente@correo.com" /></label>
          <div className="form-actions field--full">{editing&&<button type="button" className="secondary-button" onClick={reset}>Cancelar</button>}<button className="primary-button" disabled={saving}>{saving ? "Guardando..." : editing ? "Guardar cambios" : "Guardar cliente"}</button></div>
        </form>
      </article>
      <article className="panel">
        <div className="panel-header"><div><h3>Clientes registrados</h3><p>{clientes.length} registro(s)</p></div><input aria-label="Buscar clientes" className="compact-search" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar..." /></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Cliente</th><th>CI</th><th>Teléfono</th><th>Correo</th><th>Acciones</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="5" className="table-empty"><span className="spinner"></span>Cargando clientes...</td></tr> : filtered.length ? filtered.map(c => <tr key={c.id}><td><strong>{c.nombre}</strong></td><td>{c.ci}</td><td>{c.telefono}</td><td>{c.correo}</td><td><div className="table-actions"><button className="text-action" onClick={()=>edit(c)}>Editar</button>{isAdmin&&<button className="danger-link" onClick={()=>remove(c)}>Eliminar</button>}</div></td></tr>) : <tr><td colSpan="5" className="table-empty">No hay clientes que coincidan con la búsqueda.</td></tr>}
        </tbody></table></div>
      </article>
    </section>
  </div>;
}
