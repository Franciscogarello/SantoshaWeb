import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Check,
  X,
  LogOut,
  CalendarClock,
  Save,
  CalendarX2,
  Trash2,
  Plus,
  MessageCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const diasSemana = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
];

function PanelProfesional({ usuario, onLogout }) {
  const [profesional, setProfesional] = useState(null);

  const [solicitudes, setSolicitudes] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [ausencias, setAusencias] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [guardandoHorarios, setGuardandoHorarios] = useState(false);
  const [guardandoAusencia, setGuardandoAusencia] = useState(false);
  const [eliminandoAusenciaId, setEliminandoAusenciaId] =
    useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [seccion, setSeccion] = useState("turnos");
  const [periodo, setPeriodo] = useState("proximos");
  const [filtro, setFiltro] = useState("pendiente");

  const [fechaAusencia, setFechaAusencia] = useState("");
  const [motivoAusencia, setMotivoAusencia] = useState("");

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  const cargarDatos = async () => {
    setCargando(true);
    setError("");

    const { data: cuenta, error: cuentaError } = await supabase
      .from("cuentas_profesionales")
      .select(`
        profesional_id,
        profesionales (
          id,
          nombre,
          especialidad
        )
      `)
      .eq("user_id", usuario.id)
      .single();

    if (cuentaError) {
      console.error("Error cargando cuenta:", cuentaError);
      setError("No pudimos identificar al profesional.");
      setCargando(false);
      return;
    }

    setProfesional(cuenta.profesionales);

    // =========================================================
    // TURNOS
    // =========================================================

    const { data: turnos, error: turnosError } = await supabase
      .from("solicitudes_turnos")
      .select(`
        id,
        fecha,
        hora,
        nombre_paciente,
        telefono,
        estado,
        created_at
      `)
      .eq("profesional_id", cuenta.profesional_id)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });

    if (turnosError) {
      console.error("Error cargando turnos:", turnosError);
      setError("No pudimos cargar las solicitudes.");
      setCargando(false);
      return;
    }

    setSolicitudes(turnos ?? []);

    // =========================================================
    // DISPONIBILIDAD
    // =========================================================

    const {
      data: disponibilidad,
      error: disponibilidadError,
    } = await supabase
      .from("disponibilidad")
      .select(`
        dia_semana,
        hora_inicio,
        hora_fin,
        activo
      `)
      .eq("profesional_id", cuenta.profesional_id)
      .order("dia_semana", { ascending: true });

    if (disponibilidadError) {
      console.error(
        "Error cargando disponibilidad:",
        disponibilidadError
      );

      setError("No pudimos cargar tus horarios.");
      setCargando(false);
      return;
    }

    const horariosFormateados = diasSemana.map((dia) => {
      const encontrado = disponibilidad?.find(
        (item) => item.dia_semana === dia.id
      );

      return {
        dia_semana: dia.id,
        nombre: dia.nombre,
        activo: encontrado?.activo ?? false,
        hora_inicio:
          encontrado?.hora_inicio?.slice(0, 5) ?? "09:00",
        hora_fin:
          encontrado?.hora_fin?.slice(0, 5) ?? "18:00",
      };
    });

    setHorarios(horariosFormateados);

    // =========================================================
    // AUSENCIAS
    // =========================================================

    const { data: ausenciasData, error: ausenciasError } =
      await supabase
        .from("ausencias_profesionales")
        .select(`
          id,
          fecha,
          motivo,
          created_at
        `)
        .eq("profesional_id", cuenta.profesional_id)
        .order("fecha", { ascending: true });

    if (ausenciasError) {
      console.error("Error cargando ausencias:", ausenciasError);
      setError("No pudimos cargar las ausencias.");
      setCargando(false);
      return;
    }

    setAusencias(ausenciasData ?? []);

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // =========================================================
  // CONFIRMAR TURNO
  // =========================================================

  const confirmarTurno = async (solicitudId) => {
    setProcesandoId(solicitudId);
    setError("");
    setMensaje("");

    const { error } = await supabase.rpc("confirmar_turno", {
      p_solicitud_id: solicitudId,
    });

    if (error) {
      console.error("Error confirmando turno:", error);

      if (
        error.message?.includes(
          "un_turno_activo_por_consultorio"
        )
      ) {
        setError(
          "Ese horario ya está ocupado en el consultorio."
        );
      } else {
        setError("No pudimos confirmar el turno.");
      }

      setProcesandoId(null);
      return;
    }

    setMensaje("Turno confirmado correctamente.");
    await cargarDatos();
    setProcesandoId(null);
  };

  // =========================================================
  // RECHAZAR TURNO
  // =========================================================

  const rechazarTurno = async (solicitudId) => {
    setProcesandoId(solicitudId);
    setError("");
    setMensaje("");

    const { error } = await supabase.rpc("rechazar_turno", {
      p_solicitud_id: solicitudId,
    });

    if (error) {
      console.error("Error rechazando turno:", error);
      setError("No pudimos rechazar el turno.");
      setProcesandoId(null);
      return;
    }

    setMensaje("Solicitud rechazada.");
    await cargarDatos();
    setProcesandoId(null);
  };

  // =========================================================
  // HORARIOS
  // =========================================================

  const cambiarHorario = (diaSemana, campo, valor) => {
    setHorarios((actuales) =>
      actuales.map((dia) =>
        dia.dia_semana === diaSemana
          ? {
              ...dia,
              [campo]: valor,
            }
          : dia
      )
    );
  };

  const guardarHorarios = async () => {
    setGuardandoHorarios(true);
    setError("");
    setMensaje("");

    try {
      for (const dia of horarios) {
        if (
          dia.activo &&
          (!dia.hora_inicio || !dia.hora_fin)
        ) {
          throw new Error(
            `Completá el horario de ${dia.nombre}.`
          );
        }

        if (
          dia.activo &&
          dia.hora_fin <= dia.hora_inicio
        ) {
          throw new Error(
            `En ${dia.nombre}, la hora de finalización debe ser posterior a la hora de inicio.`
          );
        }

        const { error } = await supabase.rpc(
          "actualizar_mi_disponibilidad",
          {
            p_dia_semana: dia.dia_semana,
            p_hora_inicio: dia.hora_inicio,
            p_hora_fin: dia.hora_fin,
            p_activo: dia.activo,
          }
        );

        if (error) {
          throw error;
        }
      }

      setMensaje("Horarios guardados correctamente ✅");
      await cargarDatos();
    } catch (error) {
      console.error("Error guardando horarios:", error);

      setError(
        error.message ||
          "No pudimos guardar tus horarios."
      );
    } finally {
      setGuardandoHorarios(false);
    }
  };

  // =========================================================
  // AUSENCIAS
  // =========================================================

  const agregarAusencia = async () => {
    setError("");
    setMensaje("");

    if (!fechaAusencia) {
      setError("Elegí una fecha para bloquear.");
      return;
    }

    setGuardandoAusencia(true);

    const { error } = await supabase.rpc(
      "agregar_mi_ausencia",
      {
        p_fecha: fechaAusencia,
        p_motivo: motivoAusencia || null,
      }
    );

    if (error) {
      console.error("Error agregando ausencia:", error);

      setError(
        error.message ||
          "No pudimos bloquear esa fecha."
      );

      setGuardandoAusencia(false);
      return;
    }

    setFechaAusencia("");
    setMotivoAusencia("");

    setMensaje("Día bloqueado correctamente ✅");

    await cargarDatos();

    setGuardandoAusencia(false);
  };

  const eliminarAusencia = async (ausenciaId) => {
    setError("");
    setMensaje("");
    setEliminandoAusenciaId(ausenciaId);

    const { error } = await supabase.rpc(
      "eliminar_mi_ausencia",
      {
        p_ausencia_id: ausenciaId,
      }
    );

    if (error) {
      console.error("Error eliminando ausencia:", error);

      setError("No pudimos eliminar el bloqueo.");

      setEliminandoAusenciaId(null);
      return;
    }

    setMensaje("El día volvió a quedar disponible.");

    await cargarDatos();

    setEliminandoAusenciaId(null);
  };

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  const cerrarSesion = async () => {
    await supabase.auth.signOut();

    if (onLogout) {
      onLogout();
    }
  };

  // =========================================================
  // FORMATO
  // =========================================================

  const formatearFecha = (fecha) => {
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  const formatearHora = (hora) => {
    return hora.slice(0, 5);
  };
  const abrirWhatsApp = (solicitud) => {
  let numero = solicitud.telefono.replace(/\D/g, "");

  // Si ingresaron un número argentino sin código de país
  if (!numero.startsWith("54")) {
    numero = `54${numero}`;
  }

  const mensaje =
    `Hola ${solicitud.nombre_paciente}, soy ${profesional?.nombre} de Santosha. ` +
    `Te contacto por tu turno del ${formatearFecha(solicitud.fecha)} ` +
    `a las ${formatearHora(solicitud.hora)} hs.`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  // =========================================================
  // FILTROS
  // =========================================================

  const obtenerFechaHoraTurno = (solicitud) => {
    const [anio, mes, dia] = solicitud.fecha.split("-").map(Number);
    const [hora, minutos] = solicitud.hora.split(":").map(Number);

    return new Date(anio, mes - 1, dia, hora, minutos || 0, 0, 0);
  };

  const ahora = new Date();

  const proximos = solicitudes
    .filter((solicitud) => obtenerFechaHoraTurno(solicitud) >= ahora)
    .sort(
      (a, b) =>
        obtenerFechaHoraTurno(a) - obtenerFechaHoraTurno(b)
    );

  const pasados = solicitudes
    .filter((solicitud) => obtenerFechaHoraTurno(solicitud) < ahora)
    .sort(
      (a, b) =>
        obtenerFechaHoraTurno(b) - obtenerFechaHoraTurno(a)
    );

  const solicitudesDelPeriodo =
    periodo === "proximos" ? proximos : pasados;

  const pendientes = solicitudesDelPeriodo.filter(
    (solicitud) => solicitud.estado === "pendiente"
  );

  const confirmados = solicitudesDelPeriodo.filter(
    (solicitud) => solicitud.estado === "confirmado"
  );

  const rechazados = solicitudesDelPeriodo.filter(
    (solicitud) => solicitud.estado === "rechazado"
  );

  const solicitudesFiltradas = solicitudesDelPeriodo.filter(
    (solicitud) => solicitud.estado === filtro
  );

  const periodos = [
    { id: "proximos", label: "Próximos", cantidad: proximos.length },
    { id: "pasados", label: "Pasados", cantidad: pasados.length },
  ];

  const filtros = [
    {
      id: "pendiente",
      label: "Pendientes",
      cantidad: pendientes.length,
    },
    {
      id: "confirmado",
      label: "Confirmados",
      cantidad: confirmados.length,
    },
    {
      id: "rechazado",
      label: "Rechazados",
      cantidad: rechazados.length,
    },
  ];

  // =========================================================
  // PANTALLA
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--cream)] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--sage)]">
              Santosha
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">
              Panel profesional
            </h1>

            {profesional && (
              <div className="mt-3">
                <p className="text-lg font-medium text-[var(--text)]">
                  {profesional.nombre}
                </p>

                <p className="text-gray-500">
                  {profesional.especialidad}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            className="
              inline-flex w-fit items-center gap-2
              rounded-full border border-gray-200
              bg-white px-5 py-2.5
              font-medium text-gray-600
              transition hover:bg-gray-50
            "
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>

        {/* MENSAJES */}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 px-5 py-4 text-red-600">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mt-8 rounded-2xl bg-green-50 px-5 py-4 text-green-700">
            {mensaje}
          </div>
        )}

        {/* NAVEGACIÓN */}

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSeccion("turnos")}
            className={`
              inline-flex items-center gap-2
              rounded-full px-6 py-3
              font-medium transition-all duration-300
              ${
                seccion === "turnos"
                  ? "bg-[var(--sage-dark)] text-white shadow-md"
                  : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
              }
            `}
          >
            <CalendarDays size={18} />
            Turnos
          </button>

          <button
            type="button"
            onClick={() => setSeccion("horarios")}
            className={`
              inline-flex items-center gap-2
              rounded-full px-6 py-3
              font-medium transition-all duration-300
              ${
                seccion === "horarios"
                  ? "bg-[var(--sage-dark)] text-white shadow-md"
                  : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
              }
            `}
          >
            <CalendarClock size={18} />
            Mis horarios
          </button>

          <button
            type="button"
            onClick={() => setSeccion("ausencias")}
            className={`
              inline-flex items-center gap-2
              rounded-full px-6 py-3
              font-medium transition-all duration-300
              ${
                seccion === "ausencias"
                  ? "bg-[var(--sage-dark)] text-white shadow-md"
                  : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
              }
            `}
          >
            <CalendarX2 size={18} />
            Ausencias
          </button>
        </div>

        {cargando ? (
          <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
            <p className="text-gray-500">
              Cargando información...
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                TURNOS
            ================================================= */}

            {seccion === "turnos" && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-[var(--text)]">
                  Solicitudes de turnos
                </h2>

                <p className="mt-2 text-gray-500">
                  Administrá las solicitudes recibidas.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {periodos.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPeriodo(item.id)}
                      className={`
                        inline-flex items-center gap-2
                        rounded-full px-5 py-2.5
                        font-medium transition-all duration-300
                        ${
                          periodo === item.id
                            ? "bg-[var(--sage-dark)] text-white shadow-md"
                            : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
                        }
                      `}
                    >
                      {item.label}

                      <span
                        className={`
                          flex min-w-6 items-center justify-center
                          rounded-full px-2 py-0.5 text-xs
                          ${
                            periodo === item.id
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                      >
                        {item.cantidad}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {filtros.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFiltro(item.id)}
                      className={`
                        inline-flex items-center gap-2
                        rounded-full px-5 py-2.5
                        font-medium transition-all duration-300
                        ${
                          filtro === item.id
                            ? "bg-[var(--sage-dark)] text-white shadow-md"
                            : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
                        }
                      `}
                    >
                      {item.label}

                      <span
                        className={`
                          flex min-w-6 items-center justify-center
                          rounded-full px-2 py-0.5 text-xs
                          ${
                            filtro === item.id
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                      >
                        {item.cantidad}
                      </span>
                    </button>
                  ))}
                </div>

                {solicitudesFiltradas.length === 0 ? (
                  <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
                    <p className="text-gray-500">
                      {filtro === "pendiente" &&
                        `No tenés solicitudes pendientes ${
                          periodo === "proximos" ? "próximas" : "pasadas"
                        }.`}

                      {filtro === "confirmado" &&
                        `No tenés turnos confirmados ${
                          periodo === "proximos" ? "próximos" : "pasados"
                        }.`}

                      {filtro === "rechazado" &&
                        `No tenés solicitudes rechazadas ${
                          periodo === "proximos" ? "próximas" : "pasadas"
                        }.`}
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-4">
                    {solicitudesFiltradas.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className="
                          rounded-[28px]
                          border border-black/5
                          bg-white p-6 shadow-sm
                        "
                      >
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-semibold text-[var(--text)]">
                                {solicitud.nombre_paciente}
                              </h3>

                              <span
                                className={`
                                  rounded-full px-3 py-1
                                  text-xs font-semibold uppercase
                                  ${
                                    solicitud.estado === "pendiente"
                                      ? "bg-amber-50 text-amber-700"
                                      : ""
                                  }
                                  ${
                                    solicitud.estado === "confirmado"
                                      ? "bg-green-50 text-green-700"
                                      : ""
                                  }
                                  ${
                                    solicitud.estado === "rechazado"
                                      ? "bg-red-50 text-red-600"
                                      : ""
                                  }
                                `}
                              >
                                {solicitud.estado}
                              </span>
                            </div>

                            <div className="mt-5 grid gap-3 text-gray-600 sm:grid-cols-2">
                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={18}
                                  className="text-[var(--sage)]"
                                />
                                {formatearFecha(solicitud.fecha)}
                              </div>

                              <div className="flex items-center gap-2">
                                <Clock
                                  size={18}
                                  className="text-[var(--sage)]"
                                />
                                {formatearHora(solicitud.hora)}
                              </div>

                              <div className="flex items-center gap-2">
                                <User
                                  size={18}
                                  className="text-[var(--sage)]"
                                />
                                {solicitud.nombre_paciente}
                              </div>

                              <div className="flex items-center gap-2">
                                <Phone
                                  size={18}
                                  className="text-[var(--sage)]"
                                />
                                {solicitud.telefono}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {/* WHATSAPP */}
                            {solicitud.estado !== "rechazado" && (
                              <button
                                type="button"
                                onClick={() => abrirWhatsApp(solicitud)}
                                className="
                                  inline-flex items-center gap-2
                                  rounded-full
                                  border border-green-200
                                  bg-green-50
                                  px-5 py-3
                                  font-semibold text-green-700
                                  transition
                                  hover:-translate-y-0.5
                                  hover:bg-green-100
                                "
                              >
                                <MessageCircle size={18} />
                                WhatsApp
                              </button>
                            )}

                            {/* CONFIRMAR / RECHAZAR */}
                            {solicitud.estado === "pendiente" && (
                              <>
                                <button
                                  type="button"
                                  disabled={procesandoId === solicitud.id}
                                  onClick={() => confirmarTurno(solicitud.id)}
                                  className="
                                    inline-flex items-center gap-2
                                    rounded-full
                                    bg-[var(--sage-dark)]
                                    px-5 py-3
                                    font-semibold text-white
                                    transition
                                    hover:-translate-y-0.5
                                    hover:shadow-md
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  <Check size={18} />
                                  {procesandoId === solicitud.id
                                    ? "Procesando..."
                                    : "Confirmar"}
                                </button>

                                <button
                                  type="button"
                                  disabled={procesandoId === solicitud.id}
                                  onClick={() => rechazarTurno(solicitud.id)}
                                  className="
                                    inline-flex items-center gap-2
                                    rounded-full
                                    border border-red-200
                                    px-5 py-3
                                    font-semibold text-red-600
                                    transition
                                    hover:bg-red-50
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  <X size={18} />
                                  Rechazar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                HORARIOS
            ================================================= */}

            {seccion === "horarios" && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-[var(--text)]">
                  Mis horarios
                </h2>

                <p className="mt-2 max-w-2xl text-gray-500">
                  Elegí los días y horarios en los que atendés.
                  Los cambios se reflejarán automáticamente en
                  el turnero.
                </p>

                <div className="mt-8 space-y-4">
                  {horarios.map((dia) => (
                    <div
                      key={dia.dia_semana}
                      className="
                        rounded-[28px]
                        border border-black/5
                        bg-white p-6 shadow-sm
                      "
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              cambiarHorario(
                                dia.dia_semana,
                                "activo",
                                !dia.activo
                              )
                            }
                            className={`
                              relative h-7 w-12
                              rounded-full
                              transition-colors duration-300
                              ${
                                dia.activo
                                  ? "bg-[var(--sage-dark)]"
                                  : "bg-gray-200"
                              }
                            `}
                          >
                            <span
                              className={`
                                absolute top-1 h-5 w-5
                                rounded-full bg-white
                                shadow-sm
                                transition-all duration-300
                                ${
                                  dia.activo
                                    ? "left-6"
                                    : "left-1"
                                }
                              `}
                            />
                          </button>

                          <div>
                            <p className="text-lg font-semibold text-[var(--text)]">
                              {dia.nombre}
                            </p>

                            <p className="mt-1 text-sm text-gray-400">
                              {dia.activo
                                ? "Atendés este día"
                                : "No atendés este día"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-500">
                              Desde
                            </label>

                            <input
                              type="time"
                              value={dia.hora_inicio}
                              disabled={!dia.activo}
                              onChange={(e) =>
                                cambiarHorario(
                                  dia.dia_semana,
                                  "hora_inicio",
                                  e.target.value
                                )
                              }
                              className="
                                rounded-xl
                                border border-gray-200
                                bg-white px-4 py-2.5
                                outline-none
                                transition
                                focus:border-[var(--sage)]
                                disabled:cursor-not-allowed
                                disabled:bg-gray-100
                                disabled:text-gray-400
                              "
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-500">
                              Hasta
                            </label>

                            <input
                              type="time"
                              value={dia.hora_fin}
                              disabled={!dia.activo}
                              onChange={(e) =>
                                cambiarHorario(
                                  dia.dia_semana,
                                  "hora_fin",
                                  e.target.value
                                )
                              }
                              className="
                                rounded-xl
                                border border-gray-200
                                bg-white px-4 py-2.5
                                outline-none
                                transition
                                focus:border-[var(--sage)]
                                disabled:cursor-not-allowed
                                disabled:bg-gray-100
                                disabled:text-gray-400
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex justify-end">
                  <button
                    type="button"
                    onClick={guardarHorarios}
                    disabled={guardandoHorarios}
                    className="
                      inline-flex items-center gap-2
                      rounded-full
                      bg-[var(--sage-dark)]
                      px-7 py-3.5
                      font-semibold text-white
                      shadow-md
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-lg
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <Save size={18} />

                    {guardandoHorarios
                      ? "Guardando..."
                      : "Guardar horarios"}
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                AUSENCIAS
            ================================================= */}

            {seccion === "ausencias" && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-[var(--text)]">
                  Ausencias
                </h2>

                <p className="mt-2 max-w-2xl text-gray-500">
                  Bloqueá fechas puntuales en las que no vas a
                  atender, sin modificar tus horarios semanales.
                </p>

                {/* FORMULARIO */}

                <div className="mt-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    Bloquear un día
                  </h3>

                  <div className="mt-5 grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-500">
                        Fecha
                      </label>

                      <input
                        type="date"
                        min={obtenerFechaMinima()}
                        value={fechaAusencia}
                        onChange={(e) =>
                          setFechaAusencia(e.target.value)
                        }
                        className="
                          w-full rounded-xl
                          border border-gray-200
                          bg-white px-4 py-3
                          outline-none
                          transition
                          focus:border-[var(--sage)]
                        "
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-500">
                        Motivo
                        <span className="ml-1 text-gray-400">
                          (opcional)
                        </span>
                      </label>

                      <input
                        type="text"
                        value={motivoAusencia}
                        onChange={(e) =>
                          setMotivoAusencia(e.target.value)
                        }
                        placeholder="Ej: Vacaciones"
                        className="
                          w-full rounded-xl
                          border border-gray-200
                          bg-white px-4 py-3
                          outline-none
                          transition
                          focus:border-[var(--sage)]
                        "
                      />
                    </div>

                    <button
                      type="button"
                      onClick={agregarAusencia}
                      disabled={guardandoAusencia}
                      className="
                        inline-flex items-center justify-center gap-2
                        rounded-full
                        bg-[var(--sage-dark)]
                        px-6 py-3
                        font-semibold text-white
                        shadow-sm
                        transition
                        hover:-translate-y-0.5
                        hover:shadow-md
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <Plus size={18} />

                      {guardandoAusencia
                        ? "Guardando..."
                        : "Bloquear día"}
                    </button>
                  </div>
                </div>

                {/* LISTADO */}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    Días bloqueados
                  </h3>

                  {ausencias.length === 0 ? (
                    <div className="mt-4 rounded-[28px] bg-white p-8 shadow-sm">
                      <p className="text-gray-500">
                        No tenés días bloqueados.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {ausencias.map((ausencia) => (
                        <div
                          key={ausencia.id}
                          className="
                            flex flex-col gap-5
                            rounded-[28px]
                            border border-black/5
                            bg-white p-6
                            shadow-sm
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >
                          <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
                              <CalendarX2 size={22} />
                            </div>

                            <div>
                              <p className="text-lg font-semibold text-[var(--text)]">
                                {formatearFecha(ausencia.fecha)}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {ausencia.motivo
                                  ? ausencia.motivo
                                  : "Sin motivo especificado"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarAusencia(ausencia.id)
                            }
                            disabled={
                              eliminandoAusenciaId === ausencia.id
                            }
                            className="
                              inline-flex w-fit items-center gap-2
                              rounded-full
                              border border-red-200
                              px-5 py-2.5
                              font-medium text-red-600
                              transition
                              hover:bg-red-50
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            <Trash2 size={17} />

                            {eliminandoAusenciaId === ausencia.id
                              ? "Eliminando..."
                              : "Eliminar bloqueo"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PanelProfesional;
