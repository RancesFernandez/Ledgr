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
import { sellingPrice } from "../utils/recipe";
import { exportStyledWorkbook } from "../utils/exportExcel";
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
  const chart = movements.reduce((months, m) => {
    const date = new Date(`${m.date}T12:00:00`);
    if (Number.isNaN(date.getTime())) return months;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    let month = months.find((x) => x.key === key);
    if (!month) {
      month = { key, month: new Intl.DateTimeFormat("es-UY", { month: "short" }).format(date), in: 0, out: 0 };
      months.push(month);
    }
    month[m.type === "income" ? "in" : "out"] += Number(m.amount || 0);
    return months;
  }, []).sort((a, b) => a.key.localeCompare(b.key)).slice(-6);
  const ranked = recipes
    .map((r) => ({
      name: r.name,
      cost: recipeCost(r, ingredients),
      price: sellingPrice(r, ingredients),
      profit:
        sellingPrice(r, ingredients) - recipeCost(r, ingredients),
    }))
    .sort((a, b) => b.profit - a.profit);
  const exportReport = () => {
    const date = new Date().toLocaleDateString("es-UY");
    const movementRows = [
      [{value:"LEDGR · REPORTE FINANCIERO",style:"title",mergeAcross:7}],
      [{value:`Exportado el ${date} · Importes en pesos uruguayos (UYU)`,style:"subtitle",mergeAcross:7}],
      ["Fecha", "Tipo", "Concepto", "Categoría", "Monto (UYU)", "Comprobante", "Método", "Canal"].map(value=>({value,style:"header"})),
      ...movements.map(m=>[m.date || "", m.type === "income" ? "Ingreso" : "Egreso", m.concept || "", m.category || "", {value:Number(m.amount||0),style:"money"}, m.invoice || "", m.method || "", m.channel || ""] .map((v)=>typeof v === "object" ? v : {value:v,style:"text"})),
      [{value:"TOTAL INGRESOS",style:"total"},{value:"",style:"total"},{value:"",style:"total"},{value:"",style:"total"},{value:income,style:"money"},{value:"",style:"total"},{value:"",style:"total"}],
      [{value:"TOTAL EGRESOS",style:"total"},{value:"",style:"total"},{value:"",style:"total"},{value:"",style:"total"},{value:expense,style:"money"},{value:"",style:"total"},{value:"",style:"total"}],
      [{value:"RESULTADO NETO",style:"total"},{value:"",style:"total"},{value:"",style:"total"},{value:"",style:"total"},{value:income-expense,style:"money"},{value:"",style:"total"},{value:"",style:"total"}],
    ];
    const recipeRows = [
      [{value:"LEDGR · RENTABILIDAD DE RECETAS",style:"title",mergeAcross:6}],
      [{value:`Exportado el ${date} · Valores estimados por unidad`,style:"subtitle",mergeAcross:6}],
      ["Receta", "Rinde (porciones)", "Costo elaboración", "Costo producto completo", "Precio producto completo", "Ganancia completa", "Margen"].map(value=>({value,style:"header"})),
      ...ranked.map(r=>{const recipe=recipes.find(x=>x.name===r.name); const price=sellingPrice(recipe,ingredients); const margin=price>0?(price-r.cost)/price:0; return [
        {value:r.name,style:"text"}, {value:Number(recipe.yield||1),style:"number"},
        {value:recipeCost(recipe,ingredients),style:"money"}, {value:r.cost,style:"money"},
        {value:price,style:"money"}, {value:price-r.cost,style:"money"}, {value:margin,style:"percent"}
      ];})
    ];
    const inventoryRows = [
      [{value:"LEDGR · INVENTARIO",style:"title",mergeAcross:5}],
      [{value:`Exportado el ${date} · Importes en pesos uruguayos (UYU)`,style:"subtitle",mergeAcross:5}],
      ["Insumo", "Stock", "Unidad", "Stock mínimo", "Costo unitario", "Valor de stock"].map(value=>({value,style:"header"})),
      ...ingredients.map(i=>[i.name,Number(i.stock||0),i.unit||"",Number(i.min||0),{value:Number(i.cost||0),style:"money"},{value:Number(i.stock||0)*Number(i.cost||0),style:"money"}].map(v=>typeof v === "object"?v:{value:v,style:typeof v === "number"?"number":"text"}))
    ];
    exportStyledWorkbook("ledgr-reporte", [
      {name:"Movimientos",rows:movementRows,widths:[90,65,220,110,105,120,110,100]},
      {name:"Rentabilidad",rows:recipeRows,widths:[190,65,105,105,105,110,75]},
      {name:"Inventario",rows:inventoryRows,widths:[180,75,65,85,105,110]},
    ]);
  };
  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">ANÁLISIS Y DECISIONES</p>
          <h1>Los números cuentan.</h1>
          <p className="muted">
            Resumen financiero, rentabilidad de recetas e inventario en un archivo Excel con formato.
          </p>
        </div>
        <button className="btn-primary" onClick={exportReport}>
          <Download size={17} /> Exportar Excel
        </button>
      </div>
      <div className="report-kpis">
        <div className="report-kpi">
          <span>Ingresos registrados</span>
          <b>{money(income)}</b>
          <small>Según movimientos registrados</small>
        </div>
        <div className="report-kpi">
          <span>Egresos registrados</span>
          <b>{money(expense)}</b>
          <small>Según movimientos registrados</small>
        </div>
        <div className="report-kpi">
          <span>Resultado neto estimado</span>
          <b>{money(income - expense)}</b>
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
          {chart.length ? <ResponsiveContainer width="100%" height="100%">
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
          </ResponsiveContainer> : <div className="empty-chart">El gráfico se completará cuando registres ingresos o gastos.</div>}
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
      
    </div>
  );
}
