import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const blank={username:"",email:"",first_name:"",last_name:"",role:"Recepción",password:"",is_active:true};
export default function Usuarios(){
  const { isAdmin }=useAuth();
  const [items,setItems]=useState([]),[form,setForm]=useState(blank),[editing,setEditing]=useState(null),[open,setOpen]=useState(false);
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState(""),[search,setSearch]=useState("");
  const load=async()=>{setLoading(true);setError("");try{setItems(await api.getUsuarios())}catch(e){setError(e.message)}finally{setLoading(false)}};
  useEffect(()=>{if(isAdmin)load()},[isAdmin]);
  const filtered=useMemo(()=>{const q=search.toLowerCase();return items.filter(u=>!q||[u.username,u.email,u.name,u.role_display].some(v=>String(v||"").toLowerCase().includes(q)))},[items,search]);
  if(!isAdmin)return <section className="panel not-found"><strong>403</strong><h1>Sin permisos</h1><p>Esta sección es exclusiva para administradores.</p></section>;
  const roleHelp={"Administrador":"Acceso total, usuarios, eliminaciones y anulaciones.","Recepción":"Operación diaria sin administración de usuarios ni acciones sensibles."};
  const create=()=>{setEditing(null);setForm(blank);setError("");setOpen(true)};
  const edit=u=>{setEditing(u);setForm({username:u.username,email:u.email||"",first_name:u.first_name||"",last_name:u.last_name||"",role:u.role_display||"Recepción",password:"",is_active:u.is_active});setError("");setOpen(true)};
  const submit=async e=>{e.preventDefault();setSaving(true);setError("");try{const payload={...form};if(!payload.password)delete payload.password;if(editing)await api.updateUsuario(editing.id,payload);else await api.createUsuario(payload);setOpen(false);setSuccess(editing?"Usuario actualizado.":"Usuario creado.");await load()}catch(e){setError(e.message)}finally{setSaving(false)}};
  const remove=async u=>{if(!confirm(`¿Eliminar al usuario ${u.username}?`))return;try{await api.deleteUsuario(u.id);setSuccess("Usuario eliminado.");await load()}catch(e){setError(e.message)}};
  return <div className="page-stack"><section className="welcome-row"><div><h1>Usuarios y roles</h1><p>Administra accesos para administración y recepción.</p></div><button className="primary-button" onClick={create}>＋ Nuevo usuario</button></section>
    {error&&!open&&<div className="alert alert--error">{error}</div>}{success&&<div className="alert alert--success">{success}</div>}
    <article className="panel"><div className="toolbar-row"><input className="compact-search compact-search--wide" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar usuario, nombre, correo o rol..."/></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Usuario</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{loading?<tr><td colSpan="6" className="table-empty">Cargando usuarios...</td></tr>:filtered.map(u=><tr key={u.id}><td><strong>{u.username}</strong></td><td>{u.name}</td><td>{u.email||"—"}</td><td><span className="status-select" title={roleHelp[u.role_display]||""}>{u.role_display}</span></td><td>{u.is_active?"Activo":"Inactivo"}</td><td><div className="table-actions"><button className="text-action" onClick={()=>edit(u)}>Editar</button><button className="danger-link" onClick={()=>remove(u)}>Eliminar</button></div></td></tr>)}</tbody></table></div></article>
    {open&&<div className="modal-backdrop"><section className="modal-card"><div className="modal-header"><div><h3>{editing?"Editar usuario":"Nuevo usuario"}</h3><p>Administrador tiene control total. Recepción gestiona la operación diaria.</p></div><button className="modal-close" onClick={()=>!saving&&setOpen(false)}>×</button></div>{error&&<div className="alert alert--error">{error}</div>}<form className="form-grid" onSubmit={submit}>
      <label className="field"><span>Usuario</span><input required value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></label><label className="field"><span>Correo</span><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label className="field"><span>Nombre</span><input value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/></label><label className="field"><span>Apellido</span><input value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/></label>
      <label className="field"><span>Rol</span><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>Administrador</option><option>Recepción</option></select></label><label className="field"><span>{editing?"Nueva contraseña (opcional)":"Contraseña"}</span><input type="password" minLength="8" required={!editing} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <label className="field field--full form-check-row"><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/><span>Usuario activo</span></label><div className="form-actions field--full"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving?"Guardando...":"Guardar usuario"}</button></div>
    </form></section></div>}
  </div>
}
