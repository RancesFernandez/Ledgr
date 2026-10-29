import React, { useState } from "react";
import { ChefHat, Clock3, Plus, Search, SlidersHorizontal } from "lucide-react";
const money = (n) =>
  new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU",
    maximumFractionDigits: 0,
  }).format(n || 0);
export function recipeCost(r, ingredients) {
  const ingredientCost = (r.ingredients || []).reduce(
    (s, x) => s + (ingredients.find((i) => i.id === x.id)?.cost || 0) * x.qty,
    0,
  );
  const labor = Number(r.labor || 0);
  const overhead = ((ingredientCost + labor) * Number(r.overhead || 0)) / 100;
  return ingredientCost + labor + overhead;
}
export default function Recipes({ recipes, ingredients, onAdd, onSell }) {
  const [search, setSearch] = useState("");
  const rows = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );
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
        {rows.map((r, idx) => {
          const ing = (r.ingredients || []).reduce(
            (s, x) =>
              s + (ingredients.find((i) => i.id === x.id)?.cost || 0) * x.qty,
            0,
          );
          const cost = recipeCost(r, ingredients);
          const overhead = ((ing + (r.labor || 0)) * (r.overhead || 0)) / 100;
          const unit = cost / Math.max(1, r.yield || 1);
          const profit = (r.price || 0) - unit;
          const margin = r.price ? (profit / r.price) * 100 : 0;
          return (
            <article className="recipe-card" key={r.id}>
              <div className={`recipe-art art-${idx % 3}`}>
                <div className="recipe-art-label">
                  RECETA {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="recipe-illustration">
                  {["◒", "✳", "◉"][idx % 3]}
                </div>
                <div className="recipe-yield">
                  <span>Rinde</span>
                  <b>{r.yield} porciones</b>
                </div>
              </div>
              <div className="recipe-card-body">
                <div className="recipe-title-row">
                  <h2>{r.name}</h2>
                  <span className="margin-badge">
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
                    <b className="price-highlight">
                      {money(r.price || unit * 3)}
                    </b>
                  </div>
                </div>
                <div className="recipe-cost-bar">
                  <i
                    style={{
                      width: `${Math.max(4, Math.min(100, 100 - margin))}%`,
                    }}
                  />
                </div>
                <div className="recipe-card-footer">
                  <span>
                    <Clock3 size={14} /> Mano de obra {money(r.labor)}
                  </span>
                  <button className="btn-small" onClick={() => onSell(r)}>
                    Registrar venta
                  </button>
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
    </div>
  );
}
