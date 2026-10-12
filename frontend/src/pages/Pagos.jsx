import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const métodos = [
  ["efectivo", "Efectivo"],
  ["qr", "QR"],
  ["tarjeta", "Tarjeta"],
];

const money = (value) => `Bs ${Number(value || 0).toFixed(2)}`;
const formatDateTime = (value) => value ? new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export default function Pagos(){
  const { isAdmin } = useAuth();
  const [pagos,setPagos]=useState([]), [reservas,setReservas]=useState([]);
  const [loading,setLoading]=useState(true), [saving,setSaving]=useState(false);
  const [error,setError]=useState(""), [success,setSuccess]=useState("");
  const [search,setSearch]=useState(""), [filter,setFilter]=useState("todos");
  const [open,setOpen]=useState(false), [form,setForm]=useState({reserva:"",monto:"",metodo_pago:"efectivo"});

  const load=async()=>{setLoading(true);setError("");try{const [p,r]=await Promise.all([api.getPagos(),api.getReservas()]);setPagos(p);setReservas(r)}catch(e){setError(e.message)}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);

  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return pagos.filter(p=>(filter==="todos"||p.estado_pago===filter)&&(!q||[p.codigo_reserva,p.cliente_nombre,p.nombre_cliente,p.habitacion_numero,p.metodo_pago].some(v=>String(v||"").toLowerCase().includes(q))))},[pagos,search,filter]);
  const totalCobrado=pagos.filter(p=>p.estado_pago==="pagado").reduce((s,p)=>s+Number(p.monto||0),0);
  const saldoPendiente=reservas.filter(r=>r.estado!=="cancelada").reduce((s,r)=>s+Number(r.saldo_pendiente||0),0);
  const pagosActivos=pagos.filter(p=>p.estado_pago==="pagado").length;
  const anulados=pagos.filter(p=>p.estado_pago==="anulado").length;
  const selected=reservaById(reservas,form.reserva);

  function reservaById(list,id){return list.find(r=>String(r.id)===String(id));}
  const openForm=()=>{setForm({reserva:"",monto:"",metodo_pago:"efectivo"});setError("");setSuccess("");setOpen(true)};
  const onReservaChange=(id)=>{const r=reservaById(reservas,id);setForm(f=>({...f,reserva:id,monto:r?.saldo_pendiente?Number(r.saldo_pendiente).toFixed(2):""}))};
  const submit=async(e)=>{e.preventDefault();setSaving(true);setError("");try{await api.createPago({reserva:Number(form.reserva),monto:form.monto,metodo_pago:form.metodo_pago,estado_pago:"pagado"});setOpen(false);setSuccess("Pago registrado correctamente.");await load()}catch(e){setError(e.message)}finally{setSaving(false)}};
  const anular=async(p)=>{if(!window.confirm(`¿Anular el pago de ${money(p.monto)} de ${p.codigo_reserva}?`))return;setError("");try{await api.anularPago(p.id);setSuccess("Pago anulado. El saldo de la reserva fue recalculado.");await load()}catch(e){setError(e.message)}};

  return <div className="page-stack">
    <section className="welcome-row"><div><h1>Pagos</h1><p>Registra cobros parciales o totales y controla saldos por reserva.</p></div><button className="primary-button" onClick={openForm}><span>＋</span>Registrar pago</button></section>
    {error&&!open&&<div className="alert alert--error">{error}</div>}{success&&<div className="alert alert--success">{success}</div>}

    <section className="ops-stats payment-stats">
      <article><span>Total cobrado</span><strong>{money(totalCobrado)}</strong><small>pagos confirmados</small></article>
      <article><span>Saldo pendiente</span><strong>{money(saldoPendiente)}</strong><small>reservas no canceladas</small></article>
      <article><span>Pagos vigentes</span><strong>{pagosActivos}</strong><small>{anulados} anulados</small></article>
    </section>

    <article className="panel">
      <div className="toolbar-row"><input className="compact-search compact-search--wide" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar reserva, huésped, habitación o método..."/><select className="period-select" value={filter} onChange={e=>setFilter(e.target.value)}><option value="todos">Todos los estados</option><option value="pagado">Pagados</option><option value="pendiente">Pendientes</option><option value="anulado">Anulados</option></select></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Fecha</th><th>Reserva</th><th>Huésped</th><th>Monto</th><th>Método</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
        {loading?<tr><td colSpan="7" className="table-empty">Cargando...</td></tr>:filtered.length?filtered.map(p=><tr key={p.id}><td>{formatDateTime(p.fecha_pago)}</td><td><strong>{p.codigo_reserva}</strong><br/><small>{p.habitacion_numero?`Hab. ${p.habitacion_numero}`:"Sin habitación"}</small></td><td>{p.cliente_nombre||p.nombre_cliente}</td><td><strong>{money(p.monto)}</strong></td><td className="capitalize">{p.metodo_pago}</td><td><span className={`status-select status-${p.estado_pago}`}>{p.estado_pago}</span></td><td>{p.estado_pago!=="anulado"&&isAdmin?<button className="danger-link" onClick={()=>anular(p)}>Anular</button>:<small>Sin acciones</small>}</td></tr>):<tr><td colSpan="7" className="table-empty">Todavía no hay pagos registrados.</td></tr>}
      </tbody></table></div>
    </article>

    {open&&<div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&!saving&&setOpen(false)}><section className="modal-card" role="dialog" aria-modal="true"><div className="modal-header"><div><h3>Registrar pago</h3><p>El sistema impide registrar más dinero que el saldo pendiente.</p></div><button className="modal-close" onClick={()=>!saving&&setOpen(false)}>×</button></div>{error&&<div className="alert alert--error">{error}</div>}
      <form className="form-grid" onSubmit={submit}><label className="field field--full"><span>Reserva</span><select required value={form.reserva} onChange={e=>onReservaChange(e.target.value)}><option value="">Selecciona una reserva</option>{reservas.filter(r=>r.estado!=="cancelada"&&Number(r.saldo_pendiente||0)>0).map(r=><option key={r.id} value={r.id}>{r.codigo_reserva} · {r.cliente_nombre||r.nombre_cliente} · saldo {money(r.saldo_pendiente)}</option>)}</select></label>
      {selected&&<div className="payment-summary field--full"><div><span>Total reserva</span><strong>{money(selected.total_estimado)}</strong></div><div><span>Ya pagado</span><strong>{money(selected.total_pagado)}</strong></div><div><span>Saldo</span><strong>{money(selected.saldo_pendiente)}</strong></div><div><span>Estado</span><strong className="capitalize">{selected.estado_pago}</strong></div></div>}
      <label className="field"><span>Monto</span><input required min="0.01" step="0.01" type="number" value={form.monto} onChange={e=>setForm({...form,monto:e.target.value})}/><small>Máximo: {selected?money(selected.saldo_pendiente):"—"}</small></label><label className="field"><span>Método de pago</span><select value={form.metodo_pago} onChange={e=>setForm({...form,metodo_pago:e.target.value})}>{métodos.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><div className="form-actions field--full"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary-button" disabled={saving||!form.reserva||!form.monto}>{saving?"Guardando...":"Confirmar pago"}</button></div></form>
    </section></div>}
  </div>
}
