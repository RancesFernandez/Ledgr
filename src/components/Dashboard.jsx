import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Download,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "./StatCard";
const money = (n) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(n || 0);
export default function Dashboard({
  movements,
  ingredients,
  recipes,
  onAdd,
  onNavigate,
}) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const periodMovements = movements.filter((x) => String(x.date || "").startsWith(currentMonth));
  const income = periodMovements.filter((x) => x.type === "income").reduce((s, x) => s + Number(x.amount || 0), 0);
  const expenses = periodMovements.filter((x) => x.type === "expense").reduce((s, x) => s + Number(x.amount || 0), 0);
  const net = income - expenses;
  const chart = movements
    .filter((m) => {
      const date = new Date(`${m.date}T12:00:00`);
      return !Number.isNaN(date.getTime()) && (Date.now() - date.getTime()) <= 7 * 86400000;
    })
    .reduce((days, m) => {
      const key = m.date;
      let day = days.find((x) => x.date === key);
      if (!day) {
        day = { date: key, day: new Intl.DateTimeFormat("es-UY", { weekday: "short" }).format(new Date(`${key}T12:00:00`)), income: 0, expense: 0 };
        days.push(day);
      }
      day[m.type === "income" ? "income" : "expense"] += Number(m.amount || 0);
      return days;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date));
  const alerts = ingredients.filter((i) => Number(i.stock) < Number(i.min));
  const costs = recipes
    .map((r) => ({
      ...r,
      cost:
        r.ingredients.reduce(
          (s, x) =>
            s + (ingredients.find((i) => i.id === x.id)?.cost || 0) * x.qty,
          0,
        ) + (r.labor || 0),
    }))
    .sort((a, b) => b.price - b.cost - (a.price - a.cost));
  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">{new Intl.DateTimeFormat("es-UY", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()).toLocaleUpperCase("es-UY")}</p>
          <h1>Tu negocio, en perspectiva.</h1>
          <p className="muted">
            Un vistazo claro a la actividad de tu negocio.
          </p>
        </div>
        <div className="welcome-actions">
          <button
            className="btn-secondary"
            onClick={() => onNavigate("reports")}
          >
            <CalendarDays size={16} /> Este mes <ChevronDown size={15} />
          </button>
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={17} /> Nuevo movimiento
          </button>
        </div>
      </div>
      <section className="period-summary" aria-label="Resumen financiero del mes">
        <div className="period-summary-heading">
          <div><h2>Ingresos y gastos del período</h2><p>Resumen de {new Intl.DateTimeFormat("es-UY", { month: "long", year: "numeric" }).format(new Date())}. Los movimientos fuera de este mes no se incluyen.</p></div>
          <button className="text-action" onClick={() => onNavigate("movements")}>Ver movimientos →</button>
        </div>
        <div className="period-summary-values">
          <div className="period-value income-value"><span><i/>Ingresos</span><strong>{money(income)}</strong><small>{periodMovements.filter((x) => x.type === "income").length} movimientos</small></div>
          <div className="period-value expense-value"><span><i/>Gastos</span><strong>{money(expenses)}</strong><small>{periodMovements.filter((x) => x.type === "expense").length} movimientos</small></div>
          <div className={`period-value result-value ${net < 0 ? "negative-result" : ""}`}><span><i/>Resultado del período</span><strong>{money(net)}</strong><small>{net >= 0 ? "Ingresos menos gastos" : "Los gastos superan los ingresos"}</small></div>
          <div className="period-value margin-value"><span><i/>Margen sobre ingresos</span><strong>{income > 0 ? `${((net / income) * 100).toLocaleString("es-UY", { maximumFractionDigits: 1 })}%` : "—"}</strong><small>Resultado ÷ ingresos</small></div>
        </div>
      </section>
      <div className="dashboard-grid">
        <section className="panel cashflow-panel">
          <div className="panel-heading">
            <div>
              <h2>Flujo de caja</h2>
              <p className="muted">Ingresos y egresos durante la semana</p>
            </div>
            <button
              className="select-like"
              onClick={() => onNavigate("reports")}
            >
              Últimos 7 días <ChevronDown size={14} />
            </button>
          </div>
          <div className="chart-legend">
            <span>
              <i className="legend-dot mint-dot" /> Ingresos
            </span>
            <span>
              <i className="legend-dot rose-dot" /> Gastos
            </span>
          </div>
          <div className="chart-wrap">
            {chart.length ? <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chart}
                margin={{ top: 10, right: 4, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3c8c70" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3c8c70" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c98078" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#c98078" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eeece6" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8c8c83", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8c8c83", fontSize: 11 }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v) => money(v)}
                  contentStyle={{
                    border: "1px solid #e8e5dc",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Ingresos"
                  stroke="#3c8c70"
                  strokeWidth={2.5}
                  fill="url(#incomeFill)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Gastos"
                  stroke="#c98078"
                  strokeWidth={2.5}
                  fill="url(#expenseFill)"
                />
              </AreaChart>
            </ResponsiveContainer> : <div className="empty-chart">Los movimientos de los últimos 7 días aparecerán aquí.</div>}
          </div>
        </section>
        <section className="panel alert-panel">
          <div className="panel-heading">
            <div>
              <h2>Para tener en cuenta</h2>
              <p className="muted">Pequeños avisos, grandes diferencias.</p>
            </div>
            <span className="alert-count">{alerts.length}</span>
          </div>
          <div className="alert-list">
            {alerts.map((a, i) => (
              <div className="alert-item" key={a.id}>
                <div className={`alert-icon ${i ? "expiry" : "stock"}`}>
                  {i === 0 ? "!" : "◷"}
                </div>
                <div className="alert-copy">
                  <b>{a.name}</b>
                  <span>
                    {a.stock < a.min
                      ? `Quedan ${a.stock} ${a.unit} · stock bajo`
                      : "Revisar fecha de vencimiento"}
                  </span>
                </div>
                <button
                  className="text-action"
                  onClick={() => onNavigate("inventory")}
                >
                  Revisar
                </button>
              </div>
            ))}
            {!alerts.length && <p className="muted empty-inline">Todavía no hay alertas. Al registrar insumos se mostrarán aquí.</p>}
          </div>
          <button
            className="panel-link"
            onClick={() => onNavigate("inventory")}
          >
            Ver inventario completo <span>→</span>
          </button>
        </section>
        <section className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <h2>Movimientos recientes</h2>
              <p className="muted">La actividad más reciente de tu negocio.</p>
            </div>
            <button
              className="text-action"
              onClick={() => onNavigate("movements")}
            >
              Ver todos →
            </button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CONCEPTO</th>
                  <th>CATEGORÍA</th>
                  <th>FECHA</th>
                  <th className="align-right">MONTO</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 4).map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="transaction-name">
                        <span className={`transaction-icon ${m.type}`}>
                          {m.type === "income" ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </span>
                        <div>
                          <b>{m.concept}</b>
                          <small>
                            {m.invoice || m.method || "Sin comprobante"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{m.category}</span>
                    </td>
                    <td className="date-cell">{m.date}</td>
                    <td className={`amount-cell align-right ${m.type}`}>
                      {m.type === "income" ? "+" : "−"}
                      {money(m.amount)}
                    </td>
                  </tr>
                ))}
                {!movements.length && <tr><td colSpan="4" className="empty-table">Todavía no registraste movimientos.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel profitability-panel">
          <div className="panel-heading">
            <div>
              <h2>Productos con mejor margen</h2>
              <p className="muted">Según el costo estimado de receta.</p>
            </div>
            <button
              className="icon-button"
              onClick={() => onNavigate("recipes")}
            >
              <Download size={17} />
            </button>
          </div>
          {costs.length ? (
            costs.slice(0, 3).map((r) => (
              <div className="profit-row" key={r.id}>
                <div className="product-avatar">{r.name.slice(0, 1)}</div>
                <div className="profit-name">
                  <b>{r.name}</b>
                  <small>Precio {money(r.price)}</small>
                </div>
                <div className="profit-value">
                  <b>{money(r.price - r.cost)}</b>
                  <small>margen por receta</small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">Agregá recetas para comparar rentabilidad.</p>
          )}
          <button className="panel-link" onClick={() => onNavigate("reports")}>
            Explorar rentabilidad <span>→</span>
          </button>
        </section>
      </div>
      <footer className="app-footer">
        
        
      </footer>
    </div>
  );
}
