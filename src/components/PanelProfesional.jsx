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
  Building2,
  CheckCircle2,
  Wallet,
  ReceiptText,
  CircleDollarSign,
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
  const [reservas, setReservas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [ausencias, setAusencias] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [pagosPorLiquidacion, setPagosPorLiquidacion] = useState({});
  const [cargandoPagos, setCargandoPagos] = useState(false);

  const [filtroReservas, setFiltroReservas] = useState("proximas");
  const [liberandoReservaId, setLiberandoReservaId] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);
  const [guardandoHorarios, setGuardandoHorarios] = useState(false);
  const [guardandoAusencia, setGuardandoAusencia] = useState(false);
  const [eliminandoAusenciaId, setEliminandoAusenciaId] = useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [seccion, setSeccion] = useState("turnos");
  const [periodo, setPeriodo] = useState("proximos");
  const [filtro, setFiltro] = useState("pendiente");

  const [fechaAusencia, setFechaAusencia] = useState("");
  const [motivoAusencia, setMotivoAusencia] = useState("");

  // =========================================================
  // RESERVA DE CONSULTORIO
  // =========================================================

  const [fechaReserva, setFechaReserva] = useState("");
  const [motivoReserva, setMotivoReserva] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horariosSeleccionados, setHorariosSeleccionados] = useState([]);

  const [buscandoHorariosReserva, setBuscandoHorariosReserva] =
    useState(false);

  const [reservandoConsultorio, setReservandoConsultorio] =
    useState(false);

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
          especialidad,
          consultorio_id
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
        created_at,
        tipo_reserva,
        motivo_reserva,
        consultorio_id
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

    // No mostramos las reservas internas como si fueran pacientes
      const soloTurnosPacientes = (turnos ?? []).filter(
        (turno) => turno.tipo_reserva !== "profesional"
      );

      const soloReservasProfesionales = (turnos ?? []).filter(
        (turno) => turno.tipo_reserva === "profesional"
      );

      setSolicitudes(soloTurnosPacientes);
      setReservas(soloReservasProfesionales);

    // =========================================================
    // DISPONIBILIDAD
    // =========================================================

    const { data: disponibilidad, error: disponibilidadError } =
      await supabase
        .from("disponibilidad")
        .select(`
          dia_semana,
          hora_inicio,
          hora_fin,
          activo,
          duracion_minutos
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
        duracion_minutos: encontrado?.duracion_minutos ?? 60,
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

  // =========================================================
  // MIS HORAS / PAGOS
  // =========================================================

  const cargarLiquidaciones = async () => {
    setCargandoPagos(true);

    const { data, error } = await supabase.rpc(
      "obtener_mis_liquidaciones"
    );

    if (error) {
      console.error("Error cargando liquidaciones:", error);
      setError(
        error.message ||
          "No pudimos cargar tus liquidaciones."
      );
      setCargandoPagos(false);
      return;
    }

    const liquidacionesData = data ?? [];
    setLiquidaciones(liquidacionesData);

    const pagosEntries = await Promise.all(
      liquidacionesData.map(async (liquidacion) => {
        const { data: pagosData, error: pagosError } =
          await supabase.rpc("obtener_mis_pagos", {
            p_liquidacion_id: liquidacion.id,
          });

        if (pagosError) {
          console.error(
            `Error cargando pagos de liquidación ${liquidacion.id}:`,
            pagosError
          );

          return [liquidacion.id, []];
        }

        return [liquidacion.id, pagosData ?? []];
      })
    );

    setPagosPorLiquidacion(
      Object.fromEntries(pagosEntries)
    );

    setCargandoPagos(false);
  };

  useEffect(() => {
    cargarDatos();
    cargarLiquidaciones();
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
  // CANCELAR TURNO
  // =========================================================

  const cancelarTurno = async (solicitudId) => {
    setProcesandoId(solicitudId);
    setError("");
    setMensaje("");

    const { error } = await supabase.rpc("cancelar_turno", {
      p_solicitud_id: solicitudId,
    });

    if (error) {
      console.error("Error cancelando turno:", error);

      if (error.message?.includes("24 horas de anticipación")) {
        setError(
          "Este turno ya no puede cancelarse porque faltan 24 horas o menos."
        );
      } else {
        setError("No pudimos cancelar el turno.");
      }

      setProcesandoId(null);
      return;
    }

    setMensaje(
      "Turno cancelado correctamente. El horario volvió a quedar disponible."
    );

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
  // RESERVAR CONSULTORIO
  // =========================================================

  const generarHorarios = (
    horaInicio,
    horaFin,
    duracionMinutos = 60
  ) => {
    const resultado = [];

    const [horaInicioNumero, minutoInicioNumero] = horaInicio
      .split(":")
      .map(Number);

    const [horaFinNumero, minutoFinNumero] = horaFin
      .split(":")
      .map(Number);

    let minutosActuales =
      horaInicioNumero * 60 + minutoInicioNumero;

    const minutosFinales =
      horaFinNumero * 60 + minutoFinNumero;

    while (minutosActuales < minutosFinales) {
      const hora = Math.floor(minutosActuales / 60);
      const minutos = minutosActuales % 60;

      resultado.push(
        `${String(hora).padStart(2, "0")}:${String(
          minutos
        ).padStart(2, "0")}`
      );

      minutosActuales += duracionMinutos;
    }

    return resultado;
  };

  const buscarHorariosReserva = async (fecha) => {
    setFechaReserva(fecha);
    setHorariosSeleccionados([]);
    setHorariosDisponibles([]);
    setError("");
    setMensaje("");

    if (!fecha || !profesional) {
      return;
    }

    setBuscandoHorariosReserva(true);

    try {
      const fechaSeleccionada = new Date(
        `${fecha}T12:00:00`
      );

      const diaJS = fechaSeleccionada.getDay();

      // JS:
      // Domingo 0
      // Lunes 1
      // ...
      // Sábado 6

      if (diaJS === 0 || diaJS === 6) {
        setHorariosDisponibles([]);
        return;
      }

      const horarioDia = horarios.find(
        (dia) => dia.dia_semana === diaJS
      );

      if (!horarioDia || !horarioDia.activo) {
        setHorariosDisponibles([]);
        return;
      }

      // Revisar si el profesional bloqueó ese día
      const { data: ausente, error: ausenciaError } =
        await supabase.rpc("profesional_ausente", {
          p_profesional_id: profesional.id,
          p_fecha: fecha,
        });

      if (ausenciaError) {
        throw ausenciaError;
      }

      if (ausente) {
        setHorariosDisponibles([]);
        setError(
          "Tenés esta fecha bloqueada como ausencia."
        );
        return;
      }

      // Consultar ocupación REAL del consultorio.
      // Incluye pacientes pendientes/confirmados y
      // reservas internas de otros profesionales.
      const { data: ocupados, error: ocupadosError } =
        await supabase.rpc("obtener_horarios_ocupados", {
          p_consultorio_id: profesional.consultorio_id,
          p_fecha: fecha,
        });

      if (ocupadosError) {
        throw ocupadosError;
      }

      const horariosOcupados = (ocupados ?? []).map(
        (item) => {
          if (typeof item === "string") {
            return item.slice(0, 5);
          }

          return item.hora?.slice(0, 5);
        }
      );

      const todosLosHorarios = generarHorarios(
        horarioDia.hora_inicio,
        horarioDia.hora_fin,
        horarioDia.duracion_minutos || 60
      );

      const disponibles = todosLosHorarios.filter(
        (hora) => !horariosOcupados.includes(hora)
      );

      setHorariosDisponibles(disponibles);
    } catch (error) {
      console.error(
        "Error buscando horarios del consultorio:",
        error
      );

      setError(
        "No pudimos consultar la disponibilidad del consultorio."
      );
    } finally {
      setBuscandoHorariosReserva(false);
    }
  };

  const alternarHorarioReserva = (hora) => {
    setHorariosSeleccionados((actuales) => {
      if (actuales.includes(hora)) {
        return actuales.filter((item) => item !== hora);
      }

      return [...actuales, hora].sort();
    });
  };

  const seleccionarTodosLosHorarios = () => {
    if (
      horariosSeleccionados.length ===
      horariosDisponibles.length
    ) {
      setHorariosSeleccionados([]);
    } else {
      setHorariosSeleccionados(horariosDisponibles);
    }
  };

  const reservarConsultorio = async () => {
    setError("");
    setMensaje("");

    if (!fechaReserva) {
      setError("Elegí una fecha.");
      return;
    }

    if (horariosSeleccionados.length === 0) {
      setError(
        "Seleccioná al menos un horario para reservar."
      );
      return;
    }

    setReservandoConsultorio(true);

    const { data, error } = await supabase.rpc(
      "reservar_mis_horarios",
      {
        p_fecha: fechaReserva,
        p_horas: horariosSeleccionados,
        p_motivo: motivoReserva || null,
      }
    );

    if (error) {
      console.error(
        "Error reservando consultorio:",
        error
      );

      if (
        error.message?.includes(
          "acaba de ser ocupado"
        )
      ) {
        setError(
          "Uno de los horarios seleccionados acaba de ser reservado. Actualizamos la disponibilidad."
        );

        await buscarHorariosReserva(fechaReserva);
      } else {
        setError(
          error.message ||
            "No pudimos realizar la reserva."
        );
      }

      setReservandoConsultorio(false);
      return;
    }

    const cantidadReservada =
      Number(data) || horariosSeleccionados.length;

    setMensaje(
      cantidadReservada === 1
        ? "Consultorio reservado correctamente ✅"
        : `${cantidadReservada} horarios reservados correctamente ✅`
    );

    setHorariosSeleccionados([]);
    setMotivoReserva("");

    await cargarDatos();
    await buscarHorariosReserva(fechaReserva);

    setReservandoConsultorio(false);
  };
// =========================================================
// LIBERAR RESERVA DE CONSULTORIO
// =========================================================

const liberarReserva = async (reservaId) => {
  const confirmar = window.confirm(
    "¿Querés liberar esta reserva? El horario volverá a quedar disponible."
  );

  if (!confirmar) return;

  setError("");
  setMensaje("");
  setLiberandoReservaId(reservaId);

  const { error } = await supabase.rpc("liberar_mi_reserva", {
    p_reserva_id: reservaId,
  });

  if (error) {
    console.error("Error liberando reserva:", error);

    setError(
      error.message ||
        "No pudimos liberar la reserva."
    );

    setLiberandoReservaId(null);
    return;
  }

  setMensaje(
    "Reserva liberada correctamente. El horario volvió a quedar disponible ✅"
  );

  await cargarDatos();

  if (fechaReserva) {
    await buscarHorariosReserva(fechaReserva);
  }

  setLiberandoReservaId(null);
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

  const formatearPesos = (valor) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(valor ?? 0));
  };

  const etiquetaEstadoPago = (estado) => {
    if (estado === "pagado") return "Pagado";
    if (estado === "parcial") return "Pago parcial";
    return "Pendiente";
  };

  const claseEstadoPago = (estado) => {
    if (estado === "pagado") {
      return "bg-green-50 text-green-700";
    }

    if (estado === "parcial") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-red-50 text-red-600";
  };

  const abrirWhatsApp = (solicitud) => {
    let numero = solicitud.telefono.replace(/\D/g, "");

    if (!numero.startsWith("54")) {
      numero = `54${numero}`;
    }

    const mensaje =
      `Hola ${solicitud.nombre_paciente}, soy ${profesional?.nombre} de Santosha. ` +
      `Te contacto por tu turno del ${formatearFecha(
        solicitud.fecha
      )} ` +
      `a las ${formatearHora(solicitud.hora)} hs.`;

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
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
    const [anio, mes, dia] = solicitud.fecha
      .split("-")
      .map(Number);

    const [hora, minutos] = solicitud.hora
      .split(":")
      .map(Number);

    return new Date(
      anio,
      mes - 1,
      dia,
      hora,
      minutos || 0,
      0,
      0
    );
  };

  const puedeCancelarTurno = (solicitud) => {
    const fechaHoraTurno =
      obtenerFechaHoraTurno(solicitud);

    const ahoraActual = new Date();

    const diferenciaMs =
      fechaHoraTurno.getTime() -
      ahoraActual.getTime();

    const veinticuatroHorasMs =
      24 * 60 * 60 * 1000;

    return diferenciaMs > veinticuatroHorasMs;
  };

  const ahora = new Date();

  const proximos = solicitudes
    .filter(
      (solicitud) =>
        obtenerFechaHoraTurno(solicitud) >= ahora
    )
    .sort(
      (a, b) =>
        obtenerFechaHoraTurno(a) -
        obtenerFechaHoraTurno(b)
    );

  const pasados = solicitudes
    .filter(
      (solicitud) =>
        obtenerFechaHoraTurno(solicitud) < ahora
    )
    .sort(
      (a, b) =>
        obtenerFechaHoraTurno(b) -
        obtenerFechaHoraTurno(a)
    );

  const solicitudesDelPeriodo =
    periodo === "proximos"
      ? proximos
      : pasados;

  const pendientes = solicitudesDelPeriodo.filter(
    (solicitud) =>
      solicitud.estado === "pendiente"
  );

  const confirmados = solicitudesDelPeriodo.filter(
    (solicitud) =>
      solicitud.estado === "confirmado"
  );

  const rechazados = solicitudesDelPeriodo.filter(
    (solicitud) =>
      solicitud.estado === "rechazado"
  );

  const cancelados = solicitudesDelPeriodo.filter(
    (solicitud) =>
      solicitud.estado === "cancelado"
  );

  const solicitudesFiltradas =
    solicitudesDelPeriodo.filter(
      (solicitud) =>
        solicitud.estado === filtro
    );

  const periodos = [
    {
      id: "proximos",
      label: "Próximos",
      cantidad: proximos.length,
    },
    {
      id: "pasados",
      label: "Pasados",
      cantidad: pasados.length,
    },
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
    {
      id: "cancelado",
      label: "Cancelados",
      cantidad: cancelados.length,
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
            onClick={() =>
              setSeccion("reservar")
            }
            className={`
              inline-flex items-center gap-2
              rounded-full px-6 py-3
              font-medium transition-all duration-300
              ${
                seccion === "reservar"
                  ? "bg-[var(--sage-dark)] text-white shadow-md"
                  : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
              }
            `}
          >
            <Building2 size={18} />
            Reservar consultorio
          </button>

          <button
            type="button"
            onClick={() => setSeccion("mis-reservas")}
            className={`
              inline-flex items-center gap-2
              rounded-full px-6 py-3
              font-medium transition-all duration-300
              ${
                seccion === "mis-reservas"
                  ? "bg-[var(--sage-dark)] text-white shadow-md"
                  : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
              }
            `}
          >
            <CalendarDays size={18} />
            Mis reservas
          </button>

          <button
            type="button"
            onClick={() => setSeccion("pagos")}
            className={`
              inline-flex items-center gap-2
              rounded-full px-6 py-3
              font-medium transition-all duration-300
              ${
                seccion === "pagos"
                  ? "bg-[var(--sage-dark)] text-white shadow-md"
                  : "border border-black/10 bg-white text-gray-600 hover:border-[var(--sage)]"
              }
            `}
          >
            <Wallet size={18} />
            Mis horas / Pagos
          </button>

          <button
            type="button"
            onClick={() =>
              setSeccion("horarios")
            }
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
            onClick={() =>
              setSeccion("ausencias")
            }
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
                      onClick={() =>
                        setPeriodo(item.id)
                      }
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
                      onClick={() =>
                        setFiltro(item.id)
                      }
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
                      No hay turnos para mostrar con este filtro.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-4">
                    {solicitudesFiltradas.map(
                      (solicitud) => (
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
                                      solicitud.estado ===
                                      "pendiente"
                                        ? "bg-amber-50 text-amber-700"
                                        : ""
                                    }
                                    ${
                                      solicitud.estado ===
                                      "confirmado"
                                        ? "bg-green-50 text-green-700"
                                        : ""
                                    }
                                    ${
                                      solicitud.estado ===
                                      "rechazado"
                                        ? "bg-red-50 text-red-600"
                                        : ""
                                    }
                                    ${
                                      solicitud.estado ===
                                      "cancelado"
                                        ? "bg-gray-100 text-gray-600"
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
                                  {formatearFecha(
                                    solicitud.fecha
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Clock
                                    size={18}
                                    className="text-[var(--sage)]"
                                  />
                                  {formatearHora(
                                    solicitud.hora
                                  )}
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

                              {solicitud.estado !==
                                "rechazado" &&
                                solicitud.estado !==
                                  "cancelado" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirWhatsApp(
                                        solicitud
                                      )
                                    }
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
                                    <MessageCircle
                                      size={18}
                                    />
                                    WhatsApp
                                  </button>
                                )}

                              {solicitud.estado ===
                                "pendiente" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      procesandoId ===
                                      solicitud.id
                                    }
                                    onClick={() =>
                                      confirmarTurno(
                                        solicitud.id
                                      )
                                    }
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
                                    Confirmar
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      procesandoId ===
                                      solicitud.id
                                    }
                                    onClick={() =>
                                      rechazarTurno(
                                        solicitud.id
                                      )
                                    }
                                    className="
                                      inline-flex items-center gap-2
                                      rounded-full
                                      border border-red-200
                                      px-5 py-3
                                      font-semibold text-red-600
                                      transition
                                      hover:bg-red-50
                                    "
                                  >
                                    <X size={18} />
                                    Rechazar
                                  </button>
                                </>
                              )}

                              {solicitud.estado ===
                                "confirmado" &&
                                puedeCancelarTurno(
                                  solicitud
                                ) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      cancelarTurno(
                                        solicitud.id
                                      )
                                    }
                                    className="
                                      inline-flex items-center gap-2
                                      rounded-full
                                      border border-red-200
                                      bg-red-50
                                      px-5 py-3
                                      font-semibold text-red-600
                                    "
                                  >
                                    <CalendarX2
                                      size={18}
                                    />
                                    Cancelar turno
                                  </button>
                                )}

                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                RESERVAR CONSULTORIO
            ================================================= */}

            {seccion === "reservar" && (
              <div className="mt-10">

                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
                    <Building2 size={26} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-[var(--text)]">
                      Reservar consultorio
                    </h2>

                    <p className="mt-2 max-w-2xl text-gray-500">
                      Elegí una fecha y reservá uno o varios
                      horarios disponibles para utilizar tu
                      consultorio.
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-500">
                        Fecha
                      </label>

                      <input
                        type="date"
                        min={obtenerFechaMinima()}
                        value={fechaReserva}
                        onChange={(e) =>
                          buscarHorariosReserva(
                            e.target.value
                          )
                        }
                        className="
                          w-full rounded-xl
                          border border-gray-200
                          bg-white px-4 py-3
                          outline-none transition
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
                        value={motivoReserva}
                        onChange={(e) =>
                          setMotivoReserva(
                            e.target.value
                          )
                        }
                        placeholder="Ej: Paciente particular"
                        className="
                          w-full rounded-xl
                          border border-gray-200
                          bg-white px-4 py-3
                          outline-none transition
                          focus:border-[var(--sage)]
                        "
                      />
                    </div>

                  </div>
                </div>

                {fechaReserva && (
                  <div className="mt-8">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text)]">
                          Horarios disponibles
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Los horarios ya ocupados por
                          pacientes o profesionales no se
                          muestran.
                        </p>
                      </div>

                      {horariosDisponibles.length >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            seleccionarTodosLosHorarios
                          }
                          className="
                            w-fit rounded-full
                            border border-black/10
                            bg-white px-4 py-2
                            text-sm font-medium
                            text-gray-600
                            transition
                            hover:border-[var(--sage)]
                          "
                        >
                          {horariosSeleccionados.length ===
                          horariosDisponibles.length
                            ? "Deseleccionar todos"
                            : "Seleccionar todos"}
                        </button>
                      )}

                    </div>

                    {buscandoHorariosReserva ? (
                      <div className="mt-5 rounded-[28px] bg-white p-8 shadow-sm">
                        <p className="text-gray-500">
                          Buscando horarios...
                        </p>
                      </div>
                    ) : horariosDisponibles.length ===
                      0 ? (
                      <div className="mt-5 rounded-[28px] bg-white p-8 shadow-sm">
                        <p className="text-gray-500">
                          No hay horarios disponibles para
                          esta fecha.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

                          {horariosDisponibles.map(
                            (hora) => {
                              const seleccionado =
                                horariosSeleccionados.includes(
                                  hora
                                );

                              return (
                                <button
                                  key={hora}
                                  type="button"
                                  onClick={() =>
                                    alternarHorarioReserva(
                                      hora
                                    )
                                  }
                                  className={`
                                    flex items-center
                                    justify-center gap-2
                                    rounded-2xl
                                    border px-4 py-4
                                    font-semibold
                                    transition-all duration-200
                                    ${
                                      seleccionado
                                        ? "border-[var(--sage-dark)] bg-[var(--sage-dark)] text-white shadow-md"
                                        : "border-black/10 bg-white text-[var(--text)] hover:border-[var(--sage)]"
                                    }
                                  `}
                                >
                                  {seleccionado ? (
                                    <CheckCircle2
                                      size={17}
                                    />
                                  ) : (
                                    <Clock size={17} />
                                  )}

                                  {hora}
                                </button>
                              );
                            }
                          )}

                        </div>

                        {horariosSeleccionados.length >
                          0 && (
                          <div className="mt-8 rounded-[28px] bg-[var(--sage-light)]/40 p-6">

                            <p className="font-semibold text-[var(--text)]">
                              Reserva
                            </p>

                            <p className="mt-2 text-sm text-gray-600">
                              {formatearFecha(
                                fechaReserva
                              )}{" "}
                              ·{" "}
                              {
                                horariosSeleccionados.length
                              }{" "}
                              {horariosSeleccionados.length ===
                              1
                                ? "hora seleccionada"
                                : "horas seleccionadas"}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">

                              {horariosSeleccionados.map(
                                (hora) => (
                                  <span
                                    key={hora}
                                    className="
                                      rounded-full bg-white
                                      px-4 py-2
                                      text-sm font-semibold
                                      text-[var(--sage-dark)]
                                      shadow-sm
                                    "
                                  >
                                    {hora}
                                  </span>
                                )
                              )}

                            </div>

                            <button
                              type="button"
                              onClick={
                                reservarConsultorio
                              }
                              disabled={
                                reservandoConsultorio
                              }
                              className="
                                mt-6 inline-flex
                                items-center gap-2
                                rounded-full
                                bg-[var(--sage-dark)]
                                px-7 py-3.5
                                font-semibold text-white
                                shadow-md transition
                                hover:-translate-y-0.5
                                hover:shadow-lg
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              <Building2 size={18} />

                              {reservandoConsultorio
                                ? "Reservando..."
                                : "Confirmar reserva"}
                            </button>

                          </div>
                        )}

                      </>
                    )}

                  </div>
                )}

              </div>
            )}

{/* =================================================
    MIS RESERVAS
================================================= */}

{seccion === "mis-reservas" && (
  <div className="mt-10">

    <div className="flex items-start gap-4">
      <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
        <Building2 size={26} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[var(--text)]">
          Mis reservas
        </h2>

        <p className="mt-2 text-gray-500">
          Consultá los horarios que reservaste para utilizar el consultorio.
        </p>
      </div>
    </div>

    {/* FILTROS */}

    <div className="mt-7 flex flex-wrap gap-3">

      <button
        type="button"
        onClick={() => setFiltroReservas("proximas")}
        className={`
          rounded-full px-5 py-2.5 font-medium transition
          ${
            filtroReservas === "proximas"
              ? "bg-[var(--sage-dark)] text-white shadow-md"
              : "border border-black/10 bg-white text-gray-600"
          }
        `}
      >
        Próximas
      </button>

      <button
        type="button"
        onClick={() => setFiltroReservas("pasadas")}
        className={`
          rounded-full px-5 py-2.5 font-medium transition
          ${
            filtroReservas === "pasadas"
              ? "bg-[var(--sage-dark)] text-white shadow-md"
              : "border border-black/10 bg-white text-gray-600"
          }
        `}
      >
        Pasadas
      </button>

      <button
        type="button"
        onClick={() => setFiltroReservas("liberadas")}
        className={`
          rounded-full px-5 py-2.5 font-medium transition
          ${
            filtroReservas === "liberadas"
              ? "bg-[var(--sage-dark)] text-white shadow-md"
              : "border border-black/10 bg-white text-gray-600"
          }
        `}
      >
        Liberadas
      </button>

    </div>

    {/* RESERVAS */}

    {(() => {
      const ahoraReservas = new Date();

      const reservasProximas = reservas
        .filter(
          (reserva) =>
            reserva.estado === "confirmado" &&
            obtenerFechaHoraTurno(reserva) >= ahoraReservas
        )
        .sort(
          (a, b) =>
            obtenerFechaHoraTurno(a) -
            obtenerFechaHoraTurno(b)
        );

      const reservasPasadas = reservas
        .filter(
          (reserva) =>
            reserva.estado === "confirmado" &&
            obtenerFechaHoraTurno(reserva) < ahoraReservas
        )
        .sort(
          (a, b) =>
            obtenerFechaHoraTurno(b) -
            obtenerFechaHoraTurno(a)
        );

      const reservasLiberadas = reservas
        .filter(
          (reserva) => reserva.estado === "cancelado"
        )
        .sort(
          (a, b) =>
            obtenerFechaHoraTurno(b) -
            obtenerFechaHoraTurno(a)
        );

      let reservasMostrar = reservasProximas;

      if (filtroReservas === "pasadas") {
        reservasMostrar = reservasPasadas;
      }

      if (filtroReservas === "liberadas") {
        reservasMostrar = reservasLiberadas;
      }

      if (reservasMostrar.length === 0) {
        return (
          <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
            <p className="text-gray-500">
              {filtroReservas === "proximas" &&
                "No tenés reservas próximas."}

              {filtroReservas === "pasadas" &&
                "Todavía no tenés reservas pasadas."}

              {filtroReservas === "liberadas" &&
                "No tenés reservas liberadas."}
            </p>
          </div>
        );
      }

      return (
        <div className="mt-8 space-y-4">

          {reservasMostrar.map((reserva) => (
            <div
              key={reserva.id}
              className="
                rounded-[28px]
                border border-black/5
                bg-white p-6
                shadow-sm
              "
            >

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
                    <Building2 size={22} />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="text-lg font-semibold text-[var(--text)]">
                        Consultorio {reserva.consultorio_id}
                      </h3>

                      {reserva.estado === "cancelado" && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-500">
                          Liberada
                        </span>
                      )}

                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-gray-600">

                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={18}
                          className="text-[var(--sage)]"
                        />

                        {formatearFecha(reserva.fecha)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock
                          size={18}
                          className="text-[var(--sage)]"
                        />

                        {formatearHora(reserva.hora)}
                      </div>

                    </div>

                    {reserva.motivo_reserva && (
                      <p className="mt-4 text-sm text-gray-500">
                        {reserva.motivo_reserva}
                      </p>
                    )}

                  </div>
                </div>

                {filtroReservas === "proximas" &&
                  reserva.estado === "confirmado" && (
                    <button
                      type="button"
                      onClick={() =>
                        liberarReserva(reserva.id)
                      }
                      disabled={
                        liberandoReservaId === reserva.id
                      }
                      className="
                        inline-flex w-fit items-center gap-2
                        rounded-full
                        border border-red-200
                        bg-red-50
                        px-5 py-3
                        font-semibold text-red-600
                        transition
                        hover:-translate-y-0.5
                        hover:bg-red-100
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <Trash2 size={17} />

                      {liberandoReservaId === reserva.id
                        ? "Liberando..."
                        : "Liberar reserva"}
                    </button>
                  )}

              </div>

            </div>
          ))}

        </div>
      );
    })()}

  </div>
)}


            {/* =================================================
                MIS HORAS / PAGOS
            ================================================= */}

            {seccion === "pagos" && (
              <div className="mt-10">

                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
                    <Wallet size={26} />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-[var(--text)]">
                      Mis horas y pagos
                    </h2>

                    <p className="mt-2 max-w-2xl text-gray-500">
                      Consultá tus períodos liquidados, las horas utilizadas,
                      los pagos registrados y el saldo pendiente.
                    </p>
                  </div>
                </div>

                {cargandoPagos ? (
                  <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
                    <p className="text-gray-500">
                      Cargando liquidaciones...
                    </p>
                  </div>
                ) : liquidaciones.length === 0 ? (
                  <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
                    <p className="text-gray-500">
                      Todavía no tenés liquidaciones generadas.
                    </p>
                  </div>
                ) : (
                  <div className="mt-8 space-y-5">
                    {liquidaciones.map((liquidacion) => {
                      const historial =
                        pagosPorLiquidacion[liquidacion.id] ?? [];

                      return (
                        <div
                          key={liquidacion.id}
                          className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"
                        >
                          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-semibold text-[var(--text)]">
                                  {formatearFecha(
                                    liquidacion.periodo_desde
                                  )}{" "}
                                  al{" "}
                                  {formatearFecha(
                                    liquidacion.periodo_hasta
                                  )}
                                </h3>

                                <span
                                  className={`
                                    rounded-full px-3 py-1
                                    text-xs font-semibold uppercase
                                    ${claseEstadoPago(
                                      liquidacion.estado_pago
                                    )}
                                  `}
                                >
                                  {etiquetaEstadoPago(
                                    liquidacion.estado_pago
                                  )}
                                </span>
                              </div>

                              <div className="mt-5 flex flex-wrap gap-4">
                                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                                  <p className="text-xs text-gray-400">
                                    Horas liquidadas
                                  </p>
                                  <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                                    {liquidacion.horas} h
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-[560px]">
                              <div className="rounded-2xl bg-gray-50 p-4">
                                <p className="text-xs text-gray-400">
                                  Total
                                </p>
                                <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                                  {formatearPesos(
                                    liquidacion.total
                                  )}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-green-50 p-4">
                                <p className="text-xs text-green-600">
                                  Pagado
                                </p>
                                <p className="mt-1 text-lg font-semibold text-green-700">
                                  {formatearPesos(
                                    liquidacion.pagado
                                  )}
                                </p>
                              </div>

                              <div className="rounded-2xl bg-[var(--sage-light)] p-4">
                                <p className="text-xs text-[var(--sage-dark)]">
                                  Saldo
                                </p>
                                <p className="mt-1 text-lg font-semibold text-[var(--sage-dark)]">
                                  {formatearPesos(
                                    liquidacion.saldo
                                  )}
                                </p>
                              </div>
                            </div>

                          </div>

                          <div className="mt-6 border-t border-black/5 pt-5">
                            <div className="flex items-center gap-2">
                              <ReceiptText
                                size={18}
                                className="text-[var(--sage)]"
                              />

                              <h4 className="font-semibold text-[var(--text)]">
                                Historial de pagos
                              </h4>
                            </div>

                            {historial.length === 0 ? (
                              <div className="mt-3 rounded-2xl bg-gray-50 px-4 py-4">
                                <p className="text-sm text-gray-500">
                                  Todavía no hay pagos registrados para esta liquidación.
                                </p>
                              </div>
                            ) : (
                              <div className="mt-3 space-y-2">
                                {historial.map((pago) => (
                                  <div
                                    key={pago.id}
                                    className="flex flex-col gap-3 rounded-2xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="rounded-xl bg-[var(--sage-light)] p-2 text-[var(--sage-dark)]">
                                        <CircleDollarSign size={18} />
                                      </div>

                                      <div>
                                        <p className="font-semibold text-[var(--text)]">
                                          {formatearPesos(
                                            pago.monto
                                          )}
                                        </p>

                                        {pago.observaciones && (
                                          <p className="mt-1 text-sm text-gray-500">
                                            {pago.observaciones}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <p className="text-sm text-gray-500">
                                      {formatearFecha(
                                        pago.fecha_pago
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })}
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
                  Elegí los días y horarios en los que
                  atendés. Los cambios se reflejarán
                  automáticamente en el turnero.
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
                              transition-colors
                              ${
                                dia.activo
                                  ? "bg-[var(--sage-dark)]"
                                  : "bg-gray-200"
                              }
                            `}
                          >
                            <span
                              className={`
                                absolute top-1
                                h-5 w-5
                                rounded-full bg-white
                                shadow-sm transition-all
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
                                focus:border-[var(--sage)]
                                disabled:bg-gray-100
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
                                focus:border-[var(--sage)]
                                disabled:bg-gray-100
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
                  Bloqueá fechas puntuales en las que no vas
                  a atender, sin modificar tus horarios
                  semanales.
                </p>

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
                          setFechaAusencia(
                            e.target.value
                          )
                        }
                        className="
                          w-full rounded-xl
                          border border-gray-200
                          bg-white px-4 py-3
                          outline-none
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
                          setMotivoAusencia(
                            e.target.value
                          )
                        }
                        placeholder="Ej: Vacaciones"
                        className="
                          w-full rounded-xl
                          border border-gray-200
                          bg-white px-4 py-3
                          outline-none
                          focus:border-[var(--sage)]
                        "
                      />
                    </div>

                    <button
                      type="button"
                      onClick={agregarAusencia}
                      disabled={guardandoAusencia}
                      className="
                        inline-flex items-center
                        justify-center gap-2
                        rounded-full
                        bg-[var(--sage-dark)]
                        px-6 py-3
                        font-semibold text-white
                      "
                    >
                      <Plus size={18} />

                      {guardandoAusencia
                        ? "Guardando..."
                        : "Bloquear día"}
                    </button>

                  </div>

                </div>

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
                              <CalendarX2
                                size={22}
                              />
                            </div>

                            <div>
                              <p className="text-lg font-semibold text-[var(--text)]">
                                {formatearFecha(
                                  ausencia.fecha
                                )}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {ausencia.motivo ||
                                  "Sin motivo especificado"}
                              </p>
                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              eliminarAusencia(
                                ausencia.id
                              )
                            }
                            disabled={
                              eliminandoAusenciaId ===
                              ausencia.id
                            }
                            className="
                              inline-flex w-fit
                              items-center gap-2
                              rounded-full
                              border border-red-200
                              px-5 py-2.5
                              font-medium text-red-600
                              transition
                              hover:bg-red-50
                            "
                          >
                            <Trash2 size={17} />

                            {eliminandoAusenciaId ===
                            ausencia.id
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