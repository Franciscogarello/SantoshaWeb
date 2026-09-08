import { useState } from "react";
import { LockKeyhole, Mail, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";

function LoginProfesional({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setCargando(true);
    setError("");

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      console.error("Error login:", loginError);
      setError("Email o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    setCargando(false);

    if (onLogin) {
      onLogin(data.user);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-5">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl sm:p-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--sage)]">
            Santosha
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">
            Panel profesional
          </h1>

          <p className="mt-3 text-gray-500">
            Ingresá para administrar tus solicitudes de turnos.
          </p>
        </div>

        <form onSubmit={iniciarSesion} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 flex items-center gap-2 font-medium text-[var(--text)]">
              <Mail size={18} className="text-[var(--sage)]" />
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="
                w-full rounded-2xl border border-gray-200
                px-4 py-3 outline-none transition
                focus:border-[var(--sage)]
              "
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 font-medium text-[var(--text)]">
              <LockKeyhole size={18} className="text-[var(--sage)]" />
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="
                w-full rounded-2xl border border-gray-200
                px-4 py-3 outline-none transition
                focus:border-[var(--sage)]
              "
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="
              flex w-full items-center justify-center gap-2
              rounded-full bg-[var(--sage-dark)]
              px-6 py-4 font-semibold text-white
              shadow-md transition-all duration-300
              hover:-translate-y-1 hover:shadow-lg
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            <LogIn size={19} />

            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginProfesional;