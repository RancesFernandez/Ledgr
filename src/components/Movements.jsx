import { usePagination } from "./Pagination";
import { exportStyledWorkbook } from "../utils/exportExcel";
import React, { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
const money = (n) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
  }).format(n || 0);
export default function Movements({ movements, onAdd }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(
    () =>
      movements.filter(
        (m) =>
          (filter === "all" || m.type === filter) &&
          `${m.concept} ${m.category} ${m.invoice || ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [movements, search, filter],
  );
  const exportCsv = () => {
    const rows = [
      [{value:"LEDGR · MOVIMIENTOS",style:"title",mergeAcross:6}],
      [{value:`Exportado el ${new Date().toLocaleDateString("es-UY")} · Importes en UYU`,style:"subtitle",mergeAcross:6}],
      ["Fecha", "Tipo", "Concepto", "Categoría", "Monto (UYU)", "Comprobante", "Método"].map(value=>({value,style:"header"})),
      ...filtered.map(m=>[m.date||"",m.type==="income"?"Ingreso":"Egreso",m.concept||"",m.category||"",{value:Number(m.amount||0),style:"money"},m.invoice||"",m.method||""].map(v=>typeof v==="object"?v:{value:v,style:"text"}))
    ];
    exportStyledWorkbook("ledgr-movimientos", [{name:"Movimientos",rows,widths:[90,65,220,110,110,120,110]}]);
  };
  const pagination = usePagination(filtered, page, setPage, pageSize, setPageSize);
  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">CONTROL FINANCIERO</p>
          <h1>Movimientos</h1>
          <p className="muted">Cada entrada y salida, en su lugar.</p>
        </div>
        <div className="welcome-actions">
          <button className="btn-secondary" onClick={exportCsv}>
            <Download size={16} /> Exportar Excel
          </button>
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={17} /> Nuevo movimiento
          </button>
        </div>
      </div>
      <div className="panel movement-panel">
        <div className="movement-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar concepto, categoría o factura…"
            />
          </div>
          <div className="filter-tabs">
            <button
              className={filter === "all" ? "on" : ""}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button
              className={filter === "income" ? "on" : ""}
              onClick={() => setFilter("income")}
            >
              Ingresos
            </button>
            <button
              className={filter === "expense" ? "on" : ""}
              onClick={() => setFilter("expense")}
            >
              Gastos
            </button>
          </div>
          <button
            className="btn-secondary filter-button"
            onClick={() => setSearch("")}
          >
            <SlidersHorizontal size={16} /> Limpiar
          </button>
        </div>
        <div className="table-scroll">
          <table className="data-table wide-table">
            <thead>
              <tr>
                <th>CONCEPTO</th>
                <th>CATEGORÍA</th>
                <th>FECHA</th>
                <th>COMPROBANTE</th>
                <th>MÉTODO</th>
                <th className="align-right">MONTO</th>
              </tr>
            </thead>
            <tbody>
              {pagination.items.map((m) => (
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
                        <small>{m.notes || "—"}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-pill">{m.category}</span>
                  </td>
                  <td className="date-cell">{m.date}</td>
                  <td>{m.invoice || "—"}</td>
                  <td>{m.method || "—"}</td>
                  <td className={`amount-cell align-right ${m.type}`}>
                    {m.type === "income" ? "+" : "−"}
                    {money(m.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="empty-state">
            <Search size={24} />
            <b>No encontramos movimientos</b>
            <span>Probá con otro término o cambiá el filtro.</span>
          </div>
        )}
        <div className="table-bottom">
          <span>{filtered.length} movimientos</span>
          <span>Importes en pesos uruguayos (UYU)</span>
        </div>
      </div>
      {pagination.controls}
    </div>
  );
}
