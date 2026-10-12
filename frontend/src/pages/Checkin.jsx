import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const estados = ["todos", "hospedado", "finalizado"];

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function Checkin(){
  const [registros,setRegistros]=useState([]), [candidatos,setCandidatos]=useState([]);
  const [loading,setLoading]=useState(true), [saving,setSaving]=useState(false);
  const [error,setError]=useState(""), [success,setSuccess]=useState("");
  const [search,setSearch]=useState(""), [filter,setFilter]=useState("todos");
  const [open,setOpen]=useState(false), [checkoutItem,setCheckoutItem]=useState(null);
  const [form,setForm]=useState({reserva:"",observaciones:""}), [checkoutObs,setCheckoutObs]=useState("");

  const load=async()=>{setLoading(true);setError("");try{const [r,c]=await Promise.all([api.getCheckins(),api.getCheckinCandidatos()]);setRegistros(r);setCandidatos(c)}catch(e){setError(e.message)}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);

  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return registros.filter(r=>(filter==="todos"||r.estado===filter)&&(!q||[r.codigo_reserva,r.cliente_nombre,r.nombre_cliente,r.habitacion_numero].some(v=>String(v||"").toLowerCase().includes(q))))},[registros,search,filter]);
  const hospedados=registros.filter(r=>r.estado==="hospedado").length;
  const finalizados=registros.filter(r=>r.estado==="finalizado").length;

  const openCheckin=()=>{setForm({reserva:"",observaciones:""});setError("");setSuccess("");setOpen(true)};
  const submitCheckin=async(e)=>{e.preventDefault();setSaving(true);setError("");try{await api.createCheckin({reserva:Number(form.reserva),observaciones:form.observaciones});setOpen(false);setSuccess("Check-in registrado. La habitación ahora figura como ocupada.");await load()}catch(e){setError(e.message)}finally{setSaving(false)}};
  const openCheckout=(r)=>{setCheckoutItem(r);setCheckoutObs(r.observaciones||"");setError("");setSuccess("")};
  const submitCheckout=async(e)=>{e.preventDefault();setSaving(true);setError("");try{await api.checkout(checkoutItem.id,{observaciones:checkoutObs});setCheckoutItem(null);setSuccess("Check-out registrado. La habitación pasó a limpieza.");await load()}catch(e){setError(e.message)}finally{setSaving(false)}};

  return <div className="page-stack">
    <section className="welcome-row"><div><h1>Check-in / Check-out</h1><p>Control operativo de llegadas, huéspedes alojados y salidas.</p></div><button className="primary-button" onClick={openCheckin}><span>＋</span>Registrar check-in</button></section>
    {error&&!open&&!checkoutItem&&<div className="alert alert--error">{error}</div>}{success&&<div className="alert alert--success">{success}</div>}

    <section className="ops-stats">
      <article><span>Por recibir</span><strong>{candidatos.length}</strong><small>reservas habilitadas</small></article>
      <article><span>Hospedados</span><strong>{hospedados}</strong><small>check-ins activos</small></article>
      <article><span>Finalizados</span><strong>{finalizados}</strong><small>salidas registradas</small></article>
    </section>

    <article className="panel">
      <div className="toolbar-row"><input className="compact-search compact-search--wide" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar reserva, huésped o habitación..."/><select className="period-select" value={filter} onChange={e=>setFilter(e.target.value)}>{estados.map(x=><option key={x} value={x}>{x==="todos"?"Todos los estados":x}</option>)}</select></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Reserva</th><th>Huésped</th><th>Habitación</th><th>Check-in</th><th>Check-out</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
        {loading?<tr><td colSpan="7" className="table-empty">Cargando...</td></tr>:filtered.length?filtered.map(r=><tr key={r.id}><td><strong>{r.codigo_reserva}</strong><br/><small>{r.fecha_entrada} → {r.fecha_salida}</small></td><td>{r.cliente_nombre||r.nombre_cliente}</td><td>{r.habitacion_numero?`Hab. ${r.habitacion_numero}`:"—"}</td><td>{formatDateTime(r.fecha_checkin)}</td><td>{formatDateTime(r.fecha_checkout)}</td><td><span className={`status-select status-${r.estado}`}>{r.estado}</span></td><td>{r.estado==="hospedado"?<button className="text-action" onClick={()=>openCheckout(r)}>Hacer check-out</button>:<small>Completado</small>}</td></tr>):<tr><td colSpan="7" className="table-empty">Todavía no hay movimientos de check-in/check-out.</td></tr>}
      </tbody></table></div>
    </article>

    {open&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&!saving&&setOpen(false)}><section className="modal-card" role="dialog" aria-modal="true"><div className="modal-header"><div><h3>Registrar check-in</h3><p>Al confirmar, la habitación cambiará automáticamente a ocupada.</p></div><button className="modal-close" onClick={()=>!saving&&setOpen(false)}>×</button></div>{error&&<div className="alert alert--error">{error}</div>}
      <form className="form-grid" onSubmit={submitCheckin}><label className="field field--full"><span>Reserva</span><select required value={form.reserva} onChange={e=>setForm({...form,reserva:e.target.value})}><option value="">Selecciona una reserva</option>{candidatos.map(r=><option key={r.id} value={r.id}>{r.codigo_reserva} · {r.cliente_nombre||r.nombre_cliente} · Hab. {r.habitacion_numero}</option>)}</select><small>Solo aparecen reservas pendientes o confirmadas con habitación asignada.</small></label><label className="field field--full"><span>Observaciones</span><textarea rows="4" value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})} placeholder="Documento entregado, equipaje, indicaciones especiales..."/></label><div className="form-actions field--full"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving||!form.reserva}>{saving?"Registrando...":"Confirmar check-in"}</button></div></form>
    </section></div>}

    {checkoutItem&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&!saving&&setCheckoutItem(null)}><section className="modal-card" role="dialog" aria-modal="true"><div className="modal-header"><div><h3>Registrar check-out</h3><p>{checkoutItem.codigo_reserva} · Hab. {checkoutItem.habitacion_numero} · {checkoutItem.cliente_nombre||checkoutItem.nombre_cliente}</p></div><button className="modal-close" onClick={()=>!saving&&setCheckoutItem(null)}>×</button></div>{error&&<div className="alert alert--error">{error}</div>}
      <form className="form-grid" onSubmit={submitCheckout}><div className="checkout-note field--full"><strong>Al completar la salida:</strong><span>la reserva quedará finalizada y la habitación pasará automáticamente a limpieza.</span></div><label className="field field--full"><span>Observaciones de salida</span><textarea rows="4" value={checkoutObs} onChange={e=>setCheckoutObs(e.target.value)} placeholder="Estado de la habitación, novedades, objetos olvidados..."/></label><div className="form-actions field--full"><button type="button" className="secondary-button" onClick={()=>setCheckoutItem(null)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving?"Procesando...":"Confirmar check-out"}</button></div></form>
    </section></div>}
  </div>
}
