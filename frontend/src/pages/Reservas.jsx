import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const blank = { cliente:"", habitacion:"", fecha_entrada:"", fecha_salida:"", cantidad_personas:1, estado:"pendiente" };
const estados = ["pendiente","confirmada","cancelada","finalizada"];

export default function Reservas(){
  const { isAdmin } = useAuth();
  const [reservas,setReservas]=useState([]), [clientes,setClientes]=useState([]), [habitaciones,setHabitaciones]=useState([]);
  const [disponibles,setDisponibles]=useState([]), [form,setForm]=useState(blank), [editing,setEditing]=useState(null);
  const [open,setOpen]=useState(false), [loading,setLoading]=useState(true), [saving,setSaving]=useState(false), [checking,setChecking]=useState(false);
  const [error,setError]=useState(""), [success,setSuccess]=useState(""), [search,setSearch]=useState(""), [filter,setFilter]=useState("todas");

  const load=async()=>{ setLoading(true); try{const [r,c,h]=await Promise.all([api.getReservas(),api.getClientes(),api.getHabitaciones()]);setReservas(r);setClientes(c);setHabitaciones(h);}catch(e){setError(e.message)}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);

  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return reservas.filter(r=>(filter==="todas"||r.estado===filter)&&(!q||[r.codigo_reserva,r.cliente_nombre,r.cliente_ci,r.habitacion_numero].some(v=>String(v||"").toLowerCase().includes(q))))},[reservas,search,filter]);

  const checkAvailability=async(nextForm=form,id=editing?.id)=>{
    if(!nextForm.fecha_entrada||!nextForm.fecha_salida||nextForm.fecha_salida<=nextForm.fecha_entrada){setDisponibles([]);return}
    setChecking(true); try{const h=await api.getDisponibilidad(nextForm.fecha_entrada,nextForm.fecha_salida,id||"");setDisponibles(h);}catch(e){setError(e.message);setDisponibles([])}finally{setChecking(false)}
  };
  useEffect(()=>{ if(open) checkAvailability(form,editing?.id); },[form.fecha_entrada,form.fecha_salida,open]);

  const openNew=()=>{setEditing(null);setForm(blank);setDisponibles([]);setError("");setSuccess("");setOpen(true)};
  const openEdit=(r)=>{setEditing(r);setForm({cliente:String(r.cliente||""),habitacion:String(r.habitacion||""),fecha_entrada:r.fecha_entrada,fecha_salida:r.fecha_salida,cantidad_personas:r.cantidad_personas,estado:r.estado});setError("");setSuccess("");setOpen(true)};
  const close=()=>{if(!saving){setOpen(false);setEditing(null);setError("")}};

  const submit=async(e)=>{e.preventDefault();setSaving(true);setError("");try{const payload={...form,cliente:Number(form.cliente),habitacion:Number(form.habitacion),cantidad_personas:Number(form.cantidad_personas)};if(editing)await api.updateReserva(editing.id,payload);else await api.createReserva(payload);setOpen(false);setSuccess(editing?"Reserva actualizada correctamente.":"Reserva creada y guardada en Supabase.");setEditing(null);await load()}catch(e){setError(e.message)}finally{setSaving(false)}};
  const changeEstado=async(r,estado)=>{setError("");try{await api.updateReserva(r.id,{estado});setSuccess(`Reserva ${r.codigo_reserva} actualizada.`);await load()}catch(e){setError(e.message)}};
  const remove=async(r)=>{if(!window.confirm(`¿Eliminar definitivamente ${r.codigo_reserva}?`))return;try{await api.deleteReserva(r.id);setSuccess("Reserva eliminada.");await load()}catch(e){setError(e.message)}};

  const selectedRoom = habitaciones.find(h=>String(h.id)===String(form.habitacion));
  const nights = form.fecha_entrada&&form.fecha_salida&&form.fecha_salida>form.fecha_entrada ? Math.round((new Date(form.fecha_salida+"T00:00:00Z")-new Date(form.fecha_entrada+"T00:00:00Z"))/86400000) : 0;
  const estimate = selectedRoom && nights ? Number(selectedRoom.precio)*nights : 0;

  return <div className="page-stack">
    <section className="welcome-row"><div><h1>Reservas</h1><p>Gestión completa con disponibilidad y validaciones reales.</p></div><button className="primary-button" onClick={openNew}><span>＋</span>Nueva reserva</button></section>
    {error&&!open&&<div className="alert alert--error">{error}</div>}{success&&<div className="alert alert--success">{success}</div>}
    <article className="panel">
      <div className="toolbar-row"><input className="compact-search compact-search--wide" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar código, huésped, CI o habitación..."/><select className="period-select" value={filter} onChange={e=>setFilter(e.target.value)}><option value="todas">Todos los estados</option>{estados.map(x=><option key={x} value={x}>{x}</option>)}</select></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Código</th><th>Huésped</th><th>Habitación</th><th>Estadía</th><th>Personas</th><th>Total est.</th><th>Pago</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
        {loading?<tr><td colSpan="9" className="table-empty">Cargando...</td></tr>:filtered.length?filtered.map(r=><tr key={r.id}><td><strong>{r.codigo_reserva}</strong></td><td><strong>{r.cliente_nombre||r.nombre_cliente}</strong><br/><small>{r.cliente_ci?`CI ${r.cliente_ci}`:""}</small></td><td>{r.habitacion_numero?`Hab. ${r.habitacion_numero}`:"Sin asignar"}<br/><small>{r.habitacion_tipo||""}</small></td><td>{r.fecha_entrada}<br/><small>hasta {r.fecha_salida} · {r.noches} noche(s)</small></td><td>{r.cantidad_personas}</td><td>{r.total_estimado!=null?`Bs ${Number(r.total_estimado).toFixed(2)}`:"—"}</td><td><span className={`status-select status-${r.estado_pago}`}>{r.estado_pago}</span><br/><small>Saldo: {r.saldo_pendiente!=null?`Bs ${Number(r.saldo_pendiente).toFixed(2)}`:"—"}</small></td><td><select className={`status-select status-${r.estado}`} value={r.estado} onChange={e=>changeEstado(r,e.target.value)}>{estados.map(x=><option key={x}>{x}</option>)}</select></td><td><div className="table-actions"><button className="text-action" onClick={()=>openEdit(r)}>Editar</button>{isAdmin&&<button className="danger-link" onClick={()=>remove(r)}>Eliminar</button>}</div></td></tr>):<tr><td colSpan="9" className="table-empty">No hay reservas que coincidan.</td></tr>}
      </tbody></table></div>
    </article>

    {open&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><section className="modal-card" role="dialog" aria-modal="true"><div className="modal-header"><div><h3>{editing?`Editar ${editing.codigo_reserva}`:"Nueva reserva"}</h3><p>{editing?"Actualiza los datos sin perder el historial.":"El código se genera automáticamente en el servidor."}</p></div><button className="modal-close" onClick={close}>×</button></div>
      {error&&<div className="alert alert--error">{error}</div>}
      <form className="form-grid" onSubmit={submit}>
        <label className="field field--full"><span>Cliente</span><select required value={form.cliente} onChange={e=>setForm({...form,cliente:e.target.value})}><option value="">Selecciona un cliente</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nombre} — CI {c.ci}</option>)}</select><small>Los clientes se administran en el módulo Clientes.</small></label>
        <label className="field"><span>Entrada</span><input type="date" required value={form.fecha_entrada} onChange={e=>setForm({...form,fecha_entrada:e.target.value,habitacion:""})}/></label>
        <label className="field"><span>Salida</span><input type="date" min={form.fecha_entrada||undefined} required value={form.fecha_salida} onChange={e=>setForm({...form,fecha_salida:e.target.value,habitacion:""})}/></label>
        <label className="field field--full"><span>Habitación disponible</span><select required disabled={checking||!form.fecha_entrada||!form.fecha_salida} value={form.habitacion} onChange={e=>setForm({...form,habitacion:e.target.value})}><option value="">{checking?"Consultando disponibilidad...":"Selecciona una habitación"}</option>{disponibles.map(h=><option key={h.id} value={h.id}>Hab. {h.numero} · {h.tipo} · Bs {h.precio}</option>)}</select><small>{form.fecha_entrada&&form.fecha_salida&&!checking?`${disponibles.length} habitación(es) disponible(s) para esas fechas.`:"Primero selecciona las fechas."}</small></label>
        <label className="field"><span>Personas</span><input type="number" min="1" required value={form.cantidad_personas} onChange={e=>setForm({...form,cantidad_personas:e.target.value})}/></label>
        <label className="field"><span>Estado</span><select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}>{estados.map(x=><option key={x}>{x}</option>)}</select></label>
        {nights>0&&selectedRoom&&<div className="booking-summary field--full"><div><span>Estadía</span><strong>{nights} noche(s)</strong></div><div><span>Tarifa</span><strong>Bs {selectedRoom.precio}</strong></div><div><span>Total estimado</span><strong>Bs {estimate.toFixed(2)}</strong></div></div>}
        <div className="form-actions field--full"><button type="button" className="secondary-button" onClick={close}>Cancelar</button><button className="primary-button" disabled={saving||checking}>{saving?"Guardando...":editing?"Guardar cambios":"Crear reserva"}</button></div>
      </form></section></div>}
  </div>
}
