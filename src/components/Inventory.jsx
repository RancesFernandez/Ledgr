import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarClock,
  Plus,
  Search,
  Warehouse,
} from "lucide-react";
const money = (n) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 2,
  }).format(n || 0);
export default function Inventory({ ingredients, onAdjust, onAdd }) {
  const [search, setSearch] = useState("");
  const [adjust, setAdjust] = useState(null);
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [reason, setReason] = useState("Compra");
  const visible = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );
  const submit = (e) => {
    e.preventDefault();
    if (Number(qty) > 0) {
      onAdjust(
        adjust.id,
        Number(qty),
        ["Compra", "Ajuste positivo"].includes(reason) ? "in" : "out",
        Number(cost) || 0,
        reason,
      );
      setAdjust(null);
      setQty("");
      setCost("");
    }
  };
  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">STOCK Y MATERIAS PRIMAS</p>
          <h1>Inventario inteligente</h1>
          <p className="muted">
            De la materia prima al producto listo para vender.
          </p>
        </div>
        <div className="welcome-actions">
          <button
            className="btn-secondary"
            onClick={() =>
              setAdjust({ id: ingredients[0]?.id, name: ingredients[0]?.name })
            }
          >
            <ArrowUpFromLine size={16} /> Registrar movimiento
          </button>
          <button className="btn-primary" onClick={onAdd}>
            <Plus size={17} /> Nuevo insumo
          </button>
        </div>
      </div>
      <div className="inventory-summary">
        <div>
          <span>Insumos registrados</span>
          <b>{ingredients.length}</b>
        </div>
        <div>
          <span>Alertas de stock</span>
          <b className="warn-number">
            {ingredients.filter((i) => i.stock < i.min).length}
          </b>
        </div>
        <div>
          <span>Valor estimado de stock</span>
          <b>{money(ingredients.reduce((s, i) => s + i.stock * i.cost, 0))}</b>
        </div>
      </div>
      <section className="panel inventory-panel">
        <div className="panel-heading">
          <div>
            <h2>Materias primas</h2>
            <p className="muted">
              Costos unitarios, cantidades y vencimientos.
            </p>
          </div>
          <div className="search-box compact">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar insumo…"
            />
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table wide-table">
            <thead>
              <tr>
                <th>INSUMO</th>
                <th>STOCK ACTUAL</th>
                <th>STOCK MÍNIMO</th>
                <th>COSTO / UNIDAD</th>
                <th>VENCIMIENTO</th>
                <th>ESTADO</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="ingredient-name">
                      <div className="ingredient-symbol">
                        {i.name.slice(0, 1)}
                      </div>
                      <b>{i.name}</b>
                    </div>
                  </td>
                  <td>
                    <b>
                      {i.stock.toLocaleString("es-UY")} {i.unit}
                    </b>
                    <div className="stock-meter">
                      <i
                        style={{
                          width: `${Math.min(100, (i.stock / Math.max(i.min * 2, 1)) * 100)}%`,
                          background: i.stock < i.min ? "#c98078" : "#57977b",
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    {i.min} {i.unit}
                  </td>
                  <td>
                    {money(i.cost)} / {i.unit}
                  </td>
                  <td>
                    <span className="date-cell">{i.expiry || "Sin fecha"}</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${i.stock < i.min ? "low" : "good"}`}
                    >
                      {i.stock < i.min ? (
                        <>
                          <AlertTriangle size={12} /> Stock bajo
                        </>
                      ) : (
                        "En orden"
                      )}
                    </span>
                  </td>
                  <td>
                    <button className="btn-small" onClick={() => setAdjust(i)}>
                      Ajustar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && (
          <div className="empty-state">
            <Warehouse />
            <b>No hay insumos con ese nombre</b>
          </div>
        )}
      </section>
      <section className="panel inventory-note">
        <CalendarClock size={19} />
        <div>
          <b>Controlá los vencimientos con anticipación</b>
          <p>
            Registrá la fecha de vencimiento al ingresar una compra. Los avisos
            automáticos se activan al conectar los datos reales y las reglas de
            notificación.
          </p>
        </div>
      </section>
      {adjust && (
        <div className="modal-scrim">
          <section className="modal small-modal">
            <div className="modal-head">
              <div>
                <p className="eyebrow">MOVIMIENTO DE STOCK</p>
                <h2>Ajustar inventario</h2>
                <p className="muted">{adjust.name || "Seleccioná un insumo"}</p>
              </div>
              <button className="icon-button" onClick={() => setAdjust(null)}>
                ×
              </button>
            </div>
            <form onSubmit={submit}>
              <label>
                Insumo
                <select
                  value={adjust.id || ""}
                  onChange={(e) =>
                    setAdjust(ingredients.find((i) => i.id === e.target.value))
                  }
                >
                  {ingredients.map((i) => (
                    <option value={i.id} key={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tipo de movimiento
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {[
                    "Compra",
                    "Consumo / producción",
                    "Merma",
                    "Ajuste positivo",
                    "Ajuste negativo",
                  ].map((x) => (
                    <option>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Cantidad (
                {ingredients.find((i) => i.id === adjust.id)?.unit || "un"})
                <input
                  type="number"
                  min=".01"
                  step=".01"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0"
                />
              </label>
              <label>
                Costo total del movimiento (UYU)
                <input
                  type="number"
                  min="0"
                  step=".01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Opcional"
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setAdjust(null)}
                >
                  Cancelar
                </button>
                <button className="btn-primary">Guardar ajuste</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
