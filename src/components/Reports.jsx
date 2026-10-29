import React from "react";
import { Download, FileText, TrendingUp, TriangleAlert } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { recipeCost } from "./Recipes";
const money = (n) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(n || 0);
export default function Reports({ movements, recipes, ingredients }) {
  const income = movements
      .filter((x) => x.type === "income")
      .reduce((s, x) => s + Number(x.amount || 0), 0),
    expense = movements
      .filter((x) => x.type === "expense")
      .reduce((s, x) => s + Number(x.amount || 0), 0);
  const chart = [
    { month: "May", in: 24600, out: 15200 },
    { month: "Jun", in: 28300, out: 17400 },
    { month: "Jul", in: 26700, out: 16900 },
    { month: "Ago", in: 31900, out: 19200 },
    { month: "Set", in: 35600, out: 21700 },
    { month: "Oct", in: income || 38200, out: expense || 22400 },
  ];
  const ranked = recipes
    .map((r) => ({
      name: r.name,
      cost: recipeCost(r, ingredients) / Math.max(1, r.yield),
      price: r.price || 0,
      profit:
        (r.price || 0) - recipeCost(r, ingredients) / Math.max(1, r.yield),
    }))
    .sort((a, b) => b.profit - a.profit);
  const exportReport = () => {
    const rows = [
      ["Reporte", "Dulce Balance"],
      ["Ingresos", income],
      ["Gastos", expense],
      ["Resultado", income - expense],
      [],
      ["Producto", "Costo unitario", "Precio", "Ganancia estimada"],
      ...ranked.map((r) => [r.name, r.cost, r.price, r.profit]),
    ];
    const csv = rows
      .map((r) =>
        r.map((x) => `"${String(x ?? "").replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = "reporte-dulce-balance.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">ANÁLISIS Y DECISIONES</p>
          <h1>Los números cuentan.</h1>
          <p className="muted">
            Compará períodos y encontrá oportunidades para mejorar el margen.
          </p>
        </div>
        <button className="btn-primary" onClick={exportReport}>
          <Download size={17} /> Exportar reporte
        </button>
      </div>
      <div className="report-kpis">
        <div className="report-kpi">
          <span>Ingresos registrados</span>
          <b>{money(income || 175400)}</b>
          <small className="positive">↑ 12,8% vs. período anterior</small>
        </div>
        <div className="report-kpi">
          <span>Egresos registrados</span>
          <b>{money(expense || 102800)}</b>
          <small className="negative">↓ 4,2% vs. período anterior</small>
        </div>
        <div className="report-kpi">
          <span>Resultado neto estimado</span>
          <b>{money(income - expense || 72600)}</b>
          <small>
            <TrendingUp size={13} /> Resultado del período seleccionado
          </small>
        </div>
      </div>
      <section className="panel report-chart-panel">
        <div className="panel-heading">
          <div>
            <h2>Ingresos frente a egresos</h2>
            <p className="muted">Comparativa mensual · últimos seis meses</p>
          </div>
          <span className="chart-unit">UYU · pesos uruguayos</span>
        </div>
        <div className="report-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chart}
              barGap={7}
              margin={{ top: 12, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid stroke="#eeece6" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8c8c83", fontSize: 12 }}
                dy={9}
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
              <Bar
                dataKey="in"
                name="Ingresos"
                fill="#4c9477"
                radius={[5, 5, 0, 0]}
              />
              <Bar
                dataKey="out"
                name="Egresos"
                fill="#d3a098"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="report-bottom-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Ranking de rentabilidad</h2>
              <p className="muted">
                Ordenado por ganancia estimada por unidad.
              </p>
            </div>
          </div>
          {ranked.length ? (
            ranked.map((r, i) => (
              <div className="rank-row" key={r.name}>
                <span className="rank-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="rank-info">
                  <b>{r.name}</b>
                  <div className="rank-meter">
                    <i
                      style={{
                        width: `${Math.max(5, Math.min(100, (r.profit / Math.max(...ranked.map((x) => x.profit), 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="rank-money">
                  <b>{money(r.profit)}</b>
                  <small>por unidad</small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">
              Agregá recetas para conocer la rentabilidad.
            </p>
          )}
        </section>
        <section className="panel losses-panel">
          <div className="panel-heading">
            <div>
              <h2>Control de pérdidas</h2>
              <p className="muted">Mermas y vencimientos registrados.</p>
            </div>
            <TriangleAlert size={19} />
          </div>
          <div className="loss-total">
            {money(
              movements
                .filter((m) => m.category === "Merma")
                .reduce((s, m) => s + Number(m.amount || 0), 0),
            )}
          </div>
          <span className="muted">Pérdidas registradas como merma</span>
          <div className="loss-note">
            <FileText size={17} />
            <p>
              Registrá cada merma desde inventario para conocer su costo y
              evitar que distorsione el margen de tus productos.
            </p>
          </div>
        </section>
      </div>
      <p className="report-disclaimer">
        Los gráficos y variaciones de demostración se reemplazan por datos
        reales al conectar Firebase. El resultado es una estimación operativa y
        no sustituye la liquidación contable o tributaria.
      </p>
    </div>
  );
}
