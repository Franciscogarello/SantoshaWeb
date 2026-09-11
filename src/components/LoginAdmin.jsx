import { useState } from "react";
import { supabase } from "../lib/supabase";

function LoginAdmin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError("Email o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("cuentas_admin")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      setError("Esta cuenta no tiene permisos de administrador.");
      setCargando(false);
      return;
    }

    onLogin(data.user);
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--sage)]">
          Santosha
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">
          Administración
        </h1>

        <p className="mt-2 text-gray-500">
          Ingresá con tu cuenta de administrador.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={iniciarSesion} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full rounded-xl
                border border-gray-200
                px-4 py-3
                outline-none transition
                focus:border-[var(--sage)]
              "
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-500">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full rounded-xl
                border border-gray-200
                px-4 py-3
                outline-none transition
                focus:border-[var(--sage)]
              "
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="
              w-full rounded-full
              bg-[var(--sage-dark)]
              px-6 py-3.5
              font-semibold text-white
              transition
              hover:-translate-y-0.5
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginAdmin;