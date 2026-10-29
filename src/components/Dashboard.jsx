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
  const income = movements
      .filter((x) => x.type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0),
    expenses = movements
      .filter((x) => x.type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  const chart = [
    { day: "Lun", income: 3200, expense: 1400 },
    { day: "Mar", income: 4700, expense: 2100 },
    { day: "Mié", income: 3900, expense: 1800 },
    { day: "Jue", income: 6100, expense: 2700 },
    { day: "Vie", income: 5200, expense: 1900 },
    { day: "Sáb", income: 7800, expense: 3100 },
    { day: "Dom", income: income || 2100, expense: expenses || 1200 },
  ];
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
          <p className="eyebrow">JUEVES, 29 DE OCTUBRE DE 2026</p>
          <h1>Tu negocio, en perspectiva.</h1>
          <p className="muted">
            Un vistazo claro a cómo está funcionando tu pastelería.
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
      <div className="stat-grid">
        <StatCard
          label="Ingresos registrados"
          value={money(income || 21900)}
          change="+12,8%"
          note="vs. período anterior"
          icon={ArrowDownLeft}
          tone="mint"
        />
        <StatCard
          label="Gastos registrados"
          value={money(expenses || 8470)}
          change="-4,2%"
          note="vs. período anterior"
          icon={ArrowUpRight}
          tone="rose"
        />
        <StatCard
          label="Resultado del período"
          value={money(income - expenses || 13430)}
          change="+18,4%"
          note="resultado operativo"
          icon={Wallet}
          tone="lilac"
        />
        <StatCard
          label="Margen estimado"
          value="61,3%"
          change="+2,1 pts"
          note="sobre ingresos"
          icon={TrendingUp}
          tone="sand"
        />
      </div>
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
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel alert-panel">
          <div className="panel-heading">
            <div>
              <h2>Para tener en cuenta</h2>
              <p className="muted">Pequeños avisos, grandes diferencias.</p>
            </div>
            <span className="alert-count">{alerts.length || 2}</span>
          </div>
          <div className="alert-list">
            {(alerts.length
              ? alerts
              : [
                  {
                    id: "a",
                    name: "Manteca",
                    stock: 750,
                    min: 1000,
                    unit: "g",
                  },
                  { id: "b", name: "Huevos", stock: 12, min: 24, unit: "un" },
                ]
            ).map((a, i) => (
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
        <span>
          Dulce Balance <i>·</i> Hecho para que los números también salgan
          dulces.
        </span>
        <span>UYU · Uruguay</span>
      </footer>
    </div>
  );
}
