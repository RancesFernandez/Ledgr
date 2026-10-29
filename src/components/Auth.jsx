import React, { useState } from "react";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Activity, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { auth, firebaseConfigured } from "../firebase";
export default function Auth({ onDemo }) {
  const [mode, setMode] = useState("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!firebaseConfigured) {
      setMessage(
        "Firebase aún no está configurado. Podés entrar en modo de demostración.",
      );
      return;
    }
    setBusy(true);
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setMessage(
          "Te enviamos un correo con los pasos para restablecer tu contraseña.",
        );
      } else if (mode === "register") {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        if (name) await updateProfile(cred.user, { displayName: name });
      } else await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setMessage(
        err.code === "auth/invalid-credential"
          ? "Correo o contraseña incorrectos."
          : err.code === "auth/email-already-in-use"
            ? "Ese correo ya tiene una cuenta."
            : err.code === "auth/weak-password"
              ? "Usá una contraseña de al menos 6 caracteres."
              : err.message,
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-screen">
      <div className="auth-left">
        <div className="brand auth-brand">
          <div className="brand-mark">
            <Activity size={21} />
          </div>
          <div>
            <b>Ledgr</b>
            <small>GESTIÓN DE FINANZAS</small>
          </div>
        </div>
        <div className="auth-hero">
          <p className="eyebrow">MENOS CUENTAS A MANO. MÁS CLARIDAD.</p>
          <h1>
            Que tu pasión
            <br />
            también <em>rinda.</em>
          </h1>
          <p>
            Finanzas, recetas y stock en un solo lugar. Pensado para quienes
            convierten buenos ingredientes en grandes momentos.
          </p>
          <div className="auth-quote">
            <span>“</span>
            <div>
              <p>
                Conocer el costo real de cada receta cambia la forma en que
                hacés crecer tu negocio.
              </p>
              <small>LEDGR · FINANZAS</small>
            </div>
          </div>
        </div>
        <div className="auth-footer">
          Un producto para negocios que hacen las cosas con cariño.
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <div className="brand-mark">
              <Activity size={21} />
            </div>
            <b>Ledgr</b>
          </div>
          <p className="eyebrow">
            {mode === "login"
              ? "BIENVENIDA/O DE NUEVO"
              : mode === "register"
                ? "TU NEGOCIO EMPIEZA ACÁ"
                : "RECUPERÁ EL ACCESO"}
          </p>
          <h2>
            {mode === "login"
              ? "Ingresá a tu espacio"
              : mode === "register"
                ? "Creá tu cuenta"
                : "Restablecer contraseña"}
          </h2>
          <p className="muted">
            {mode === "reset"
              ? "Te enviaremos un enlace a tu correo."
              : "Tus números ordenados, sin complicaciones."}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Nombre del negocio o responsable
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Esmeralda Sweet"
                />
              </label>
            )}
            <label>
              Correo electrónico
              <div className="input-with-icon">
                <Mail size={17} />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vos@tupasteleria.com"
                />
              </div>
            </label>
            {mode !== "reset" && (
              <label>
                Contraseña
                <div className="input-with-icon">
                  <LockKeyhole size={17} />
                  <input
                    required
                    minLength="6"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </label>
            )}
            {mode === "login" && (
              <button
                type="button"
                className="forgot-link"
                onClick={() => {
                  setMode("reset");
                  setMessage("");
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
            {message && <div className="auth-message">{message}</div>}
            <button disabled={busy} className="btn-primary auth-submit">
              {busy
                ? "Procesando…"
                : mode === "login"
                  ? "Ingresar a mi cuenta"
                  : mode === "register"
                    ? "Crear cuenta"
                    : "Enviar enlace de recuperación"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? (
              <>
                ¿Primera vez por acá?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setMessage("");
                  }}
                >
                  Crear cuenta
                </button>
              </>
            ) : (
              <>
                ¿Ya tenés cuenta?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>
          <div className="demo-separator">
            <span /> o <span />
          </div>
          <button className="btn-secondary demo-button" onClick={onDemo}>
            Explorar vista de demostración
          </button>
          <p className="security-note">
            <LockKeyhole size={13} /> Tu contraseña está protegida por Firebase
            Authentication. Nunca queda visible para el administrador.
          </p>
        </div>
      </div>
    </main>
  );
}
