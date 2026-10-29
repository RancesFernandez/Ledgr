import React, { useState } from "react";
import { X } from "lucide-react";
export default function RecordModal({ kind, ingredients, onClose, onSave }) {
  const isRecipe = kind === "recipe";
  const [form, setForm] = useState(
    isRecipe
      ? {
          name: "",
          yield: 8,
          price: "",
          labor: "",
          overhead: 8,
          margin: 60,
          ingredients: [],
        }
      : { name: "", unit: "g", stock: "", min: "", cost: "", expiry: "" },
  );
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleIngredient = (id, checked) =>
    update(
      "ingredients",
      checked
        ? [...form.ingredients, { id, qty: 100 }]
        : form.ingredients.filter((x) => x.id !== id),
    );
  const setQty = (id, qty) =>
    update(
      "ingredients",
      form.ingredients.map((x) =>
        x.id === id ? { ...x, qty: Number(qty) } : x,
      ),
    );
  const submit = (e) => {
    e.preventDefault();
    onSave(
      isRecipe
        ? {
            ...form,
            yield: Number(form.yield),
            price: Number(form.price),
            labor: Number(form.labor),
            overhead: Number(form.overhead),
            margin: Number(form.margin),
          }
        : {
            ...form,
            stock: Number(form.stock),
            min: Number(form.min),
            cost: Number(form.cost),
          },
    );
    onClose();
  };
  return (
    <div className="modal-scrim">
      <section className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">
              {isRecipe ? "RECETARIO" : "MATERIAS PRIMAS"}
            </p>
            <h2>{isRecipe ? "Crear receta" : "Agregar insumo"}</h2>
            <p className="muted">
              {isRecipe
                ? "Definí rendimiento, ingredientes y estructura de costos."
                : "Registrá el producto, su stock y costo de compra."}
            </p>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="span-2">
              {isRecipe ? "Nombre de la receta" : "Nombre del insumo"}
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder={
                  isRecipe ? "Ej. Torta Chajá" : "Ej. Chocolate cobertura"
                }
              />
            </label>
            {isRecipe ? (
              <>
                <label>
                  Rinde (unidades)
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.yield}
                    onChange={(e) => update("yield", e.target.value)}
                  />
                </label>
                <label>
                  Precio de venta (UYU)
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                  />
                </label>
                <label>
                  Mano de obra total (UYU)
                  <input
                    type="number"
                    min="0"
                    value={form.labor}
                    onChange={(e) => update("labor", e.target.value)}
                  />
                </label>
                <label>
                  Costos fijos (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.overhead}
                    onChange={(e) => update("overhead", e.target.value)}
                  />
                </label>
                <label>
                  Margen objetivo (%)
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={form.margin}
                    onChange={(e) => update("margin", e.target.value)}
                  />
                </label>
                <div className="span-2 ingredient-picker">
                  <b>Ingredientes de esta receta</b>
                  {ingredients.map((i) => (
                    <div className="ingredient-pick" key={i.id}>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          checked={form.ingredients.some((x) => x.id === i.id)}
                          onChange={(e) =>
                            toggleIngredient(i.id, e.target.checked)
                          }
                        />
                        {i.name} <small>({i.unit})</small>
                      </label>
                      {form.ingredients.some((x) => x.id === i.id) && (
                        <input
                          aria-label={`Cantidad de ${i.name}`}
                          type="number"
                          min=".01"
                          step=".01"
                          value={
                            form.ingredients.find((x) => x.id === i.id).qty
                          }
                          onChange={(e) => setQty(i.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label>
                  Unidad de medida
                  <select
                    value={form.unit}
                    onChange={(e) => update("unit", e.target.value)}
                  >
                    {["g", "kg", "ml", "l", "un"].map((x) => (
                      <option>{x}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Stock inicial
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                  />
                </label>
                <label>
                  Stock mínimo
                  <input
                    type="number"
                    min="0"
                    value={form.min}
                    onChange={(e) => update("min", e.target.value)}
                  />
                </label>
                <label>
                  Costo por unidad (UYU)
                  <input
                    type="number"
                    min="0"
                    step=".001"
                    required
                    value={form.cost}
                    onChange={(e) => update("cost", e.target.value)}
                  />
                </label>
                <label className="span-2">
                  Vencimiento (opcional)
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={(e) => update("expiry", e.target.value)}
                  />
                </label>
              </>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary">
              Guardar {isRecipe ? "receta" : "insumo"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
