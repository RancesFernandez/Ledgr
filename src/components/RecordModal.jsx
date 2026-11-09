import { isCountUnit } from "../utils/recipe";
import React, { useState } from "react";
import { X, ImagePlus, HelpCircle } from "lucide-react";
export default function RecordModal({ kind, ingredients, onClose, onSave, initialData = null, userId = "" }) {
  const isRecipe = kind === "recipe";
  const [form, setForm] = useState(() => initialData ? {
    ...initialData,
    overheadMode: initialData.overheadMode || "percent",
    overheadValue: initialData.overheadValue ?? initialData.overhead ?? 8,
    profitMode: initialData.profitMode || "percent",
    profitValue: initialData.profitValue ?? initialData.margin ?? 60,
    imageUrl: initialData.imageUrl || "",
    priceSource: initialData.priceSource || "manual",
  } : isRecipe ? {
    name: "", yield: 8, price: "", labor: "", overhead: 8, margin: 60,
    overheadMode: "percent", overheadValue: 8, profitMode: "percent",
    profitValue: 60, ingredients: [], imageUrl: "", priceSource: "manual",
  } : { name: "", unit: "g", stock: "", min: "", cost: "", expiry: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState("");
  const [registerInitialExpense, setRegisterInitialExpense] = useState(false);
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleIngredient = (id, checked) =>
    update(
      "ingredients",
      checked
        ? [...form.ingredients, { id, qty: isCountUnit(ingredients.find(i => i.id === id)?.unit) ? 1 : 100 }]
        : form.ingredients.filter((x) => x.id !== id),
    );
  const setQty = (id, qty) =>
    update(
      "ingredients",
      form.ingredients.map((x) =>
        x.id === id ? { ...x, qty: Number(qty) } : x,
      ),
    );
  const compressImage = (file) => new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Seleccioná una imagen válida."));
    if (file.size > 20 * 1024 * 1024) return reject(new Error("La imagen supera los 20 MB."));
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement("canvas");
        for (const side of [900, 700, 550, 420, 320]) {
          const scale = Math.min(1, side / Math.max(image.width, image.height));
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          for (const quality of [0.72, 0.55, 0.4, 0.28]) {
            const data = canvas.toDataURL("image/jpeg", quality);
            if (data.length <= 180000) return resolve(data);
          }
        }
        reject(new Error("No se pudo comprimir suficientemente la imagen."));
      } catch (error) { reject(error); }
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen.")); };
    image.src = url;
  });
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/") || file.size > 20 * 1024 * 1024) {
      setImageError("Seleccioná una imagen JPG, PNG o WebP de hasta 20 MB.");
      event.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(previous => {
      if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    event.target.value = "";
  };
  const submit = async (e) => {
    e.preventDefault();
    if (isRecipe) {
      if (!Number.isInteger(Number(form.yield)) || Number(form.yield) < 1) { alert("El rendimiento debe ser un número entero positivo."); return; }
      for (const line of form.ingredients) {
        const item = ingredients.find(i => i.id === line.id);
        if (!item || !(Number(line.qty) > 0) || (isCountUnit(item.unit) && !Number.isInteger(Number(line.qty)))) {
          alert(`Cantidad inválida para ${item?.name || "un ingrediente"}. Las unidades deben ser enteras.`); return;
        }
      }
    } else if (isCountUnit(form.unit) && (![form.stock, form.min].every(v => Number.isInteger(Number(v))))) {
      alert("El stock y el mínimo en unidades deben ser números enteros."); return;
    }
    if (saving) return;
    setSaving(true);
    let imageUrl = form.imageUrl || "";
    if (imageFile) {
      try {
        setUploading(true);
        imageUrl = await compressImage(imageFile);
      } catch (err) {
        alert("No se pudo procesar la imagen: " + err.message);
        setUploading(false);
        setSaving(false);
        return;
      }
      setUploading(false);
    }
    const { id, createdAt, updatedAt, nameKey, ...formData } = form;
    try { const result = await onSave(
      isRecipe
        ? {
            ...formData, imageUrl,
            yield: Number(form.yield),
            price: Number(form.price),
            labor: Number(form.labor),
            overhead: Number(form.overheadValue ?? form.overhead),
            overheadMode: form.overheadMode || "percent",
            overheadValue: Number(form.overheadValue ?? form.overhead),
            margin: Number(form.profitValue ?? form.margin),
            profitMode: form.profitMode || "percent",
            profitValue: Number(form.profitValue ?? form.margin),
          }
        : {
            ...formData,
            stock: Number(form.stock),
            min: Number(form.min),
            cost: Number(form.cost),
            registerInitialExpense,
          },
    );
    if (result) onClose();
    } catch (err) { alert("No se pudo guardar: " + err.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-scrim">
      <section className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">
              {isRecipe ? "RECETARIO" : "MATERIAS PRIMAS"}
            </p>
            <h2>{isRecipe ? (initialData ? "Editar receta" : "Crear receta") : (initialData ? "Editar insumo" : "Agregar insumo")}</h2>
            <p className="muted">
              {isRecipe
                ? "Definí rendimiento, ingredientes y estructura de costos."
                : "Registrá el producto, su stock y costo de compra."}
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="span-2" data-tooltip="Nombre claro para identificar este registro en el recetario o inventario.">
              {isRecipe ? "Nombre de la receta" : "Nombre del insumo"} <HelpCircle size={13} />

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
                <label data-tooltip="Rendimiento orientativo en porciones. No divide el costo ni el consumo: cada venta representa la preparación completa.">
                  Rinde (porciones de referencia)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.yield}
                    onChange={(e) => update("yield", e.target.value)}
                  />
                </label>
                <label data-tooltip="Costo total del tiempo de trabajo para preparar toda la receta. Si no querés incluirlo, dejalo en cero.">
                  Mano de obra total (UYU)
                  <input
                    type="number"
                    min="0"
                    value={form.labor}
                    onChange={(e) => update("labor", e.target.value)}
                  />
                </label>
                <label data-tooltip="Costo adicional de la receta, por ejemplo energía o empaque. Podés calcularlo como porcentaje o como importe fijo.">
                  Tipo de costo adicional
                  <select value={form.overheadMode || "percent"} onChange={(e) => update("overheadMode", e.target.value)}>
                    <option value="percent">Porcentaje del costo (%)</option>
                    <option value="fixed">Importe fijo (UYU)</option>
                  </select>
                </label>
                <label data-tooltip="Valor que se suma al costo de ingredientes y mano de obra.">
                  {form.overheadMode === "fixed" ? "Costo adicional fijo (UYU)" : "Costo adicional (%)"}
                  <input type="number" min="0" step="0.01" value={form.overheadValue ?? form.overhead ?? 8} onChange={(e) => { update("overheadValue", e.target.value); update("overhead", e.target.value); }} />
                </label>
                <label data-tooltip="Elegí si querés definir la ganancia como porcentaje del costo o como una cantidad de dinero por unidad.">
                  Tipo de ganancia objetivo
                  <select value={form.profitMode || "percent"} onChange={(e) => update("profitMode", e.target.value)}>
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Importe fijo por unidad (UYU)</option>
                  </select>
                </label>
                <label data-tooltip="Ganancia que querés obtener por unidad, expresada como porcentaje o como importe fijo según la opción anterior.">
                  {form.profitMode === "fixed" ? "Ganancia fija por unidad (UYU)" : "Ganancia objetivo (%)"}
                  <input type="number" min="0" step="0.01" value={form.profitValue ?? form.margin ?? 60} onChange={(e) => { update("profitValue", e.target.value); update("margin", e.target.value); }} />
                </label>
                <label className="span-2 check-label"><input type="checkbox" checked={form.priceSource === "margin"} onChange={(e) => update("priceSource", e.target.checked ? "margin" : "manual")} /> Usar precio calculado con el margen de ganancia (desmarcado: usar precio escrito manualmente)</label>
                <label className="span-2" data-tooltip="Precio exacto al que querés vender cada unidad. Este importe prevalece sobre el precio sugerido calculado.">
                  Precio de venta definido (UYU)
                  <input type="number" min="0" step="0.01" required={form.priceSource !== "margin"} disabled={form.priceSource === "margin"} value={form.price} onChange={(e) => update("price", e.target.value)} />
                </label>
                <div className="span-2 recipe-image-field">
                  <div className="recipe-image-heading"><strong>Foto de la receta</strong><span>Opcional · JPG, PNG o WebP</span></div>
                  <div className="recipe-image-uploader">
                    {imagePreview ? <img className="recipe-image-thumbnail" src={imagePreview} alt="Vista previa" /> : <div className="recipe-image-placeholder"><ImagePlus size={30}/></div>}
                    <div className="recipe-image-details">
                      <strong>{imagePreview ? "Imagen seleccionada" : "Agregá una foto de tu preparación"}</strong>
                      <small>La foto se optimiza automáticamente antes de guardarse.</small>
                      <div className="recipe-image-controls">
                        <label className="recipe-upload-button"><ImagePlus size={17}/>{imagePreview ? "Cambiar foto" : "Elegir imagen"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage}/></label>
                        {imagePreview && <button type="button" className="recipe-remove-button" onClick={() => { setImageFile(null); setImagePreview(""); update("imageUrl", ""); }}>Quitar foto</button>}
                      </div>
                    </div>
                  </div>
                  {imageError && <p className="recipe-image-error" role="alert">{imageError}</p>}
                </div>
                <div className="span-2 ingredient-picker" title="Elegí los insumos y la cantidad que consume la receta completa.">
                  <b>Ingredientes de esta receta</b><p className="muted form-help">La cantidad corresponde a la receta completa, no a una porción. Los costos se calculan usando los costos unitarios del inventario.</p>
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
                          title={`Cantidad de ${i.unit} de ${i.name} que usa la receta completa.`}
                          type="number"
                          min={isCountUnit(i.unit) ? "1" : "0.01"}
                          step={isCountUnit(i.unit) ? "1" : "0.01"}
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
                <label data-tooltip="Unidad en la que vas a controlar y descontar este insumo: gramos, kilos, mililitros, litros o unidades.">
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
                <label data-tooltip="Cantidad que tenés disponible al momento de crear el insumo. Usá la unidad de medida elegida.">
                  Stock inicial
                  <input
                    type="number"
                    min="0"
                    step={isCountUnit(form.unit) ? "1" : "any"}
                    required
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                  />
                </label>
                <label data-tooltip="Nivel de stock a partir del cual querés recibir una alerta para reponer este insumo.">
                  Stock mínimo
                  <input
                    type="number"
                    min="0"
                    step={isCountUnit(form.unit) ? "1" : "any"}
                    value={form.min}
                    onChange={(e) => update("min", e.target.value)}
                  />
                </label>
                <label data-tooltip="Cuánto te cuesta una unidad de medida del insumo. Por ejemplo, si elegiste gramos, ingresá el costo por gramo.">
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
                <label className="span-2" data-tooltip="Fecha de vencimiento del lote que tenés. Es opcional y ayuda a controlar productos próximos a vencer.">
                  Vencimiento (opcional)
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={(e) => update("expiry", e.target.value)}
                  />
                </label>
                {!initialData && <label className="span-2 inventory-expense-question">
                  <input type="checkbox" checked={registerInitialExpense} onChange={(e) => setRegisterInitialExpense(e.target.checked)} />
                  <span><b>¿Registrar el stock inicial como gasto del período?</b><small>Se registrará el valor del stock inicial (cantidad × costo unitario) en los gastos.</small></span>
                </label>}
              </>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" disabled={uploading || saving}>
              {uploading ? "Optimizando imagen…" : saving ? "Guardando…" : `${initialData ? "Guardar cambios" : "Guardar"} ${isRecipe ? "receta" : "insumo"}`}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
