import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AlertCircle, Menu, Plus, Settings2 } from "lucide-react";
import { auth, firebaseConfigured, db } from "./firebase";
import {
  collection,
  addDoc,
  setDoc,
  getDoc,
  runTransaction,
  doc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Movements from "./components/Movements";
import Inventory from "./components/Inventory";
import Recipes from "./components/Recipes";
import Reports from "./components/Reports";
import MovementModal from "./components/MovementModal";
import RecordModal from "./components/RecordModal";
import Auth from "./components/Auth";
import { demoMovements, demoIngredients, demoRecipes } from "./data/demo";
const titles = {
  dashboard: "Resumen general",
  movements: "Movimientos",
  recipes: "Recetario y costos",
  inventory: "Inventario",
  reports: "Reportes",
};
export default function App() {
  const [user, setUser] = useState(undefined),
    [demo, setDemo] = useState(false),
    [active, setActive] = useState("dashboard"),
    [mobileOpen, setMobileOpen] = useState(false),
    [modal, setModal] = useState(""),
    [movements, setMovements] = useState(demoMovements),
    [ingredients, setIngredients] = useState(demoIngredients),
    [recipes, setRecipes] = useState(demoRecipes),
    [toast, setToast] = useState("");
  useEffect(() => {
    if (!auth) {
      setUser(null);
      return;
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && firebaseConfigured) {
        try {
          const profileRef = doc(db, "users", u.uid);
          const profileSnap = await getDoc(profileRef);
          if (!profileSnap.exists()) {
            await setDoc(profileRef, {
              uid: u.uid,
              email: u.email || "",
              displayName: u.displayName || "",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(profileRef, {
              uid: u.uid,
              email: u.email || "",
              displayName: u.displayName || profileSnap.data().displayName || "",
              updatedAt: serverTimestamp(),
            }, { merge: true });
          }
        } catch (e) {
          console.error("No se pudo sincronizar el perfil", e);
        }
      }
    });
  }, []);
  useEffect(() => {
    if (!user || !firebaseConfigured) {
      if (firebaseConfigured && !demo) {
        setMovements([]);
        setIngredients([]);
        setRecipes([]);
      }
      return;
    }
    // Evita mostrar brevemente datos del usuario anterior al cambiar de sesión.
    setMovements([]);
    setIngredients([]);
    setRecipes([]);
    let alive = true;
    (async () => {
      try {
        const load = async (name) => {
          const s = await getDocs(
            query(
              collection(db, "users", user.uid, name),
              orderBy("createdAt", "desc"),
            ),
          );
          return s.docs.map((d) => ({ id: d.id, ...d.data() }));
        };
        const [m, i, r] = await Promise.all([
          load("movements"),
          load("ingredients"),
          load("recipes"),
        ]);
        if (!alive) return;
        setMovements(m);
        setIngredients(i);
        setRecipes(r);
      } catch (e) {
        notify("No se pudieron cargar los datos: " + e.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, demo]);
  function notify(s) {
    setToast(s);
    setTimeout(() => setToast(""), 3800);
  }
  const isDemo = demo || (!user && !firebaseConfigured);
  async function save(type, data) {
    if (isDemo) {
      const item = { ...data, id: `${type}-${Date.now()}` };
      if (type === "movements") setMovements((p) => [item, ...p]);
      if (type === "ingredients") setIngredients((p) => [...p, item]);
      if (type === "recipes") setRecipes((p) => [...p, item]);
      notify("Guardado en esta sesión de demostración.");
      return item;
    }
    try {
      let ref;
      if (type === "ingredients" || type === "recipes") {
        const normalized = String(data.name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
        if (!normalized) throw new Error("Ingresá un nombre válido.");
        ref = doc(db, "users", user.uid, type, normalized);
        await runTransaction(db, async (tx) => {
          const existing = await tx.get(ref);
          if (existing.exists()) throw new Error(`Ya existe ${type === "ingredients" ? "un insumo" : "una receta"} con ese nombre. Revisá el registro existente para evitar duplicados.`);
          tx.set(ref, { ...data, name: String(data.name).trim(), nameKey: normalized, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          if (type === "ingredients" && Number(data.stock) > 0) {
            const initialStockRef = doc(collection(db, "users", user.uid, "stockMovements"));
            tx.set(initialStockRef, {
              ingredientId: ref.id,
              ingredientName: String(data.name).trim(),
              direction: "in",
              reason: "Stock inicial",
              quantity: Number(data.stock),
              unit: data.unit || "un",
              unitCost: Number(data.cost || 0),
              totalCost: Number(data.stock || 0) * Number(data.cost || 0),
              date: new Date().toISOString().slice(0, 10),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        });
      } else {
        ref = await addDoc(collection(db, "users", user.uid, type), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      const item = { ...data, id: ref.id };
      if (type === "movements") setMovements((p) => [item, ...p]);
      if (type === "ingredients") setIngredients((p) => [item, ...p]);
      if (type === "recipes") setRecipes((p) => [item, ...p]);
      notify("Cambios guardados correctamente.");
      return item;
    } catch (e) {
      notify("No se pudo guardar: " + e.message);
      return null;
    }
  }
  async function addMovement(data) {
    await save("movements", data);
  }
  async function addIngredient(data) {
    await save("ingredients", data);
  }
  async function addRecipe(data) {
    await save("recipes", data);
  }
  async function adjustStock(id, qty, direction, cost, reason) {
    const item = ingredients.find((i) => i.id === id);
    if (!item || !Number.isFinite(qty) || qty <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const unitCost = reason === "Compra" && direction === "in" && cost > 0 ? cost / qty : Number(item.cost || 0);
    try {
      if (isDemo) {
        const stock = Number(item.stock || 0) + (direction === "in" ? qty : -qty);
        if (stock < 0) { notify(`Stock insuficiente de ${item.name}.`); return; }
        setIngredients((p) => p.map((i) => i.id === id ? { ...i, stock, cost: reason === "Compra" ? unitCost : i.cost } : i));
      } else {
        await runTransaction(db, async (tx) => {
          const ingredientRef = doc(db, "users", user.uid, "ingredients", id);
          const snap = await tx.get(ingredientRef);
          if (!snap.exists()) throw new Error("El insumo ya no existe.");
          const current = snap.data();
          const stock = Number(current.stock || 0) + (direction === "in" ? qty : -qty);
          if (stock < 0) throw new Error(`Stock insuficiente de ${current.name}.`);
          tx.update(ingredientRef, {
            stock,
            cost: reason === "Compra" && direction === "in" && cost > 0 ? unitCost : Number(current.cost || 0),
            updatedAt: serverTimestamp(),
          });
          const ledgerRef = doc(collection(db, "users", user.uid, "stockMovements"));
          tx.set(ledgerRef, {
            ingredientId: id,
            ingredientName: current.name || item.name,
            direction,
            reason,
            quantity: qty,
            unit: current.unit || item.unit || "un",
            unitCost,
            totalCost: direction === "in" && cost > 0 ? cost : qty * Number(current.cost || 0),
            date: today,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          const financialAmount = reason === "Merma"
            ? qty * Number(current.cost || 0)
            : (reason === "Compra" ? (cost || qty * unitCost) : 0);
          if ((reason === "Merma" || reason === "Compra") && financialAmount > 0) {
            const movementRef = doc(collection(db, "users", user.uid, "movements"));
            tx.set(movementRef, {
              type: "expense",
              concept: `${reason === "Merma" ? "Merma" : "Compra de materia prima"}: ${current.name || item.name}`,
              category: reason === "Merma" ? "Merma" : "Materia prima",
              amount: financialAmount,
              date: today,
              invoice: "",
              method: "Inventario",
              notes: reason === "Merma" ? "Pérdida de inventario registrada" : "Compra registrada desde inventario",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        });
        const refreshed = await getDocs(query(collection(db, "users", user.uid, "ingredients")));
        setIngredients(refreshed.docs.map((d) => ({ id: d.id, ...d.data() })));
        const movementSnap = await getDocs(query(collection(db, "users", user.uid, "movements"), orderBy("createdAt", "desc")));
        setMovements(movementSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
      if (isDemo && (reason === "Merma" || reason === "Compra")) {
        const movement = { id: `movement-${Date.now()}`, type: "expense", concept: `${reason}: ${item.name}`, category: reason === "Merma" ? "Merma" : "Materia prima", amount: reason === "Merma" ? qty * Number(item.cost || 0) : (cost || qty * unitCost), date: today, invoice: "", method: "Inventario" };
        setMovements((p) => [movement, ...p]);
      }
      notify(reason === "Merma" ? "Merma registrada y descontada del stock." : "Inventario actualizado correctamente.");
    } catch (e) {
      notify("No se pudo actualizar el inventario: " + e.message);
    }
  }
  async function sellRecipe(r) {
    if (!r || !(Number(r.yield) > 0)) { notify("La receta necesita un rendimiento válido."); return; }
    if (!(Number(r.price) > 0)) { notify("Definí un precio de venta mayor que cero antes de registrar la venta."); return; }
    const today = new Date().toISOString().slice(0, 10);
    const qty = 1;
    const needed = (r.ingredients || []).filter((x) => Number(x.qty) > 0);
    if (!needed.length) { notify("Agregá ingredientes a la receta antes de venderla."); return; }
    try {
      if (isDemo) {
        const updates = [];
        for (const line of needed) {
          const ing = ingredients.find((i) => i.id === line.id);
          if (!ing || Number(ing.stock || 0) < Number(line.qty) / Number(r.yield)) {
            notify(`Stock insuficiente de ${ing?.name || "un ingrediente"}.`); return;
          }
          updates.push({ ...ing, stock: Number(ing.stock) - Number(line.qty) / Number(r.yield) });
        }
        setIngredients((prev) => prev.map((ing) => updates.find((u) => u.id === ing.id) || ing));
        const unitCost = needed.reduce((sum, line) => sum + Number(ingredients.find((i) => i.id === line.id)?.cost || 0) * Number(line.qty), 0) / Number(r.yield);
        setMovements((prev) => [{ id: `sale-${Date.now()}`, type: "income", concept: `Venta: ${r.name}`, category: "Ventas", amount: Number(r.price || 0), date: today, invoice: "", method: "Venta directa", notes: `Costo estimado de ingredientes: ${unitCost.toFixed(2)}` }, ...prev]);
      } else {
        await runTransaction(db, async (tx) => {
          const refs = needed.map((line) => ({ line, ref: doc(db, "users", user.uid, "ingredients", line.id) }));
          const snaps = [];
          for (const item of refs) snaps.push(await tx.get(item.ref));
          const lines = refs.map((item, index) => {
            if (!snaps[index].exists()) throw new Error("Un ingrediente de la receta ya no existe.");
            const ingredient = snaps[index].data();
            const amount = Number(item.line.qty) * qty / Number(r.yield);
            if (!Number.isFinite(amount) || amount <= 0) throw new Error("La receta contiene cantidades inválidas.");
            if (Number(ingredient.stock || 0) < amount) throw new Error(`Stock insuficiente de ${ingredient.name}.`);
            return { ...item, ingredient, amount };
          });
          for (const line of lines) {
            tx.update(line.ref, { stock: Number(line.ingredient.stock || 0) - line.amount, updatedAt: serverTimestamp() });
            const ledgerRef = doc(collection(db, "users", user.uid, "stockMovements"));
            tx.set(ledgerRef, {
              ingredientId: line.line.id,
              ingredientName: line.ingredient.name || "Ingrediente",
              direction: "out",
              reason: "Venta de receta",
              recipeId: r.id,
              recipeName: r.name,
              quantity: line.amount,
              unit: line.ingredient.unit || "un",
              unitCost: Number(line.ingredient.cost || 0),
              totalCost: line.amount * Number(line.ingredient.cost || 0),
              date: today,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          const movementRef = doc(collection(db, "users", user.uid, "movements"));
          tx.set(movementRef, {
            type: "income", concept: `Venta: ${r.name}`, category: "Ventas",
            amount: Number(r.price || 0) * qty, date: today, invoice: "",
            method: "Venta directa", notes: `Venta de ${qty} unidad(es) de ${r.name}`,
            recipeId: r.id, quantity: qty, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          });
        });
        const [ingredientSnap, movementSnap] = await Promise.all([
          getDocs(query(collection(db, "users", user.uid, "ingredients"))),
          getDocs(query(collection(db, "users", user.uid, "movements"), orderBy("createdAt", "desc"))),
        ]);
        setIngredients(ingredientSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setMovements(movementSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
      notify("Venta registrada; ingredientes y movimiento financiero actualizados en una sola operación.");
    } catch (e) {
      notify("La venta no se completó y no se descontó stock: " + e.message);
    }
  }
  async function logout() {
    if (user && auth) await signOut(auth);
    setDemo(false);
    setActive("dashboard");
  }
  if (user === undefined && !demo)
    return (
      <div className="loading-screen">
        <div className="brand-mark">
          <Settings2 />
        </div>
        <span>Preparando tu espacio…</span>
      </div>
    );
  if (!isDemo && !user) return <Auth onDemo={() => {
    setMovements(demoMovements);
    setIngredients(demoIngredients);
    setRecipes(demoRecipes);
    setDemo(true);
  }} />;
  const content =
    active === "dashboard" ? (
      <Dashboard
        movements={movements}
        ingredients={ingredients}
        recipes={recipes}
        onAdd={() => setModal("movement")}
        onNavigate={setActive}
      />
    ) : active === "movements" ? (
      <Movements movements={movements} onAdd={() => setModal("movement")} />
    ) : active === "inventory" ? (
      <Inventory
        ingredients={ingredients}
        onAdjust={adjustStock}
        onAdd={() => setModal("ingredient")}
      />
    ) : active === "recipes" ? (
      <Recipes
        recipes={recipes}
        ingredients={ingredients}
        onAdd={() => setModal("recipe")}
        onSell={sellRecipe}
      />
    ) : (
      <Reports
        movements={movements}
        recipes={recipes}
        ingredients={ingredients}
      />
    );
  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={setActive}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        onLogout={logout}
      />
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button hamburger"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </button>
            <span className="breadcrumb">
              Ledgr <span>/</span> <b>{titles[active]}</b>
            </span>
          </div>
          <div className="topbar-right">
            {isDemo && (
              <span className="demo-indicator">
                <i /> DEMO
              </span>
            )}
            <div className="topbar-date">{new Intl.DateTimeFormat("es-UY", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date())}</div>
            <div className="topbar-avatar">
              {(user?.email || "D").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        {isDemo && (
          <div className="demo-banner">
            <AlertCircle size={15} />
            <span>
              Estás explorando datos de ejemplo. Los cambios no se guardan al
              cerrar esta sesión.
            </span>
            <button
              onClick={() => {
                setDemo(false);
                setUser(null);
              }}
            >
              Configurar acceso
            </button>
          </div>
        )}
        {content}
      </main>
      {modal === "movement" && (
        <MovementModal onClose={() => setModal("")} onSave={addMovement} />
      )}
      {(modal === "recipe" || modal === "ingredient") && (
        <RecordModal
          kind={modal}
          ingredients={ingredients}
          onClose={() => setModal("")}
          onSave={modal === "recipe" ? addRecipe : addIngredient}
        />
      )}
      {toast && (
        <div className="toast">
          <span>{toast}</span>
          <button onClick={() => setToast("")}>×</button>
        </div>
      )}
    </div>
  );
}
