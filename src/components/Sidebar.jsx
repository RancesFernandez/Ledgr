import React from "react";
import {
  Activity,
  ArrowLeftRight,
  Boxes,
  ChartNoAxesCombined,
  ChefHat,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Settings2,
  WalletCards,
  X,
} from "lucide-react";
const items = [
  ["dashboard", "Resumen", LayoutDashboard],
  ["movements", "Movimientos", ArrowLeftRight],
  ["recipes", "Recetario y costos", ChefHat],
  ["inventory", "Inventario", Boxes],
  ["reports", "Reportes", ChartNoAxesCombined],
];
export default function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
  user,
  onLogout,
}) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Activity size={21} />
          </div>
          <div>
            <b>Ledgr</b>
            <small>GESTIÓN DE FINANZAS</small>
          </div>
          <button className="icon-button mobile-close" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <div className="workspace-label">TU NEGOCIO</div>
        <nav>
          {items.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`nav-item ${active === id ? "active" : ""}`}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "inventory" && <i className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-link">
            <CircleHelp size={17} />
            <span>Centro de ayuda</span>
          </div>
          <div className="profile">
            <div className="avatar">
              {(user?.email || "D").slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-text">
              <b>{user?.displayName || "Mi pastelería"}</b>
              <small>{user?.email || "Modo de demostración"}</small>
            </div>
            <button
              className="icon-button"
              title="Cerrar sesión"
              onClick={onLogout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
