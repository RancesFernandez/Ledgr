import React, { useMemo, useState } from "react";
import { X, PackagePlus } from "lucide-react";
import { incomeCategories, expenseCategories } from "../data/categories";

export default function MovementModal({ onClose, onSave, ingredients = [] }) {
  const [type, setType] = useState("income");
  const [buyInventory, setBuyInventory] = useState(false);
  const [itemMode, setItemMode] = useState("existing");
  const [selectedId, setSelectedId] = useState("");
  const [newItem, setNewItem] = useState({ name: "", unit: "un", min: "0" });
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    concept: "", category: "Ventas", amount: "",
    date: new Date().toISOString().slice(0, 10), invoice: "",
    method: "Transferencia", notes: "",
  });
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const selected = ingredients.find((i) => i.id === selectedId);
  const total = Number(quantity || 0) * Number(unitCost || 0);
  const categoryList = type === "income" ? incomeCategories : expenseCategories;
  const changeType = (next) => {
    setType(next);
    setBuyInventory(false);
    update("category", next === "income" ? "Ventas" : "Materia prima");
  };
  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (buyInventory) {
      if (!(Number(quantity) > 0) || !(Number(unitCost) > 0)) return;
      if (itemMode === "existing" && !selected) return;
      if (itemMode === "new" && !newItem.name.trim()) return;
    } else if (!form.concept.trim() || Number(form.amount) <= 0) return;
    setSaving(true);
    try {
      const data = buyInventory ? {
        ...form, type: "expense", category: "Materia prima",
        concept: `Compra de inventario: ${itemMode === "existing" ? selected.name : newItem.name.trim()}`,
        amount: Number(total.toFixed(2)),
        notes: [form.notes, `Compra de ${quantity} ${itemMode === "existing" ? selected.unit : newItem.unit}; costo unitario ${unitCost} UYU.`].filter(Boolean).join(" "),
        inventoryPurchase: {
          mode: itemMode, ingredientId: itemMode === "existing" ? selected.id : null,
          name: itemMode === "existing" ? selected.name : newItem.name.trim(),
          unit: itemMode === "existing" ? selected.unit : newItem.unit,
          min: itemMode === "existing" ? Number(selected.min || 0) : Number(newItem.min || 0),
          quantity: Number(quantity), unitCost: Number(unitCost), totalCost: Number(total.toFixed(2)),
        },
      } : { ...form, type, amount: Number(form.amount) };
      const result = await onSave(data);
      if (result !== null) onClose();
    } finally { setSaving(false); }
  };
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section className="modal">
        <div className="modal-head">
          <div><p className="eyebrow">REGISTRO CONTABLE</p><h2>Nuevo movimiento</h2><p className="muted">Ingresos, gastos y compras de inventario en un mismo lugar.</p></div>
          <button className="icon-button" onClick={onClose} type="button"><X /></button>
        </div>
        <div className="type-switch">
          <button type="button" className={type === "income" ? "selected income" : ""} onClick={() => changeType("income")}>＋ Registrar ingreso</button>
          <button type="button" className={type === "expense" ? "selected expense" : ""} onClick={() => changeType("expense")}>− Registrar gasto</button>
        </div>
        {type === "expense" && <label className="inventory-purchase-toggle"><input type="checkbox" checked={buyInventory} onChange={(e) => { setBuyInventory(e.target.checked); if (e.target.checked) update("category", "Materia prima"); }} /><PackagePlus size={17}/><span><b>Es una compra de inventario</b><small>Actualiza el stock y registra el gasto del período automáticamente.</small></span></label>}
        <form onSubmit={submit}>
          {buyInventory ? <div className="form-grid">
            <label className="span-2">¿Qué vas a comprar?
              <div className="filter-tabs inventory-mode-tabs"><button type="button" className={itemMode === "existing" ? "on" : ""} onClick={() => setItemMode("existing")}>Insumo existente</button><button type="button" className={itemMode === "new" ? "on" : ""} onClick={() => setItemMode("new")}>Crear insumo</button></div>
            </label>
            {itemMode === "existing" ? <label className="span-2">Artículo del inventario
              <select required value={selectedId} onChange={(e) => { setSelectedId(e.target.value); const i = ingredients.find((x) => x.id === e.target.value); if (i) update("concept", `Compra de inventario: ${i.name}`); }}>
                <option value="">Seleccioná un insumo existente…</option>{ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} · stock: {Number(i.stock || 0)} {i.unit}</option>)}
              </select>{ingredients.length === 0 && <small className="muted">Todavía no hay insumos. Elegí “Crear insumo”.</small>}
            </label> : <>
              <label className="span-2">Nombre del nuevo insumo<input required value={newItem.name} onChange={(e) => setNewItem((p) => ({...p,name:e.target.value}))} placeholder="Ej. Harina 0000"/></label>
              <label>Unidad<select value={newItem.unit} onChange={(e) => setNewItem((p) => ({...p,unit:e.target.value}))}>{["g","kg","ml","l","un"].map((u)=><option key={u}>{u}</option>)}</select></label>
              <label>Stock mínimo<input type="number" min="0" value={newItem.min} onChange={(e)=>setNewItem((p)=>({...p,min:e.target.value}))}/></label>
            </>}
            <label>Cantidad comprada<input type="number" required min="0.01" step="0.01" value={quantity} onChange={(e)=>setQuantity(e.target.value)}/></label>
            <label>Costo por unidad (UYU)<input type="number" required min="0.01" step="0.01" value={unitCost} onChange={(e)=>setUnitCost(e.target.value)} placeholder="0,00"/></label>
            <label>Fecha<input type="date" required value={form.date} onChange={(e)=>update("date",e.target.value)}/></label>
            <label>Forma de pago<select value={form.method} onChange={(e)=>update("method",e.target.value)}>{["Transferencia","Efectivo","Débito","Crédito","Mercado Pago","Otro"].map((x)=><option key={x}>{x}</option>)}</select></label>
            <label className="span-2">N.º de factura / comprobante<input value={form.invoice} onChange={(e)=>update("invoice",e.target.value)} placeholder="Opcional"/></label>
            <label className="span-2">Notas<textarea rows="2" value={form.notes} onChange={(e)=>update("notes",e.target.value)} placeholder="Proveedor u observaciones…"/></label>
            <div className="span-2 inventory-purchase-total"><span>Total de la compra · se registrará como gasto</span><b>{new Intl.NumberFormat("es-UY",{style:"currency",currency:"UYU"}).format(total || 0)}</b></div>
          </div> : <div className="form-grid">
            <label className="span-2">Concepto<input autoFocus required value={form.concept} onChange={(e)=>update("concept",e.target.value)} placeholder={type === "income" ? "Ej. Venta torta de cumpleaños" : "Ej. Pago de servicios"}/></label>
            <label>Monto (UYU)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e)=>update("amount",e.target.value)} placeholder="0,00"/></label>
            <label>Fecha<input required type="date" value={form.date} onChange={(e)=>update("date",e.target.value)}/></label>
            <label>Categoría<select value={form.category} onChange={(e)=>update("category",e.target.value)}>{categoryList.map((x)=><option key={x}>{x}</option>)}</select></label>
            <label>Forma de pago<select value={form.method} onChange={(e)=>update("method",e.target.value)}>{["Transferencia","Efectivo","Débito","Crédito","Mercado Pago","Otro"].map((x)=><option key={x}>{x}</option>)}</select></label>
            <label className="span-2">N.º de factura / comprobante<input value={form.invoice} onChange={(e)=>update("invoice",e.target.value)} placeholder="Ej. e-Factura A 000123"/></label>
            <label className="span-2">Notas (opcional)<textarea rows="2" value={form.notes} onChange={(e)=>update("notes",e.target.value)} placeholder="Cliente, proveedor u observaciones…"/></label>
          </div>}
          <div className="modal-actions"><button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button><button className="btn-primary" type="submit" disabled={saving}>{saving ? "Guardando…" : buyInventory ? "Registrar compra y actualizar stock" : "Guardar movimiento"}</button></div>
        </form>
      </section>
    </div>
  );
}
