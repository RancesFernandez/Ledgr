import React, { useMemo, useState } from "react";
import { UserRound, Building2, Star } from "lucide-react";

export default function PartyFields({
  role = "customer",
  parties = [],
  value = {},
  onChange,
}) {
  const [focused, setFocused] = useState(false);
  const label = role === "customer" ? "Cliente" : "Proveedor";
  const matches = useMemo(() => {
    const q = String(value.name || "")
      .trim()
      .toLocaleLowerCase("es");
    if (q.length < 1) return [];
    return parties
      .filter(
        (p) =>
          p.role === role &&
          p.name &&
          p.name.toLocaleLowerCase("es").includes(q),
      )
      .sort((a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0))
      .slice(0, 5);
  }, [parties, role, value.name]);
  const set = (k, v) => onChange({ ...value, [k]: v });
  const choose = (p) => {
    onChange({ ...p, id: p.id, role });
    setFocused(false);
  };
  return (
    <div className="party-fields">
      <div className="party-fields-title">
        {role === "customer" ? (
          <UserRound size={16} />
        ) : (
          <Building2 size={16} />
        )}
        <b>Datos del {label.toLowerCase()}</b>
        <small>Todos los campos son opcionales</small>
      </div>
      <div className="form-grid">
        <label className="span-2 party-name-wrap">
          {label}
          <input
            value={value.name || ""}
            autoComplete="off"
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onChange={(e) =>
              onChange({ ...value, name: e.target.value, id: "" })
            }
            placeholder={
              role === "customer"
                ? "Nombre del cliente"
                : "Nombre del proveedor"
            }
          />
          {focused && matches.length > 0 && (
            <div className="party-suggestions">
              {matches.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(p)}
                >
                  <span>
                    <b>{p.name}</b>
                    <small>
                      {[p.phone, p.email].filter(Boolean).join(" · ") ||
                        "Sin datos de contacto"}
                    </small>
                  </span>
                  <span className="party-suggestion-meta">
                    {p.badge && (
                      <em>
                        <Star size={11} />
                        {p.badge}
                      </em>
                    )}
                    <small>Autocompletar</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </label>
        <label>
          Teléfono
          <input
            value={value.phone || ""}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="099 000 000"
          />
        </label>
        <label>
          Correo electrónico
          <input
            type="email"
            value={value.email || ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="correo@ejemplo.com"
          />
        </label>
        <label>
          Documento / RUT
          <input
            value={value.taxId || ""}
            onChange={(e) => set("taxId", e.target.value)}
            placeholder="Opcional"
          />
        </label>
        <label>
          Dirección
          <input
            value={value.address || ""}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Calle, ciudad…"
          />
        </label>
        <label className="span-2">
          Observaciones
          <textarea
            rows="2"
            value={value.notes || ""}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Datos adicionales (opcional)"
          />
        </label>
      </div>
    </div>
  );
}
