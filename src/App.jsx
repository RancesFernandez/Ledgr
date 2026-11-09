import {
  consumption,
  recipeCost,
  sellingPrice,
  isCountUnit,
} from "./utils/recipe";
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
  updateDoc,
  deleteDoc,
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
    [movements, setMovements] = useState([]),
    [ingredients, setIngredients] = useState([]),
    [recipes, setRecipes] = useState([]),
    [parties, setParties] = useState([]),
    [recipeToEdit, setRecipeToEdit] = useState(null),
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
            await setDoc(
              profileRef,
              {
                uid: u.uid,
                email: u.email || "",
                displayName:
                  u.displayName || profileSnap.data().displayName || "",
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
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
        setParties([]);
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
        const [m, i, r, p] = await Promise.all([
          load("movements"),
          load("ingredients"),
          load("recipes"),
          load("parties"),
        ]);
        if (!alive) return;
        setMovements(m);
        setIngredients(i);
        setRecipes(r);
        setParties(p);
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
  async function upsertParty(party, amount = 0) {
    if (!party || !String(party.name || "").trim()) return null;
    const role = party.role === "supplier" ? "supplier" : "customer";
    const name = String(party.name).trim();
    const normalized = name
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70);
    if (!normalized) return null;
    const id = `${role}-${normalized}`;
    const old = parties.find((x) => x.id === id);
    const merged = {
      ...old,
      ...party,
      id,
      role,
      name,
      phone: String(party.phone || old?.phone || "").trim(),
      email: String(party.email || old?.email || "").trim(),
      taxId: String(party.taxId || old?.taxId || "").trim(),
      address: String(party.address || old?.address || "").trim(),
      notes: String(party.notes || old?.notes || "").trim(),
      totalAmount: Number(old?.totalAmount || 0) + Number(amount || 0),
      purchaseCount:
        Number(old?.purchaseCount || 0) + (role === "customer" ? 1 : 0),
      operationCount: Number(old?.operationCount || 0) + 1,
      badge:
        role === "customer"
          ? Number(old?.totalAmount || 0) + Number(amount || 0) >= 20000
            ? "Cliente destacado"
            : Number(old?.purchaseCount || 0) + 1 >= 5
              ? "Frecuente"
              : ""
          : "",
      lastMovementAt: new Date().toISOString(),
    };
    if (isDemo) {
      setParties((prev) => [merged, ...prev.filter((x) => x.id !== id)]);
      return merged;
    }
    if (!user || !firebaseConfigured) return null;
    await setDoc(
      doc(db, "users", user.uid, "parties", id),
      {
        ...merged,
        updatedAt: serverTimestamp(),
        ...(old ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
    setParties((prev) => [merged, ...prev.filter((x) => x.id !== id)]);
    return merged;
  }
  async function save(type, data) {
    if (type === "movements" && data.party?.name?.trim()) {
      const savedParty = await upsertParty(
        data.party,
        Number(data.amount || 0),
      );
      if (savedParty)
        data = {
          ...data,
          party: { ...data.party, ...savedParty },
          partyId: savedParty.id,
          partyRole: savedParty.role,
        };
    }
    if (isDemo) {
      const item = { ...data, id: `${type}-${Date.now()}` };
      if (type === "movements") setMovements((p) => [item, ...p]);
      if (type === "ingredients") setIngredients((p) => [...p, item]);
      if (type === "recipes") setRecipes((p) => [...p, item]);
      notify(
        "Guardado en esta sesión local; configurá Firebase para conservar los datos.",
      );
      return item;
    }
    try {
      let ref;
      if (type === "ingredients" || type === "recipes") {
        const normalized = String(data.name || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80);
        if (!normalized) throw new Error("Ingresá un nombre válido.");
        ref = doc(db, "users", user.uid, type, normalized);
        await runTransaction(db, async (tx) => {
          const existing = await tx.get(ref);
          if (existing.exists())
            throw new Error(
              `Ya existe ${type === "ingredients" ? "un insumo" : "una receta"} con ese nombre. Revisá el registro existente para evitar duplicados.`,
            );
          tx.set(ref, {
            ...data,
            name: String(data.name).trim(),
            nameKey: normalized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          if (type === "ingredients" && Number(data.stock) > 0) {
            const initialStockRef = doc(
              collection(db, "users", user.uid, "stockMovements"),
            );
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
    if (data.inventoryPurchase && data.party?.name?.trim()) {
      const savedParty = await upsertParty(
        data.party,
        Number(data.amount || 0),
      );
      if (savedParty)
        data = {
          ...data,
          party: { ...data.party, ...savedParty },
          partyId: savedParty.id,
          partyRole: savedParty.role,
        };
    }
    const purchase = data.inventoryPurchase;
    if (!purchase) return save("movements", data);
    const today = data.date || new Date().toISOString().slice(0, 10);
    const normalized = String(purchase.name || "")
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
    if (
      !normalized ||
      !(Number(purchase.quantity) > 0) ||
      !(Number(purchase.unitCost) > 0)
    ) {
      notify("Completá el artículo, la cantidad y el costo unitario.");
      return null;
    }
    const { inventoryPurchase: _purchase, ...cleanData } = data;
    const movementData = {
      ...cleanData,
      type: "expense",
      category: "Materia prima",
      amount: Number(purchase.totalCost),
    };
    try {
      if (isDemo) {
        let item = ingredients.find(
          (i) =>
            i.id === (purchase.ingredientId || normalized) ||
            String(i.name).trim().toLowerCase() ===
              purchase.name.trim().toLowerCase(),
        );
        if (item) {
          const oldStock = Number(item.stock || 0),
            nextStock = oldStock + Number(purchase.quantity);
          const avgCost =
            (oldStock * Number(item.cost || 0) + Number(purchase.totalCost)) /
            nextStock;
          setIngredients((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, stock: nextStock, cost: avgCost } : i,
            ),
          );
        } else {
          item = {
            id: normalized,
            name: purchase.name.trim(),
            unit: purchase.unit || "un",
            stock: Number(purchase.quantity),
            min: Number(purchase.min || 0),
            cost: Number(purchase.unitCost),
          };
          setIngredients((prev) => [...prev, item]);
        }
        setMovements((prev) => [
          { ...movementData, id: `movement-${Date.now()}` },
          ...prev,
        ]);
        notify("Compra registrada como gasto y stock actualizado.");
        return movementData;
      }
      if (!user || !firebaseConfigured)
        throw new Error("Iniciá sesión para guardar la compra.");
      await runTransaction(db, async (tx) => {
        const ingredientId = purchase.ingredientId || normalized;
        const ingredientRef = doc(
          db,
          "users",
          user.uid,
          "ingredients",
          ingredientId,
        );
        const ingredientSnap = await tx.get(ingredientRef);
        let actualRef = ingredientRef;
        let current = ingredientSnap.exists() ? ingredientSnap.data() : null;
        const oldStock = Number(current?.stock || 0);
        const nextStock = oldStock + Number(purchase.quantity);
        if (
          isCountUnit(current?.unit || purchase.unit) &&
          (!Number.isInteger(Number(purchase.quantity)) ||
            !Number.isInteger(nextStock))
        )
          throw new Error(
            "Las compras por unidades requieren cantidades enteras.",
          );
        const oldCost = Number(current?.cost || 0);
        const averageCost =
          nextStock > 0
            ? (oldStock * oldCost + Number(purchase.totalCost)) / nextStock
            : Number(purchase.unitCost);
        if (current) {
          tx.update(actualRef, {
            stock: nextStock,
            cost: averageCost,
            updatedAt: serverTimestamp(),
          });
        } else {
          tx.set(actualRef, {
            name: purchase.name.trim(),
            nameKey: normalized,
            unit: purchase.unit || "un",
            stock: Number(purchase.quantity),
            min: Number(purchase.min || 0),
            cost: Number(purchase.unitCost),
            expiry: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
        const movementRef = doc(collection(db, "users", user.uid, "movements"));
        tx.set(movementRef, {
          ...movementData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        const ledgerRef = doc(
          collection(db, "users", user.uid, "stockMovements"),
        );
        tx.set(ledgerRef, {
          ingredientId: actualRef.id,
          ingredientName: purchase.name.trim(),
          direction: "in",
          reason: "Compra",
          quantity: Number(purchase.quantity),
          unit: current?.unit || purchase.unit || "un",
          unitCost: Number(purchase.unitCost),
          totalCost: Number(purchase.totalCost),
          date: today,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      const [ingredientSnap, movementSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "ingredients")),
        getDocs(
          query(
            collection(db, "users", user.uid, "movements"),
            orderBy("createdAt", "desc"),
          ),
        ),
      ]);
      setIngredients(
        ingredientSnap.docs.map((s) => ({ id: s.id, ...s.data() })),
      );
      setMovements(movementSnap.docs.map((s) => ({ id: s.id, ...s.data() })));
      notify(
        "Compra registrada como gasto del período y stock actualizado correctamente.",
      );
      return movementData;
    } catch (e) {
      notify("No se pudo registrar la compra: " + e.message);
      return null;
    }
  }
  async function addIngredient(data) {
    const { registerInitialExpense, ...ingredientData } = data;
    const item = await save("ingredients", ingredientData);
    if (!item || !registerInitialExpense) return item;
    const amount =
      Number(ingredientData.stock || 0) * Number(ingredientData.cost || 0);
    if (amount > 0) {
      await save("movements", {
        type: "expense",
        concept: `Stock inicial de inventario: ${ingredientData.name}`,
        category: "Materia prima",
        amount: Number(amount.toFixed(2)),
        date: new Date().toISOString().slice(0, 10),
        invoice: "",
        method: "Inventario",
        notes:
          "Stock inicial marcado para registrar como gasto del período desde el inventario.",
      });
    }
    return item;
  }
  async function addRecipe(data) {
    return await save("recipes", data);
  }
  async function updateRecipe(data) {
    const original = recipeToEdit;
    if (!original) return;
    if (isDemo) {
      setRecipes((p) =>
        p.map((r) => (r.id === original.id ? { ...r, ...data, id: r.id } : r)),
      );
      setRecipeToEdit(null);
      notify("Receta actualizada en esta sesión local.");
      return true;
    }
    try {
      await updateDoc(doc(db, "users", user.uid, "recipes", original.id), {
        ...data,
        name: String(data.name || "").trim(),
        updatedAt: serverTimestamp(),
      });
      setRecipes((p) =>
        p.map((r) => (r.id === original.id ? { ...r, ...data, id: r.id } : r)),
      );
      setRecipeToEdit(null);
      notify("Receta actualizada correctamente.");
      return true;
    } catch (e) {
      notify("No se pudo editar la receta: " + e.message);
      return null;
    }
  }
  async function deleteRecipe(recipe) {
    if (
      !window.confirm(
        `¿Eliminar la receta “${recipe.name}”? Las ventas y movimientos ya registrados se conservarán.`,
      )
    )
      return;
    if (isDemo) {
      setRecipes((p) => p.filter((r) => r.id !== recipe.id));
      notify("Receta eliminada de esta sesión.");
      return;
    }
    try {
      await deleteDoc(doc(db, "users", user.uid, "recipes", recipe.id));
      setRecipes((p) => p.filter((r) => r.id !== recipe.id));
      notify("Receta eliminada. Los movimientos históricos se conservaron.");
    } catch (e) {
      notify("No se pudo eliminar la receta: " + e.message);
    }
  }
  async function adjustStock(id, qty, direction, cost, reason) {
    const item = ingredients.find((i) => i.id === id);
    if (!item || !Number.isFinite(qty) || qty <= 0) return;
    if (isCountUnit(item.unit) && !Number.isInteger(qty)) {
      notify("Las unidades deben ajustarse con cantidades enteras.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const unitCost =
      reason === "Compra" && direction === "in" && cost > 0
        ? cost / qty
        : Number(item.cost || 0);
    try {
      if (isDemo) {
        const stock =
          Number(item.stock || 0) + (direction === "in" ? qty : -qty);
        if (stock < 0) {
          notify(`Stock insuficiente de ${item.name}.`);
          return;
        }
        setIngredients((p) =>
          p.map((i) =>
            i.id === id
              ? { ...i, stock, cost: reason === "Compra" ? unitCost : i.cost }
              : i,
          ),
        );
      } else {
        await runTransaction(db, async (tx) => {
          const ingredientRef = doc(db, "users", user.uid, "ingredients", id);
          const snap = await tx.get(ingredientRef);
          if (!snap.exists()) throw new Error("El insumo ya no existe.");
          const current = snap.data();
          const stock =
            Number(current.stock || 0) + (direction === "in" ? qty : -qty);
          if (stock < 0)
            throw new Error(`Stock insuficiente de ${current.name}.`);
          if (
            isCountUnit(current.unit) &&
            (!Number.isInteger(qty) || !Number.isInteger(stock))
          )
            throw new Error(
              `El stock de ${current.name} debe expresarse en unidades enteras.`,
            );
          tx.update(ingredientRef, {
            stock,
            cost:
              reason === "Compra" && direction === "in" && cost > 0
                ? unitCost
                : Number(current.cost || 0),
            updatedAt: serverTimestamp(),
          });
          const ledgerRef = doc(
            collection(db, "users", user.uid, "stockMovements"),
          );
          tx.set(ledgerRef, {
            ingredientId: id,
            ingredientName: current.name || item.name,
            direction,
            reason,
            quantity: qty,
            unit: current.unit || item.unit || "un",
            unitCost,
            totalCost:
              direction === "in" && cost > 0
                ? cost
                : qty * Number(current.cost || 0),
            date: today,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          const financialAmount =
            reason === "Merma"
              ? qty * Number(current.cost || 0)
              : reason === "Compra"
                ? cost || qty * unitCost
                : 0;
          if (
            (reason === "Merma" || reason === "Compra") &&
            financialAmount > 0
          ) {
            const movementRef = doc(
              collection(db, "users", user.uid, "movements"),
            );
            tx.set(movementRef, {
              type: "expense",
              concept: `${reason === "Merma" ? "Merma" : "Compra de materia prima"}: ${current.name || item.name}`,
              category: reason === "Merma" ? "Merma" : "Materia prima",
              amount: financialAmount,
              date: today,
              invoice: "",
              method: "Inventario",
              notes:
                reason === "Merma"
                  ? "Pérdida de inventario registrada"
                  : "Compra registrada desde inventario",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        });
        const refreshed = await getDocs(
          query(collection(db, "users", user.uid, "ingredients")),
        );
        setIngredients(refreshed.docs.map((d) => ({ id: d.id, ...d.data() })));
        const movementSnap = await getDocs(
          query(
            collection(db, "users", user.uid, "movements"),
            orderBy("createdAt", "desc"),
          ),
        );
        setMovements(movementSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
      if (isDemo && (reason === "Merma" || reason === "Compra")) {
        const movement = {
          id: `movement-${Date.now()}`,
          type: "expense",
          concept: `${reason}: ${item.name}`,
          category: reason === "Merma" ? "Merma" : "Materia prima",
          amount:
            reason === "Merma"
              ? qty * Number(item.cost || 0)
              : cost || qty * unitCost,
          date: today,
          invoice: "",
          method: "Inventario",
        };
        setMovements((p) => [movement, ...p]);
      }
      notify(
        reason === "Merma"
          ? "Merma registrada y descontada del stock."
          : "Inventario actualizado correctamente.",
      );
    } catch (e) {
      notify("No se pudo actualizar el inventario: " + e.message);
    }
  }
  async function sellRecipe(r, quantity = 1, saleInfo = {}) {
    if (!r || !(Number(r.yield) > 0)) {
      notify("La receta necesita un rendimiento válido.");
      return false;
    }
    if (!(sellingPrice(r, ingredients) > 0)) {
      notify(
        "Definí un precio de venta mayor que cero antes de registrar la venta.",
      );
      return false;
    }
    const today = new Date().toISOString().slice(0, 10);
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const needed = (r.ingredients || []).filter((x) => Number(x.qty) > 0);
    const ingredientBatchCost = needed.reduce(
      (sum, line) =>
        sum +
        Number(ingredients.find((i) => i.id === line.id)?.cost || 0) *
          Number(line.qty || 0),
      0,
    );
    const laborCost = Number(r.labor || 0);
    const unitCostEstimate = recipeCost(r, ingredients);
    const totalRevenue = sellingPrice(r, ingredients) * qty;
    const totalEstimatedCost = unitCostEstimate * qty;
    const estimatedProfit = totalRevenue - totalEstimatedCost;
    if (!needed.length) {
      notify("Agregá ingredientes a la receta antes de venderla.");
      return false;
    }
    try {
      const savedParty = saleInfo.party?.name?.trim()
        ? await upsertParty(
            { ...saleInfo.party, role: "customer" },
            totalRevenue,
          )
        : null;
      const partySnapshot = savedParty
        ? { ...saleInfo.party, ...savedParty, role: "customer" }
        : null;
      if (isDemo) {
        const updates = [];
        for (const line of needed) {
          const ing = ingredients.find((i) => i.id === line.id);
          if (!ing) {
            notify("Ingrediente inexistente.");
            return false;
          }
          if (isCountUnit(ing.unit) && !Number.isInteger(Number(ing.stock)))
            throw new Error(
              `El stock de ${ing.name} contiene decimales; corregilo antes de vender.`,
            );
          if (Number(ing.stock || 0) < consumption(line, ing, qty, r.yield)) {
            notify(`Stock insuficiente de ${ing?.name || "un ingrediente"}.`);
            return false;
          }
          updates.push({
            ...ing,
            stock: Number(ing.stock) - consumption(line, ing, qty, r.yield),
          });
        }
        setIngredients((prev) =>
          prev.map((ing) => updates.find((u) => u.id === ing.id) || ing),
        );
        setMovements((prev) => [
          {
            id: `sale-${Date.now()}`,
            type: "income",
            concept: `Venta: ${r.name} × ${qty}`,
            category: "Ventas",
            amount: totalRevenue,
            date: today,
            invoice: "",
            method: saleInfo.method || "Otro",
            channel: saleInfo.channel || "Otro",
            party: partySnapshot,
            partyId: savedParty?.id || "",
            partyRole: "customer",
            notes: [
              saleInfo.notes,
              `Canal: ${saleInfo.channel || "Otro"}. Costo estimado total: ${totalEstimatedCost.toFixed(2)} UYU · Ganancia estimada total: ${estimatedProfit.toFixed(2)} UYU · Costo por unidad completa: ${unitCostEstimate.toFixed(2)} UYU · Precio por unidad completa: ${sellingPrice(r, ingredients).toFixed(2)} UYU.`,
            ]
              .filter(Boolean)
              .join(" "),
          },
          ...prev,
        ]);
      } else {
        await runTransaction(db, async (tx) => {
          const refs = needed.map((line) => ({
            line,
            ref: doc(db, "users", user.uid, "ingredients", line.id),
          }));
          const snaps = [];
          for (const item of refs) snaps.push(await tx.get(item.ref));
          const lines = refs.map((item, index) => {
            if (!snaps[index].exists())
              throw new Error("Un ingrediente de la receta ya no existe.");
            const ingredient = snaps[index].data();
            const amount = consumption(item.line, ingredient, qty, r.yield);
            if (
              isCountUnit(ingredient.unit) &&
              !Number.isInteger(Number(ingredient.stock))
            )
              throw new Error(
                `El stock de ${ingredient.name} contiene decimales; corregilo antes de vender.`,
              );
            if (!Number.isFinite(amount) || amount <= 0)
              throw new Error("La receta contiene cantidades inválidas.");
            if (Number(ingredient.stock || 0) < amount)
              throw new Error(`Stock insuficiente de ${ingredient.name}.`);
            return { ...item, ingredient, amount };
          });
          for (const line of lines) {
            tx.update(line.ref, {
              stock: isCountUnit(line.ingredient.unit)
                ? Number(line.ingredient.stock || 0) - line.amount
                : Math.round(
                    (Number(line.ingredient.stock || 0) - line.amount) * 1e8,
                  ) / 1e8,
              updatedAt: serverTimestamp(),
            });
            const ledgerRef = doc(
              collection(db, "users", user.uid, "stockMovements"),
            );
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
          const movementRef = doc(
            collection(db, "users", user.uid, "movements"),
          );
          tx.set(movementRef, {
            type: "income",
            concept: `Venta: ${r.name} × ${qty}`,
            category: "Ventas",
            amount: totalRevenue,
            date: today,
            invoice: "",
            method: saleInfo.method || "Otro",
            channel: saleInfo.channel || "Otro",
            party: partySnapshot,
            partyId: savedParty?.id || "",
            partyRole: "customer",
            notes: [
              saleInfo.notes,
              `Canal: ${saleInfo.channel || "Otro"}. Costo estimado total: ${totalEstimatedCost.toFixed(2)} UYU · Ganancia estimada total: ${estimatedProfit.toFixed(2)} UYU · Costo por unidad completa: ${unitCostEstimate.toFixed(2)} UYU · Precio por unidad completa: ${sellingPrice(r, ingredients).toFixed(2)} UYU.`,
            ]
              .filter(Boolean)
              .join(" "),
            estimatedCost: totalEstimatedCost,
            estimatedProfit,
            recipeId: r.id,
            quantity: qty,
            channel: saleInfo.channel || "Otro",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        const [ingredientSnap, movementSnap] = await Promise.all([
          getDocs(query(collection(db, "users", user.uid, "ingredients"))),
          getDocs(
            query(
              collection(db, "users", user.uid, "movements"),
              orderBy("createdAt", "desc"),
            ),
          ),
        ]);
        setIngredients(
          ingredientSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        );
        setMovements(movementSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
      notify(
        "Venta registrada; ingredientes y movimiento financiero actualizados en una sola operación.",
      );
      return true;
    } catch (e) {
      notify("La venta no se completó y no se descontó stock: " + e.message);
      return false;
    }
  }
  async function logout() {
    if (user && auth) await signOut(auth);
    setDemo(false);
    setParties([]);
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
  if (!isDemo && !user)
    return (
      <Auth
        onDemo={() => {
          setMovements([]);
          setIngredients([]);
          setRecipes([]);
          setParties([]);
          setDemo(true);
        }}
      />
    );
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
        onAdd={() => {
          setRecipeToEdit(null);
          setModal("recipe");
        }}
        onEdit={(recipe) => {
          setRecipeToEdit(recipe);
          setModal("recipe");
        }}
        onDelete={deleteRecipe}
        onSell={sellRecipe}
        parties={parties}
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
            <div className="topbar-date">
              {new Intl.DateTimeFormat("es-UY", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date())}
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
        <MovementModal
          onClose={() => setModal("")}
          onSave={addMovement}
          ingredients={ingredients}
          parties={parties}
        />
      )}
      {(modal === "recipe" || modal === "ingredient") && (
        <RecordModal
          kind={modal}
          ingredients={ingredients}
          onClose={() => setModal("")}
          onSave={
            modal === "recipe"
              ? recipeToEdit
                ? updateRecipe
                : addRecipe
              : addIngredient
          }
          initialData={modal === "recipe" ? recipeToEdit : null}
          userId={user?.uid || ""}
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
