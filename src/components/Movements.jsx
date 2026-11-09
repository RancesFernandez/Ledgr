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
  Eye,
  X,
  Star,
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
  const [selectedMovement, setSelectedMovement] = useState(null);
  const filtered = useMemo(
    () =>
      movements.filter(
        (m) =>
          (filter === "all" || m.type === filter) &&
          `${m.concept} ${m.category} ${m.invoice || ""} ${m.party?.name || ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [movements, search, filter],
  );
  const incomeTotal = filtered
    .filter((m) => m.type === "income")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const expenseTotal = filtered
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const exportCsv = () => {
    const rows = [
      [{ value: "LEDGR · MOVIMIENTOS", style: "title", mergeAcross: 7 }],
      [
        {
          value: `Exportado el ${new Date().toLocaleDateString("es-UY")} · Importes en UYU`,
          style: "subtitle",
          mergeAcross: 7,
        },
      ],
      [
        "Fecha",
        "Tipo",
        "Concepto",
        "Categoría",
        "Monto (UYU)",
        "Comprobante",
        "Método",
        "Canal",
      ].map((value) => ({ value, style: "header" })),
      ...filtered.map((m) =>
        [
          m.date || "",
          m.type === "income" ? "Ingreso" : "Egreso",
          m.concept || "",
          m.category || "",
          { value: Number(m.amount || 0), style: "money" },
          m.invoice || "",
          m.method || "",
          m.channel || "",
        ].map((v) => (typeof v === "object" ? v : { value: v, style: "text" })),
      ),
    ];
    exportStyledWorkbook("ledgr-movimientos", [
      {
        name: "Movimientos",
        rows,
        widths: [90, 65, 220, 110, 110, 120, 110, 100],
      },
    ]);
  };
  const pagination = usePagination(
    filtered,
    page,
    setPage,
    pageSize,
    setPageSize,
  );
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
      <div className="movement-totals">
        <div className="movement-total-card income">
          <span>
            Ingresos {filter !== "all" || search ? "del filtro" : "totales"}
          </span>
          <b>{money(incomeTotal)}</b>
        </div>
        <div className="movement-total-card expense">
          <span>
            Egresos {filter !== "all" || search ? "del filtro" : "totales"}
          </span>
          <b>{money(expenseTotal)}</b>
        </div>
        <div className="movement-total-card balance">
          <span>Balance del listado</span>
          <b>{money(incomeTotal - expenseTotal)}</b>
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
        <div className="table-scroll movement-table-wrap">
          <table className="data-table wide-table movement-table">
            <thead>
              <tr>
                <th>CONCEPTO</th>
                <th>CATEGORÍA</th>
                <th>FECHA</th>
                <th>COMPROBANTE</th>
                <th>MÉTODO</th>
                <th>CANAL</th>
                <th className="align-right">MONTO</th>
                <th>DETALLE</th>
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
                      <div className="movement-concept-copy">
                        <b title={m.concept || "Movimiento"}>
                          {m.concept || "Movimiento"}
                        </b>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-pill">{m.category}</span>
                  </td>
                  <td className="date-cell">{m.date}</td>
                  <td>{m.invoice || "—"}</td>
                  <td>{m.method || "—"}</td>
                  <td>{m.channel || "—"}</td>
                  <td className={`amount-cell align-right ${m.type}`}>
                    {m.type === "income" ? "+" : "−"}
                    {money(m.amount)}
                  </td>
                  <td className="movement-action-cell">
                    <button
                      type="button"
                      className="btn-small movement-detail-button"
                      onClick={() => setSelectedMovement(m)}
                      aria-label={`Ver detalles de ${m.concept || "movimiento"}`}
                    >
                      <Eye size={14} />
                      <span>Ver detalles</span>
                    </button>
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
      {selectedMovement && (
        <div
          className="modal-scrim"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setSelectedMovement(null)
          }
        >
          <section className="modal movement-detail-modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">DETALLE DEL MOVIMIENTO</p>
                <h2>{selectedMovement.concept || "Movimiento"}</h2>
                <p className="muted">
                  {selectedMovement.date || "Sin fecha"} ·{" "}
                  {selectedMovement.type === "income" ? "Ingreso" : "Egreso"}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedMovement(null)}
                aria-label="Cerrar"
              >
                <X />
              </button>
            </div>
            <div className="movement-detail-amount">
              <span>
                {selectedMovement.type === "income"
                  ? "Ingreso registrado"
                  : "Egreso registrado"}
              </span>
              <b className={selectedMovement.type}>
                {selectedMovement.type === "income" ? "+" : "−"}
                {money(selectedMovement.amount)}
              </b>
            </div>
            <div className="movement-detail-grid">
              <div>
                <span>Categoría</span>
                <b>{selectedMovement.category || "—"}</b>
              </div>
              <div>
                <span>Canal de venta</span>
                <b>
                  {selectedMovement.channel ||
                    (selectedMovement.type === "income"
                      ? "No especificado"
                      : "No aplica")}
                </b>
              </div>
              <div>
                <span>Medio de pago</span>
                <b>{selectedMovement.method || "—"}</b>
              </div>
              <div>
                <span>Comprobante</span>
                <b>{selectedMovement.invoice || "—"}</b>
              </div>
              {selectedMovement.quantity != null && (
                <div>
                  <span>Cantidad</span>
                  <b>{selectedMovement.quantity} unidad(es)</b>
                </div>
              )}
              {selectedMovement.estimatedCost != null && (
                <div>
                  <span>Costo estimado</span>
                  <b>{money(selectedMovement.estimatedCost)}</b>
                </div>
              )}
              {selectedMovement.estimatedProfit != null && (
                <div>
                  <span>Ganancia estimada</span>
                  <b
                    className={
                      Number(selectedMovement.estimatedProfit) >= 0
                        ? "income"
                        : "expense"
                    }
                  >
                    {money(selectedMovement.estimatedProfit)}
                  </b>
                </div>
              )}
              {selectedMovement.inventoryPurchase?.name && (
                <div>
                  <span>Insumo comprado</span>
                  <b>{selectedMovement.inventoryPurchase.name}</b>
                </div>
              )}
              {selectedMovement.inventoryPurchase?.quantity != null && (
                <div>
                  <span>Cantidad comprada</span>
                  <b>
                    {selectedMovement.inventoryPurchase.quantity}{" "}
                    {selectedMovement.inventoryPurchase.unit || "unidad(es)"}
                  </b>
                </div>
              )}
              {selectedMovement.inventoryPurchase?.unitCost != null && (
                <div>
                  <span>Costo por unidad</span>
                  <b>{money(selectedMovement.inventoryPurchase.unitCost)}</b>
                </div>
              )}
              {selectedMovement.inventoryPurchase?.totalCost != null && (
                <div>
                  <span>Total de compra</span>
                  <b>{money(selectedMovement.inventoryPurchase.totalCost)}</b>
                </div>
              )}
            </div>
            {selectedMovement.party?.name && (
              <section className="movement-party-detail">
                <div className="movement-party-heading">
                  <b>
                    {selectedMovement.partyRole === "supplier" ||
                    selectedMovement.party.role === "supplier"
                      ? "Proveedor asociado"
                      : "Cliente asociado"}
                  </b>
                  {selectedMovement.party.badge && (
                    <span className="party-badge">
                      <Star size={12} />
                      {selectedMovement.party.badge}
                    </span>
                  )}
                </div>
                <div className="movement-detail-grid">
                  <div>
                    <span>Nombre</span>
                    <b>{selectedMovement.party.name}</b>
                  </div>
                  <div>
                    <span>Teléfono</span>
                    <b>{selectedMovement.party.phone || "—"}</b>
                  </div>
                  <div>
                    <span>Correo</span>
                    <b>{selectedMovement.party.email || "—"}</b>
                  </div>
                  <div>
                    <span>Documento / RUT</span>
                    <b>{selectedMovement.party.taxId || "—"}</b>
                  </div>
                  <div className="span-2">
                    <span>Dirección</span>
                    <b>{selectedMovement.party.address || "—"}</b>
                  </div>
                  <div className="span-2">
                    <span>Observaciones de la persona</span>
                    <b>{selectedMovement.party.notes || "—"}</b>
                  </div>
                </div>
              </section>
            )}
            <div className="movement-detail-notes">
              <span>Descripción y observaciones</span>
              <p>
                {selectedMovement.notes || "No se agregaron observaciones."}
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => setSelectedMovement(null)}
              >
                Cerrar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
