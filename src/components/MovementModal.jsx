import React, { useState } from "react";
import { X } from "lucide-react";
import { incomeCategories, expenseCategories } from "../data/demo";
export default function MovementModal({ onClose, onSave }) {
  const [type, setType] = useState("income");
  const [form, setForm] = useState({
    concept: "",
    category: "Ventas",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    invoice: "",
    method: "Transferencia",
    notes: "",
  });
  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.concept.trim() || Number(form.amount) <= 0) return;
    onSave({ ...form, type, amount: Number(form.amount) });
    onClose();
  };
  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">REGISTRO CONTABLE</p>
            <h2>Nuevo movimiento</h2>
            <p className="muted">Anotá una operación en pocos segundos.</p>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="type-switch">
          <button
            className={type === "income" ? "selected income" : ""}
            onClick={() => {
              setType("income");
              update("category", "Ventas");
            }}
          >
            ＋ Registrar ingreso
          </button>
          <button
            className={type === "expense" ? "selected expense" : ""}
            onClick={() => {
              setType("expense");
              update("category", "Materia prima");
            }}
          >
            − Registrar gasto
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="span-2">
              Concepto
              <input
                autoFocus
                required
                value={form.concept}
                onChange={(e) => update("concept", e.target.value)}
                placeholder="Ej. Venta torta de cumpleaños"
              />
            </label>
            <label>
              Monto (UYU)
              <input
                required
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="0,00"
              />
            </label>
            <label>
              Fecha
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </label>
            <label>
              Categoría
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {(type === "income" ? incomeCategories : expenseCategories).map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              Forma de pago
              <select
                value={form.method}
                onChange={(e) => update("method", e.target.value)}
              >
                {[
                  "Transferencia",
                  "Efectivo",
                  "Débito",
                  "Crédito",
                  "Mercado Pago",
                  "Otro",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="span-2">
              N.º de factura / comprobante
              <input
                value={form.invoice}
                onChange={(e) => update("invoice", e.target.value)}
                placeholder="Ej. e-Factura A 000123"
              />
            </label>
            <label className="span-2">
              Notas (opcional)
              <textarea
                rows="2"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Cliente, proveedor u observaciones…"
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" type="submit">
              Guardar movimiento
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
