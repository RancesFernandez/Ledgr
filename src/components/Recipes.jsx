import { usePagination } from "./Pagination";
import {
  recipeCost as calculateRecipeCost,
  sellingPrice,
} from "../utils/recipe";
import React, { useState } from "react";
import {
  ChefHat,
  Clock3,
  Plus,
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
const money = (n) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(n || 0);
export const recipeCost = calculateRecipeCost;
export default function Recipes({
  recipes,
  ingredients,
  onAdd,
  onSell,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sale, setSale] = useState(null);
  const [saleQty, setSaleQty] = useState(1);
  const rows = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );
  const pagination = usePagination(rows, page, setPage, pageSize, setPageSize);
  return (
    <div className="page-content">
      <div className="welcome-row">
        <div>
          <p className="eyebrow">RECETARIO Y COSTEO DINÁMICO</p>
          <h1>Recetas que cierran.</h1>
          <p className="muted">
            Costeá cada preparación con sus ingredientes y mano de obra.
          </p>
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={17} /> Crear receta
        </button>
      </div>
      <div className="recipe-intro">
        <div className="recipe-intro-icon">
          <ChefHat size={25} />
        </div>
        <div>
          <b>Costos conectados al inventario</b>
          <p>
            Cuando actualices el costo de un insumo, el costo estimado de las
            recetas que lo usan se recalcula.
          </p>
        </div>
        <span className="live-tag">
          <i /> Cálculo dinámico
        </span>
      </div>
      <div className="recipe-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en tu recetario…"
          />
        </div>
        <button className="btn-secondary" onClick={() => setSearch("")}>
          <SlidersHorizontal size={16} /> Ver todas
        </button>
      </div>
      <div className="recipe-grid">
        {pagination.items.map((r, idx) => {
          const ing = (r.ingredients || []).reduce(
            (s, x) =>
              s + (ingredients.find((i) => i.id === x.id)?.cost || 0) * x.qty,
            0,
          );
          const cost = recipeCost(r, ingredients);
          const overhead = ((ing + (r.labor || 0)) * (r.overhead || 0)) / 100;
          const unit = cost / Math.max(1, r.yield || 1);
          const price = sellingPrice(r, ingredients);
          const profit = price - unit;
          const margin = price ? (profit / price) * 100 : 0;
          return (
            <article className="recipe-card" key={r.id}>
              <div className={`recipe-art art-${idx % 3}`}>
                {r.imageUrl ? (
                  <img
                    className="recipe-card-image"
                    src={r.imageUrl}
                    alt={`Imagen de ${r.name}`}
                  />
                ) : null}

                {!r.imageUrl && (
                  <div className="recipe-illustration">
                    {["◒", "✳", "◉"][idx % 3]}
                  </div>
                )}
              </div>
              <div className="recipe-card-body">
                <div className="recipe-title-row">
                  <h2 title={r.name}>{r.name}</h2>
                  <span
                    className="margin-badge"
                    title="Porcentaje de ganancia sobre el precio de venta."
                  >
                    {margin.toFixed(0)}% margen
                  </span>
                </div>
                <div className="recipe-metrics">
                  <div>
                    <span>Costo total</span>
                    <b>{money(cost)}</b>
                  </div>
                  <div>
                    <span>Costo por unidad</span>
                    <b>{money(unit)}</b>
                  </div>
                  <div>
                    <span>Precio sugerido</span>
                    <b
                      className="price-highlight"
                      title="Precio exacto que definiste para vender cada unidad."
                    >
                      {money(price)}
                    </b>
                  </div>
                </div>
                <div className="recipe-cost-bar" role="img" aria-label={`Margen estimado ${margin.toFixed(0)} por ciento`}>
                  <i style={{ width: `${Math.max(4, Math.min(100, margin))}%` }} />
                </div>
                <div className="recipe-extra-metrics">
                  <div><span><ChefHat size={13}/> Rendimiento</span><b>{Number(r.yield || 1)} porciones/un.</b></div>
                  <div><span><Plus size={13}/> Ingredientes</span><b>{(r.ingredients || []).length} insumos</b></div>
                  <div><span>Ganancia por unidad</span><b className={profit >= 0 ? "positive" : "negative"}>{money(profit)}</b></div>
                </div>
                {(r.ingredients || []).length > 0 && <p className="recipe-ingredient-summary">Incluye: {(r.ingredients || []).slice(0, 3).map((line) => ingredients.find((i) => i.id === line.id)?.name || "Insumo").join(" · ")}{r.ingredients.length > 3 ? ` + ${r.ingredients.length - 3} más` : ""}</p>}
                <div className="recipe-card-footer">
                  <span>
                    <Clock3 size={14} /> Mano de obra {money(r.labor)}
                  </span>
                  <div className="recipe-actions">
                    <button
                      className="btn-small"
                      title="Editar nombre, costos, ingredientes, precio o imagen"
                      onClick={() => onEdit(r)}
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    <button
                      className="btn-small recipe-delete"
                      title="Eliminar esta receta. Las ventas ya registradas no se borran."
                      onClick={() => onDelete(r)}
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                    <button
                      className="btn-small"
                      title="Registrar una venta y calcular su ingreso y ganancia"
                      onClick={() => {
                        setSale(r);
                        setSaleQty(1);
                      }}
                    >
                      Registrar venta
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!rows.length && (
        <div className="empty-state">
          <ChefHat size={26} />
          <b>Tu recetario empieza acá</b>
          <span>Creá una receta para calcular costos y márgenes.</span>
        </div>
      )}
      {sale &&
        (() => {
          const batchCost = recipeCost(sale, ingredients);
          const unitCost = batchCost / Math.max(1, Number(sale.yield) || 1);
          const unitPrice = sellingPrice(sale, ingredients);
          const total = unitPrice * saleQty;
          const totalCost = unitCost * saleQty;
          const profit = total - totalCost;
          return (
            <div
              className="modal-scrim"
              onMouseDown={(e) => e.target === e.currentTarget && setSale(null)}
            >
              <section className="modal sale-summary-modal">
                <div className="modal-head">
                  <div>
                    <p className="eyebrow">RESUMEN DE VENTA</p>
                    <h2>{sale.name}</h2>
                    <p className="muted">
                      Estimación según los costos registrados en la receta.
                    </p>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => setSale(null)}
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>
                <label data-tooltip="Cantidad de unidades vendidas.">
                  Cantidad de unidades
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={saleQty}
                    onChange={(e) =>
                      setSaleQty(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </label>
                <div className="sale-summary-grid">
                  <div>
                    <span>Ingreso total</span>
                    <b>{money(total)}</b>
                  </div>
                  <div>
                    <span>Costo estimado total</span>
                    <b>{money(totalCost)}</b>
                  </div>
                  <div>
                    <span>Ganancia estimada</span>
                    <b className={profit >= 0 ? "positive" : "negative"}>
                      {money(profit)}
                    </b>
                  </div>
                  <div>
                    <span>Margen estimado</span>
                    <b>
                      {total > 0
                        ? ((profit / total) * 100).toLocaleString("es-UY", {
                            maximumFractionDigits: 1,
                          })
                        : "0"}
                      %
                    </b>
                  </div>
                </div>
                <p className="muted sale-cost-detail">
                  Costo unitario: {money(unitCost)} · Precio unitario:{" "}
                  {money(unitPrice)}. El costo incluye ingredientes, mano de
                  obra y costos fijos configurados.
                </p>
                <div className="modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setSale(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      onSell(sale, saleQty);
                      setSale(null);
                    }}
                  >
                    Confirmar venta
                  </button>
                </div>
              </section>
            </div>
          );
        })()}
      {pagination.controls}
    </div>
  );
}
