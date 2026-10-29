import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, firebaseConfigured } from "../firebase";

export async function listRecords(uid, type) {
  if (!firebaseConfigured) return null;
  const q = query(
    collection(db, "users", uid, type),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function saveRecord(uid, type, data) {
  if (!firebaseConfigured)
    throw new Error(
      "Firebase no está configurado. Copiá .env.example a .env.local y completá las credenciales.",
    );
  return addDoc(collection(db, "users", uid, type), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
export async function patchRecord(uid, type, id, data) {
  if (!firebaseConfigured) throw new Error("Firebase no está configurado.");
  return updateDoc(doc(db, "users", uid, type, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
export async function removeRecord(uid, type, id) {
  if (!firebaseConfigured) throw new Error("Firebase no está configurado.");
  return deleteDoc(doc(db, "users", uid, type, id));
}
