import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const MONEY = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function StatIcon({ name }) {
  const icon = {
    bed: <><path d="M3 19v-8M21 19v-6a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v6M3 15h18M7 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/></>,
    door: <><path d="M4 21h16M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M14 12h.01"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6"/><path d="M16 13h2"/></>,
    key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M15 8l2 2M17 6l2 2"/></>,
  };
  return <svg viewBox="0 0 24 24">{icon[name]}</svg>;
}

function money(value) {
  return `Bs ${MONEY.format(Number(value || 0))}`;
}

function ActivityIcon({ type }) {
  const symbols = { reserva: "R", pago: "$", checkin: "↘", checkout: "↗" };
  return <span className={`activity-icon activity-icon--${type}`}>{symbols[type] || "•"}</span>;
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError("");
    api.getDashboard()
      .then(setDashboard)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const m = dashboard?.metricas || {};
  const rooms = dashboard?.habitaciones_por_estado || {};
  const chart = dashboard?.ingresos_7_dias || [];
  const maxIncome = useMemo(() => Math.max(1, ...chart.map((item) => Number(item.total || 0))), [chart]);

  const stats = [
    { title: "Disponibles", value: m.habitaciones_disponibles ?? "—", note: `${m.habitaciones_total ?? 0} habitaciones registradas`, tone: "green", icon: "bed" },
    { title: "Ocupadas", value: m.habitaciones_ocupadas ?? "—", note: `${m.ocupacion_porcentaje ?? 0}% de ocupación`, tone: "blue", icon: "door" },
    { title: "Llegadas hoy", value: m.llegadas_hoy ?? "—", note: `${m.checkins_pendientes_hoy ?? 0} check-ins pendientes`, tone: "violet", icon: "calendar" },
    { title: "Huéspedes alojados", value: m.huespedes_hospedados ?? "—", note: `${m.salidas_hoy ?? 0} salidas previstas hoy`, tone: "blue", icon: "users" },
    { title: "Ingresos hoy", value: money(m.ingreso_hoy), note: `${money(m.ingreso_semana)} en 7 días`, tone: "amber", icon: "wallet" },
    { title: "Reservas activas", value: m.reservas_activas ?? "—", note: `${m.checkins_hoy ?? 0} check-ins realizados hoy`, tone: "green", icon: "key" },
  ];

  return <div className="dashboard page-stack">
    <section className="welcome-row">
      <div><h1>Resumen del hotel</h1><p>Operación e ingresos en tiempo real desde Django y Supabase.</p></div>
      <div className="dashboard-head-actions"><button className="secondary-button" onClick={load} disabled={loading}>{loading ? "Actualizando…" : "Actualizar"}</button><Link to="/reservas" className="primary-button"><span>＋</span> Nueva reserva</Link></div>
    </section>

    {error && <div className="alert alert--error">No se pudo cargar el dashboard: {error}</div>}

    <section className="stats-grid stats-grid--dashboard">
      {stats.map((stat) => <article className="stat-card" key={stat.title}><div className={`stat-icon ${stat.tone}`}><StatIcon name={stat.icon}/></div><div className="stat-copy"><span>{stat.title}</span><strong>{stat.value}</strong><small>{stat.note}</small></div></article>)}
    </section>

    <section className="dashboard-grid dashboard-grid--metrics">
      <article className="panel panel--wide">
        <div className="panel-header"><div><h3>Ingresos de los últimos 7 días</h3><p>Total cobrado: {money(m.ingreso_semana)}</p></div><strong className="metric-highlight">Mes: {money(m.ingreso_mes)}</strong></div>
        <div className="revenue-chart" aria-label="Ingresos de los últimos siete días">
          {chart.map((item) => <div className="revenue-bar" key={item.fecha} title={`${item.etiqueta}: ${money(item.total)}`}><div className="revenue-value">{Number(item.total) > 0 ? money(item.total) : ""}</div><div className="revenue-track"><span style={{ height: `${Math.max(4, Number(item.total || 0) / maxIncome * 100)}%` }} /></div><small>{item.etiqueta}</small></div>)}
        </div>
      </article>

      <article className="panel occupancy-panel">
        <div className="panel-header"><div><h3>Ocupación</h3><p>Estado operativo actual</p></div><strong className="occupancy-number">{m.ocupacion_porcentaje ?? 0}%</strong></div>
        <div className="occupancy-progress"><span style={{ width: `${Math.min(100, Number(m.ocupacion_porcentaje || 0))}%` }} /></div>
        <div className="room-legend room-legend--large">{["disponible","reservada","ocupada","limpieza","mantenimiento"].map((status) => <div className="legend-row" key={status}><span className={`legend-dot legend-dot--${status}`}></span><span>{status}</span><strong>{rooms[status] || 0}</strong></div>)}</div>
        <Link className="secondary-button full-width center-link" to="/habitaciones">Gestionar habitaciones</Link>
      </article>
    </section>

    <section className="dashboard-grid dashboard-grid--ops">
      <article className="panel panel--wide">
        <div className="panel-header"><div><h3>Próximas llegadas</h3><p>Reservas pendientes o confirmadas</p></div><Link className="text-button" to="/reservas">Ver reservas →</Link></div>
        <div className="guest-list">{dashboard?.proximas_llegadas?.length ? dashboard.proximas_llegadas.map((r) => <div className="guest-row" key={r.id}><div className="guest-main"><div className="avatar guest-avatar">{r.cliente.slice(0,2).toUpperCase()}</div><div><strong>{r.cliente}</strong><span>{r.habitacion ? `Habitación ${r.habitacion} · ${r.codigo_reserva}` : `${r.codigo_reserva} · Sin habitación`}</span></div></div><span className="guest-time">{r.fecha_entrada}</span><span className={`status-pill ${r.estado}`}>{r.estado}</span><Link className="row-action" to="/checkin">Gestionar</Link></div>) : <div className="table-empty">No hay próximas llegadas.</div>}</div>
      </article>

      <article className="panel">
        <div className="panel-header"><div><h3>Salidas pendientes</h3><p>Huéspedes hospedados con salida hoy o vencida</p></div><Link className="text-button" to="/checkin">Recepción →</Link></div>
        <div className="checkout-list">{dashboard?.salidas_pendientes?.length ? dashboard.salidas_pendientes.map((item) => <div className="checkout-row" key={item.id}><div><strong>{item.cliente}</strong><span>Hab. {item.habitacion || "—"} · {item.codigo_reserva}</span></div><div className={item.atrasado ? "checkout-date checkout-date--late" : "checkout-date"}>{item.atrasado ? "Vencida" : "Hoy"}<small>{item.fecha_salida}</small></div></div>) : <div className="table-empty">No hay salidas pendientes.</div>}</div>
      </article>
    </section>

    <section className="dashboard-grid dashboard-grid--activity">
      <article className="panel panel--wide">
        <div className="panel-header"><div><h3>Actividad reciente</h3><p>Reservas, pagos y movimientos de recepción</p></div></div>
        <div className="activity-list">{dashboard?.actividad_reciente?.length ? dashboard.actividad_reciente.map((item, index) => <div className="activity-row" key={`${item.tipo}-${item.fecha}-${index}`}><ActivityIcon type={item.tipo}/><div><strong>{item.titulo}</strong><span>{item.detalle}</span></div><time>{new Date(item.fecha).toLocaleString("es-BO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></div>) : <div className="table-empty">Todavía no hay actividad.</div>}</div>
      </article>

      <article className="panel"><div className="panel-header"><div><h3>Acciones rápidas</h3><p>Operación diaria</p></div></div><div className="quick-actions"><Link to="/reservas"><span>＋</span><div><strong>Nueva reserva</strong><small>Crear una estancia</small></div></Link><Link to="/checkin"><span>↘</span><div><strong>Check-in / Check-out</strong><small>Atender recepción</small></div></Link><Link to="/pagos"><span>$</span><div><strong>Registrar pago</strong><small>Cobrar una reserva</small></div></Link></div></article>
    </section>
  </div>;
}
