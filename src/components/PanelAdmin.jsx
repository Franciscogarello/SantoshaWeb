import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  ShieldCheck,
  CalendarDays,
  Clock,
  Building2,
  UserRound,
  Users,
  Timer,
  DollarSign,
  Wallet,
  ReceiptText,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function PanelAdmin({ usuario, onLogout }) {
  // =========================================================
  // ESTADOS GENERALES
  // =========================================================

  const [reservas, setReservas] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [pagos, setPagos] = useState([]);

  // =========================================================
  // NAVEGACIÓN ADMIN
  // =========================================================

  const [seccionAdmin, setSeccionAdmin] = useState("resumen");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FILTROS
  // =========================================================

  const [filtroConsultorio, setFiltroConsultorio] =
    useState("todos");

  const [filtroTipo, setFiltroTipo] =
    useState("todos");

  const [filtroProfesional, setFiltroProfesional] =
    useState("todos");

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // =========================================================
  // TARIFAS
  // =========================================================

  const [valoresTarifas, setValoresTarifas] =
    useState({});

  const [fechasTarifas, setFechasTarifas] =
    useState({});

  const [guardandoTarifa, setGuardandoTarifa] =
    useState(null);

  const [mensajeTarifa, setMensajeTarifa] =
    useState("");

  // =========================================================
  // LIQUIDACIONES
  // =========================================================

  const [generandoLiquidacion, setGenerandoLiquidacion] =
    useState(null);

  const [mensajeLiquidacion, setMensajeLiquidacion] =
    useState("");

  // =========================================================
  // PAGOS
  // =========================================================

  const [montosPago, setMontosPago] =
    useState({});

  const [fechasPago, setFechasPago] =
    useState({});

  const [observacionesPago, setObservacionesPago] =
    useState({});

  const [guardandoPago, setGuardandoPago] =
    useState(null);

  const [mensajePago, setMensajePago] =
    useState("");

  // =========================================================
  // HOY ARGENTINA
  // =========================================================

  const obtenerHoyArgentina = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
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
  // CARGAR RESERVAS
  // =========================================================

  const cargarReservas = async () => {
    setCargando(true);
    setError("");

    const { data, error } = await supabase.rpc(
      "admin_obtener_reservas_valorizadas"
    );

    if (error) {
      console.error(
        "Error cargando reservas admin:",
        error
      );

      setError(
        error.message ||
          "No pudimos cargar las reservas."
      );

      setCargando(false);
      return;
    }

    setReservas(data ?? []);
    setCargando(false);
  };

  // =========================================================
  // CARGAR TARIFAS
  // =========================================================

  const cargarTarifas = async () => {
    const { data, error } = await supabase.rpc(
      "admin_obtener_tarifas"
    );

    if (error) {
      console.error(
        "Error cargando tarifas:",
        error
      );

      return;
    }

    setTarifas(data ?? []);
  };

  // =========================================================
  // CARGAR LIQUIDACIONES
  // =========================================================

  const cargarLiquidaciones = async () => {
    const { data, error } = await supabase.rpc(
      "admin_obtener_liquidaciones"
    );

    if (error) {
      console.error(
        "Error cargando liquidaciones:",
        error
      );

      setError(
        error.message ||
          "No pudimos cargar las liquidaciones."
      );

      return;
    }

    setLiquidaciones(data ?? []);
  };

  // =========================================================
  // CARGAR PAGOS
  // =========================================================

  const cargarPagos = async () => {
    const { data, error } = await supabase.rpc(
      "admin_obtener_pagos"
    );

    if (error) {
      console.error(
        "Error cargando pagos:",
        error
      );

      return;
    }

    setPagos(data ?? []);
  };

  // =========================================================
  // GUARDAR TARIFA
  // =========================================================

  const guardarTarifa = async (profesionalId) => {
    const valor = Number(
      valoresTarifas[profesionalId]
    );

    const fecha =
      fechasTarifas[profesionalId];

    if (!valor || valor <= 0) {
      setMensajeTarifa(
        "Ingresá un valor por hora válido."
      );

      return;
    }

    if (!fecha) {
      setMensajeTarifa(
        "Elegí desde qué fecha rige la tarifa."
      );

      return;
    }

    setGuardandoTarifa(profesionalId);
    setMensajeTarifa("");

    const { error } = await supabase.rpc(
      "admin_guardar_tarifa",
      {
        p_profesional_id: profesionalId,
        p_valor_hora: valor,
        p_vigente_desde: fecha,
      }
    );

    if (error) {
      console.error(
        "Error guardando tarifa:",
        error
      );

      setMensajeTarifa(
        error.message ||
          "No pudimos guardar la tarifa."
      );

      setGuardandoTarifa(null);
      return;
    }

    setMensajeTarifa(
      "Tarifa guardada correctamente."
    );

    setValoresTarifas((prev) => ({
      ...prev,
      [profesionalId]: "",
    }));

    setFechasTarifas((prev) => ({
      ...prev,
      [profesionalId]: "",
    }));

    await cargarTarifas();
    await cargarReservas();

    setGuardandoTarifa(null);
  };

  // =========================================================
  // GENERAR LIQUIDACIÓN
  // =========================================================

  const generarLiquidacion = async (
    profesionalId
  ) => {
    setMensajeLiquidacion("");

    if (!fechaDesde || !fechaHasta) {
      setMensajeLiquidacion(
        "Primero elegí una fecha Desde y Hasta."
      );

      return;
    }

    if (fechaHasta < fechaDesde) {
      setMensajeLiquidacion(
        "El período seleccionado no es válido."
      );

      return;
    }

    if (
      filtroTipo !== "todos" ||
      filtroConsultorio !== "todos"
    ) {
      setMensajeLiquidacion(
        "Para generar una liquidación dejá Tipo y Consultorio en Todos."
      );

      return;
    }

    setGenerandoLiquidacion(
      profesionalId
    );

    const { error } = await supabase.rpc(
      "admin_generar_liquidacion",
      {
        p_profesional_id:
          profesionalId,
        p_periodo_desde:
          fechaDesde,
        p_periodo_hasta:
          fechaHasta,
      }
    );

    if (error) {
      console.error(
        "Error generando liquidación:",
        error
      );

      setMensajeLiquidacion(
        error.message ||
          "No pudimos generar la liquidación."
      );

      setGenerandoLiquidacion(null);
      return;
    }

    setMensajeLiquidacion(
      "Liquidación generada correctamente."
    );

    await cargarLiquidaciones();

    setGenerandoLiquidacion(null);
  };

  // =========================================================
  // REGISTRAR PAGO
  // =========================================================

  const registrarPago = async (
    liquidacion
  ) => {
    setMensajePago("");

    const monto = Number(
      montosPago[liquidacion.id]
    );

    const fecha =
      fechasPago[liquidacion.id] ||
      obtenerHoyArgentina();

    const observaciones =
      observacionesPago[
        liquidacion.id
      ] ?? "";

    if (!monto || monto <= 0) {
      setMensajePago(
        "Ingresá un monto válido."
      );

      return;
    }

    if (
      monto >
      Number(liquidacion.saldo)
    ) {
      setMensajePago(
        `El pago no puede superar el saldo de ${formatearPesos(
          liquidacion.saldo
        )}.`
      );

      return;
    }

    setGuardandoPago(
      liquidacion.id
    );

    const { error } = await supabase.rpc(
      "admin_registrar_pago",
      {
        p_liquidacion_id:
          liquidacion.id,
        p_monto: monto,
        p_fecha_pago: fecha,
        p_observaciones:
          observaciones || null,
      }
    );

    if (error) {
      console.error(
        "Error registrando pago:",
        error
      );

      setMensajePago(
        error.message ||
          "No pudimos registrar el pago."
      );

      setGuardandoPago(null);
      return;
    }

    setMensajePago(
      "Pago registrado correctamente."
    );

    setMontosPago((prev) => ({
      ...prev,
      [liquidacion.id]: "",
    }));

    setObservacionesPago(
      (prev) => ({
        ...prev,
        [liquidacion.id]: "",
      })
    );

    await cargarLiquidaciones();
    await cargarPagos();

    setGuardandoPago(null);
  };

  // =========================================================
  // CARGA INICIAL
  // =========================================================

  useEffect(() => {
    cargarReservas();
    cargarTarifas();
    cargarLiquidaciones();
    cargarPagos();
  }, []);

  // =========================================================
  // FORMATO
  // =========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const [anio, mes, dia] =
      fecha.split("-");

    return `${dia}/${mes}/${anio}`;
  };

  const formatearHora = (hora) => {
    return hora?.slice(0, 5) ?? "";
  };

  const formatearPesos = (valor) => {
    return new Intl.NumberFormat(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }
    ).format(Number(valor ?? 0));
  };

  // =========================================================
  // PROFESIONALES
  // =========================================================

  const profesionales = useMemo(() => {
    const mapa = new Map();

    reservas.forEach((reserva) => {
      if (
        !mapa.has(
          reserva.profesional_id
        )
      ) {
        mapa.set(
          reserva.profesional_id,
          {
            id:
              reserva.profesional_id,
            nombre:
              reserva.profesional_nombre,
          }
        );
      }
    });

    tarifas.forEach((tarifa) => {
      if (
        !mapa.has(
          tarifa.profesional_id
        )
      ) {
        mapa.set(
          tarifa.profesional_id,
          {
            id:
              tarifa.profesional_id,
            nombre:
              tarifa.profesional_nombre,
          }
        );
      }
    });

    liquidaciones.forEach(
      (liquidacion) => {
        if (
          !mapa.has(
            liquidacion.profesional_id
          )
        ) {
          mapa.set(
            liquidacion.profesional_id,
            {
              id:
                liquidacion.profesional_id,
              nombre:
                liquidacion.profesional_nombre,
            }
          );
        }
      }
    );

    return Array.from(
      mapa.values()
    ).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }, [
    reservas,
    tarifas,
    liquidaciones,
  ]);

  // =========================================================
  // FILTRO DE RESERVAS
  // =========================================================

  const reservasFiltradas =
    useMemo(() => {
      return reservas.filter(
        (reserva) => {
          const coincideConsultorio =
            filtroConsultorio ===
              "todos" ||
            String(
              reserva.consultorio_id
            ) === filtroConsultorio;

          const coincideTipo =
            filtroTipo === "todos" ||
            reserva.tipo_reserva ===
              filtroTipo;

          const coincideProfesional =
            filtroProfesional ===
              "todos" ||
            String(
              reserva.profesional_id
            ) === filtroProfesional;

          const coincideDesde =
            !fechaDesde ||
            reserva.fecha >=
              fechaDesde;

          const coincideHasta =
            !fechaHasta ||
            reserva.fecha <=
              fechaHasta;

          return (
            coincideConsultorio &&
            coincideTipo &&
            coincideProfesional &&
            coincideDesde &&
            coincideHasta
          );
        }
      );
    }, [
      reservas,
      filtroConsultorio,
      filtroTipo,
      filtroProfesional,
      fechaDesde,
      fechaHasta,
    ]);

  // =========================================================
  // HORAS
  // =========================================================

  const reservasConfirmadasFiltradas =
    reservasFiltradas.filter(
      (reserva) =>
        reserva.estado ===
        "confirmado"
    );

  const horasUtilizadas =
    reservasConfirmadasFiltradas.length;

  const horasConsultorio1 =
    reservasConfirmadasFiltradas.filter(
      (reserva) =>
        Number(
          reserva.consultorio_id
        ) === 1
    ).length;

  const horasConsultorio2 =
    reservasConfirmadasFiltradas.filter(
      (reserva) =>
        Number(
          reserva.consultorio_id
        ) === 2
    ).length;

  // =========================================================
  // RESUMEN PROFESIONALES
  // =========================================================

  const resumenProfesionales =
    useMemo(() => {
      const mapa = new Map();

      reservasFiltradas
        .filter(
          (reserva) =>
            reserva.estado ===
            "confirmado"
        )
        .forEach((reserva) => {
          const actual =
            mapa.get(
              reserva.profesional_id
            ) || {
              id:
                reserva.profesional_id,
              nombre:
                reserva.profesional_nombre,
              especialidad:
                reserva.especialidad,
              consultorio:
                reserva.consultorio_id,
              horas: 0,
              pacientes: 0,
              reservasInternas: 0,
              total: 0,
              horasSinTarifa: 0,
            };

          actual.horas += 1;

          actual.total += Number(
            reserva.importe ?? 0
          );

          if (
            Number(
              reserva.valor_hora ?? 0
            ) === 0
          ) {
            actual.horasSinTarifa += 1;
          }

          if (
            reserva.tipo_reserva ===
            "profesional"
          ) {
            actual.reservasInternas += 1;
          } else {
            actual.pacientes += 1;
          }

          mapa.set(
            reserva.profesional_id,
            actual
          );
        });

      return Array.from(
        mapa.values()
      ).sort(
        (a, b) =>
          b.horas - a.horas
      );
    }, [reservasFiltradas]);

  // =========================================================
  // LIQUIDACIONES FILTRADAS
  // =========================================================

  const liquidacionesFiltradas =
    useMemo(() => {
      return liquidaciones.filter(
        (liquidacion) => {
          const coincideProfesional =
            filtroProfesional ===
              "todos" ||
            String(
              liquidacion.profesional_id
            ) === filtroProfesional;

          const coincideDesde =
            !fechaDesde ||
            liquidacion.periodo_hasta >=
              fechaDesde;

          const coincideHasta =
            !fechaHasta ||
            liquidacion.periodo_desde <=
              fechaHasta;

          return (
            coincideProfesional &&
            coincideDesde &&
            coincideHasta
          );
        }
      );
    }, [
      liquidaciones,
      filtroProfesional,
      fechaDesde,
      fechaHasta,
    ]);

  // =========================================================
  // DASHBOARD FINANCIERO
  // =========================================================

  const resumenFinanciero = useMemo(() => {
    const totalLiquidado = liquidacionesFiltradas.reduce(
      (acumulado, liquidacion) =>
        acumulado + Number(liquidacion.total ?? 0),
      0
    );

    const totalCobrado = liquidacionesFiltradas.reduce(
      (acumulado, liquidacion) =>
        acumulado + Number(liquidacion.pagado ?? 0),
      0
    );

    const saldoPendiente = liquidacionesFiltradas.reduce(
      (acumulado, liquidacion) =>
        acumulado + Number(liquidacion.saldo ?? 0),
      0
    );

    const horasLiquidadas = liquidacionesFiltradas.reduce(
      (acumulado, liquidacion) =>
        acumulado + Number(liquidacion.horas ?? 0),
      0
    );

    const pendientes = liquidacionesFiltradas.filter(
      (liquidacion) => liquidacion.estado_pago === "pendiente"
    ).length;

    const parciales = liquidacionesFiltradas.filter(
      (liquidacion) => liquidacion.estado_pago === "parcial"
    ).length;

    const pagadas = liquidacionesFiltradas.filter(
      (liquidacion) => liquidacion.estado_pago === "pagado"
    ).length;

    return {
      totalLiquidado,
      totalCobrado,
      saldoPendiente,
      horasLiquidadas,
      pendientes,
      parciales,
      pagadas,
    };
  }, [liquidacionesFiltradas]);

  // =========================================================
  // DEUDA POR PROFESIONAL
  // =========================================================

  const deudaPorProfesional = useMemo(() => {
    const mapa = new Map();

    liquidacionesFiltradas.forEach((liquidacion) => {
      const profesionalId = Number(liquidacion.profesional_id);

      const actual = mapa.get(profesionalId) || {
        id: profesionalId,
        nombre: liquidacion.profesional_nombre,
        especialidad: liquidacion.especialidad,
        total: 0,
        pagado: 0,
        saldo: 0,
        liquidaciones: 0,
      };

      actual.total += Number(liquidacion.total ?? 0);
      actual.pagado += Number(liquidacion.pagado ?? 0);
      actual.saldo += Number(liquidacion.saldo ?? 0);
      actual.liquidaciones += 1;

      mapa.set(profesionalId, actual);
    });

    return Array.from(mapa.values()).sort((a, b) => {
      if (b.saldo !== a.saldo) {
        return b.saldo - a.saldo;
      }

      return a.nombre.localeCompare(b.nombre);
    });
  }, [liquidacionesFiltradas]);

  // =========================================================
  // BUSCAR LIQUIDACIÓN EXACTA
  // =========================================================

  const obtenerLiquidacionPeriodo = (
    profesionalId
  ) => {
    if (
      !fechaDesde ||
      !fechaHasta
    ) {
      return null;
    }

    return (
      liquidaciones.find(
        (liquidacion) =>
          Number(
            liquidacion.profesional_id
          ) ===
            Number(
              profesionalId
            ) &&
          liquidacion.periodo_desde ===
            fechaDesde &&
          liquidacion.periodo_hasta ===
            fechaHasta
      ) ?? null
    );
  };

  // =========================================================
  // PAGOS DE UNA LIQUIDACIÓN
  // =========================================================

  const pagosLiquidacion = (
    liquidacionId
  ) => {
    return pagos.filter(
      (pago) =>
        Number(
          pago.liquidacion_id
        ) ===
        Number(liquidacionId)
    );
  };

  // =========================================================
  // ESTADOS
  // =========================================================

  const etiquetaEstadoPago = (
    estado
  ) => {
    if (estado === "pagado") {
      return "Pagado";
    }

    if (estado === "parcial") {
      return "Pago parcial";
    }

    return "Pendiente";
  };

  const claseEstadoPago = (
    estado
  ) => {
    if (estado === "pagado") {
      return "bg-green-50 text-green-700";
    }

    if (estado === "parcial") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-red-50 text-red-600";
  };

  // =========================================================
  // ATAJOS FECHA
  // =========================================================

  const aplicarMesActual = () => {
    const hoy = new Date();

    const anio =
      hoy.getFullYear();

    const mes = String(
      hoy.getMonth() + 1
    ).padStart(2, "0");

    const ultimoDia = new Date(
      anio,
      hoy.getMonth() + 1,
      0
    ).getDate();

    setFechaDesde(
      `${anio}-${mes}-01`
    );

    setFechaHasta(
      `${anio}-${mes}-${String(
        ultimoDia
      ).padStart(2, "0")}`
    );
  };

  const aplicarPrimeraQuincena =
    () => {
      const hoy = new Date();

      const anio =
        hoy.getFullYear();

      const mes = String(
        hoy.getMonth() + 1
      ).padStart(2, "0");

      setFechaDesde(
        `${anio}-${mes}-01`
      );

      setFechaHasta(
        `${anio}-${mes}-15`
      );
    };

  const aplicarSegundaQuincena =
    () => {
      const hoy = new Date();

      const anio =
        hoy.getFullYear();

      const mesNumero =
        hoy.getMonth();

      const mes = String(
        mesNumero + 1
      ).padStart(2, "0");

      const ultimoDia = new Date(
        anio,
        mesNumero + 1,
        0
      ).getDate();

      setFechaDesde(
        `${anio}-${mes}-16`
      );

      setFechaHasta(
        `${anio}-${mes}-${String(
          ultimoDia
        ).padStart(2, "0")}`
      );
    };

  const limpiarFiltros = () => {
    setFiltroConsultorio("todos");
    setFiltroTipo("todos");
    setFiltroProfesional("todos");
    setFechaDesde("");
    setFechaHasta("");
  };

  // =========================================================
  // PANTALLA
  // =========================================================

  return (
    <div className="min-h-screen bg-[var(--cream)] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--sage)]">
              Santosha
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">
              Panel administrador
            </h1>

            <p className="mt-2 text-gray-500">
              Gestión general de consultorios,
              profesionales y pagos.
            </p>
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

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 px-5 py-4 text-red-600">
            {error}
          </div>
        )}

        {/* ADMIN */}

        <div className="mt-10 rounded-[30px] bg-white p-7 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
              <ShieldCheck size={26} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Administración Santosha
              </h2>

              <p className="mt-2 text-gray-500">
                {usuario.email}
              </p>
            </div>

          </div>

        </div>

        {/* NAVEGACIÓN ADMIN */}

        <div className="mt-8 overflow-x-auto">
          <div className="flex min-w-max gap-2 rounded-[24px] bg-white p-2 shadow-sm">
            {[
              { id: "resumen", label: "Resumen", icono: <ShieldCheck size={18} /> },
              { id: "tarifas", label: "Tarifas", icono: <DollarSign size={18} /> },
              { id: "liquidaciones", label: "Liquidaciones y pagos", icono: <Wallet size={18} /> },
              { id: "reservas", label: "Reservas", icono: <CalendarDays size={18} /> },
            ].map((item) => {
              const activa = seccionAdmin === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSeccionAdmin(item.id)}
                  className={`
                    inline-flex items-center gap-2 rounded-[18px]
                    px-5 py-3 text-sm font-semibold transition
                    ${
                      activa
                        ? "bg-[var(--sage-dark)] text-white shadow-sm"
                        : "text-gray-500 hover:bg-[var(--sage-light)] hover:text-[var(--sage-dark)]"
                    }
                  `}
                >
                  {item.icono}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTROS */}

        {seccionAdmin !== "tarifas" && (
        <div className="mt-8 rounded-[30px] bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-[var(--text)]">
            Período y filtros
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Elegí el período que querés analizar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={aplicarMesActual}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-[var(--sage)]"
            >
              Este mes
            </button>

            <button
              type="button"
              onClick={aplicarPrimeraQuincena}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-[var(--sage)]"
            >
              1° quincena
            </button>

            <button
              type="button"
              onClick={aplicarSegundaQuincena}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-[var(--sage)]"
            >
              2° quincena
            </button>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
            >
              Limpiar filtros
            </button>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                Desde
              </label>

              <input
                type="date"
                value={fechaDesde}
                onChange={(e) =>
                  setFechaDesde(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--sage)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                Hasta
              </label>

              <input
                type="date"
                value={fechaHasta}
                onChange={(e) =>
                  setFechaHasta(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--sage)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                Profesional
              </label>

              <select
                value={filtroProfesional}
                onChange={(e) =>
                  setFiltroProfesional(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              >
                <option value="todos">
                  Todos
                </option>

                {profesionales.map(
                  (profesional) => (
                    <option
                      key={profesional.id}
                      value={profesional.id}
                    >
                      {profesional.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                Consultorio
              </label>

              <select
                value={filtroConsultorio}
                onChange={(e) =>
                  setFiltroConsultorio(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              >
                <option value="todos">
                  Todos
                </option>

                <option value="1">
                  Consultorio 1
                </option>

                <option value="2">
                  Consultorio 2
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                Tipo
              </label>

              <select
                value={filtroTipo}
                onChange={(e) =>
                  setFiltroTipo(e.target.value)
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
              >
                <option value="todos">
                  Todos
                </option>

                <option value="profesional">
                  Reserva profesional
                </option>

                <option value="paciente">
                  Paciente
                </option>
              </select>
            </div>

          </div>

        </div>

        )}

        {/* RESUMEN */}

        {seccionAdmin === "resumen" && (
          <>
        {/* TARJETAS */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-[28px] bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-[var(--sage-light)] p-2 text-[var(--sage-dark)]">
                <Timer size={20} />
              </div>

              <p className="text-sm text-gray-500">
                Horas utilizadas
              </p>

            </div>

            <p className="mt-4 text-3xl font-semibold text-[var(--text)]">
              {horasUtilizadas} h
            </p>

          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Consultorio 1
            </p>

            <p className="mt-4 text-3xl font-semibold text-[var(--text)]">
              {horasConsultorio1} h
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Consultorio 2
            </p>

            <p className="mt-4 text-3xl font-semibold text-[var(--text)]">
              {horasConsultorio2} h
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Profesionales
            </p>

            <p className="mt-4 text-3xl font-semibold text-[var(--text)]">
              {resumenProfesionales.length}
            </p>
          </div>

        </div>

        {/* DASHBOARD FINANCIERO */}

        <div className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sage)]">
                Finanzas
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                Resumen financiero
              </h2>

              <p className="mt-1 text-gray-500">
                Estado de las liquidaciones dentro del período y profesional seleccionados.
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
              {liquidacionesFiltradas.length} liquidación(es)
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Total liquidado
                </p>

                <div className="rounded-xl bg-[var(--sage-light)] p-2 text-[var(--sage-dark)]">
                  <ReceiptText size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-semibold text-[var(--text)]">
                {formatearPesos(resumenFinanciero.totalLiquidado)}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {resumenFinanciero.horasLiquidadas} h liquidadas
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Total cobrado
                </p>

                <div className="rounded-xl bg-green-50 p-2 text-green-700">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-semibold text-green-700">
                {formatearPesos(resumenFinanciero.totalCobrado)}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Pagos registrados
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Saldo pendiente
                </p>

                <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                  <Wallet size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-semibold text-amber-700">
                {formatearPesos(resumenFinanciero.saldoPendiente)}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Importe todavía pendiente de cobro
              </p>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                  Horas liquidadas
                </p>

                <div className="rounded-xl bg-[var(--sage-light)] p-2 text-[var(--sage-dark)]">
                  <Timer size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-semibold text-[var(--text)]">
                {resumenFinanciero.horasLiquidadas} h
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Horas incluidas en liquidaciones
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
              <span className="text-sm font-medium text-red-700">
                Pendientes
              </span>

              <span className="text-xl font-semibold text-red-700">
                {resumenFinanciero.pendientes}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
              <span className="text-sm font-medium text-amber-700">
                Pago parcial
              </span>

              <span className="text-xl font-semibold text-amber-700">
                {resumenFinanciero.parciales}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50 px-5 py-4">
              <span className="text-sm font-medium text-green-700">
                Pagadas
              </span>

              <span className="text-xl font-semibold text-green-700">
                {resumenFinanciero.pagadas}
              </span>
            </div>
          </div>
        </div>

        {/* DEUDA POR PROFESIONAL */}

        <div className="mt-8 rounded-[30px] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Quién debe y cuánto
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Saldo acumulado por profesional según las liquidaciones mostradas.
              </p>
            </div>

            <div className="rounded-full bg-[var(--sage-light)] px-4 py-2 text-sm font-medium text-[var(--sage-dark)]">
              {deudaPorProfesional.filter((item) => item.saldo > 0).length} con saldo pendiente
            </div>
          </div>

          {deudaPorProfesional.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Todavía no hay liquidaciones para mostrar en este resumen.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {deudaPorProfesional.map((item) => {
                const alDia = item.saldo <= 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[22px] border border-black/5 bg-gray-50/70 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--text)]">
                          {item.nombre}
                        </h3>

                        <span
                          className={`
                            rounded-full px-3 py-1 text-xs font-semibold
                            ${
                              alDia
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }
                          `}
                        >
                          {alDia ? "Al día" : "Saldo pendiente"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-400">
                        {item.especialidad} · {item.liquidaciones} liquidación(es)
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-5 sm:min-w-[430px]">
                      <div>
                        <p className="text-xs text-gray-400">
                          Liquidado
                        </p>

                        <p className="mt-1 font-semibold text-[var(--text)]">
                          {formatearPesos(item.total)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Pagado
                        </p>

                        <p className="mt-1 font-semibold text-green-700">
                          {formatearPesos(item.pagado)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Debe
                        </p>

                        <p
                          className={`mt-1 font-semibold ${
                            alDia
                              ? "text-green-700"
                              : "text-amber-700"
                          }`}
                        >
                          {formatearPesos(item.saldo)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

          </>
        )}

        {/* TARIFAS */}

        {seccionAdmin === "tarifas" && (
        <div className="mt-8 rounded-[30px] bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-semibold text-[var(--text)]">
            Tarifas de profesionales
          </h2>

          <p className="mt-2 text-gray-500">
            Configurá el valor por hora y desde qué fecha comienza a regir.
          </p>

          {mensajeTarifa && (
            <div className="mt-5 rounded-2xl bg-[var(--sage-light)] px-5 py-4 text-sm text-[var(--sage-dark)]">
              {mensajeTarifa}
            </div>
          )}

          <div className="mt-7 space-y-4">

            {profesionales.map(
              (profesional) => {
                const tarifaActual =
                  tarifas
                    .filter(
                      (tarifa) =>
                        Number(
                          tarifa.profesional_id
                        ) ===
                        Number(profesional.id)
                    )
                    .sort((a, b) =>
                      b.vigente_desde.localeCompare(
                        a.vigente_desde
                      )
                    )[0];

                return (
                  <div
                    key={profesional.id}
                    className="rounded-[24px] border border-black/5 bg-gray-50/70 p-5"
                  >

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

                      <div className="min-w-[220px]">

                        <h3 className="font-semibold text-[var(--text)]">
                          {profesional.nombre}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Tarifa actual:{" "}
                          <span className="font-semibold text-[var(--sage-dark)]">
                            {tarifaActual
                              ? `${formatearPesos(
                                  tarifaActual.valor_hora
                                )} / hora`
                              : "Sin configurar"}
                          </span>
                        </p>

                        {tarifaActual && (
                          <p className="mt-1 text-xs text-gray-400">
                            Vigente desde{" "}
                            {formatearFecha(
                              tarifaActual.vigente_desde
                            )}
                          </p>
                        )}

                      </div>

                      <div className="grid flex-1 gap-3 sm:grid-cols-3">

                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">
                            Nuevo valor por hora
                          </label>

                          <input
                            type="number"
                            min="0"
                            placeholder="Ej: 8000"
                            value={
                              valoresTarifas[
                                profesional.id
                              ] ?? ""
                            }
                            onChange={(e) =>
                              setValoresTarifas(
                                (prev) => ({
                                  ...prev,
                                  [profesional.id]:
                                    e.target.value,
                                })
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--sage)]"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-500">
                            Vigente desde
                          </label>

                          <input
                            type="date"
                            value={
                              fechasTarifas[
                                profesional.id
                              ] ?? ""
                            }
                            onChange={(e) =>
                              setFechasTarifas(
                                (prev) => ({
                                  ...prev,
                                  [profesional.id]:
                                    e.target.value,
                                })
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--sage)]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            guardarTarifa(
                              profesional.id
                            )
                          }
                          disabled={
                            guardandoTarifa ===
                            profesional.id
                          }
                          className="self-end rounded-xl bg-[var(--sage-dark)] px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                        >
                          {guardandoTarifa ===
                          profesional.id
                            ? "Guardando..."
                            : "Guardar tarifa"}
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        )}

        {/* HORAS POR PROFESIONAL */}

        {seccionAdmin === "resumen" && (
        <div className="mt-10">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
              <Users size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[var(--text)]">
                Horas por profesional
              </h2>

              <p className="mt-1 text-gray-500">
                Horas confirmadas dentro del período seleccionado.
              </p>
            </div>

          </div>

          {mensajeLiquidacion && (
            <div className="mt-5 rounded-2xl bg-[var(--sage-light)] px-5 py-4 text-sm text-[var(--sage-dark)]">
              {mensajeLiquidacion}
            </div>
          )}

          {resumenProfesionales.length ===
          0 ? (
            <div className="mt-6 rounded-[28px] bg-white p-8 shadow-sm">
              <p className="text-gray-500">
                No hay horas confirmadas en este período.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {resumenProfesionales.map(
                (profesional) => {
                  const liquidacion =
                    obtenerLiquidacionPeriodo(
                      profesional.id
                    );

                  return (
                    <div
                      key={profesional.id}
                      className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text)]">
                            {profesional.nombre}
                          </h3>

                          <p className="mt-1 text-sm text-gray-400">
                            {profesional.especialidad}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[var(--sage-light)] px-4 py-3 text-center">

                          <p className="text-2xl font-semibold text-[var(--sage-dark)]">
                            {profesional.horas}
                          </p>

                          <p className="text-xs font-medium text-[var(--sage-dark)]">
                            horas
                          </p>

                        </div>

                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">

                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-xs text-gray-400">
                            Pacientes
                          </p>

                          <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                            {profesional.pacientes}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                          <p className="text-xs text-gray-400">
                            Reservas internas
                          </p>

                          <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                            {profesional.reservasInternas}
                          </p>
                        </div>

                      </div>

                      <div className="mt-4 rounded-2xl bg-[var(--sage-light)] p-5">

                        <p className="text-xs font-medium uppercase tracking-wider text-[var(--sage-dark)]">
                          Total del período
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-[var(--sage-dark)]">
                          {formatearPesos(
                            profesional.total
                          )}
                        </p>

                        {profesional.horasSinTarifa >
                          0 && (
                          <p className="mt-2 text-xs text-gray-500">
                            {profesional.horasSinTarifa} hora(s) sin tarifa configurada.
                          </p>
                        )}

                      </div>

                      {fechaDesde &&
                        fechaHasta && (
                          <div className="mt-4">

                            {liquidacion ? (
                              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">

                                <div className="flex items-center gap-2 text-green-700">
                                  <CheckCircle2 size={18} />

                                  <span className="font-medium">
                                    Liquidación generada
                                  </span>
                                </div>

                                <p className="mt-2 text-sm text-green-700/80">
                                  {formatearFecha(
                                    liquidacion.periodo_desde
                                  )}{" "}
                                  al{" "}
                                  {formatearFecha(
                                    liquidacion.periodo_hasta
                                  )}
                                </p>

                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  generarLiquidacion(
                                    profesional.id
                                  )
                                }
                                disabled={
                                  generandoLiquidacion ===
                                  profesional.id
                                }
                                className="w-full rounded-xl bg-[var(--sage-dark)] px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                              >
                                {generandoLiquidacion ===
                                profesional.id
                                  ? "Generando..."
                                  : "Generar liquidación"}
                              </button>
                            )}

                          </div>
                        )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        )}

        {/* LIQUIDACIONES Y PAGOS */}

        {seccionAdmin === "liquidaciones" && (
        <div className="mt-8">

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-[var(--sage-light)] p-3 text-[var(--sage-dark)]">
              <Wallet size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[var(--text)]">
                Liquidaciones y pagos
              </h2>

              <p className="mt-1 text-gray-500">
                Control de deuda y pagos de los profesionales.
              </p>
            </div>

          </div>

          {mensajePago && (
            <div className="mt-5 rounded-2xl bg-[var(--sage-light)] px-5 py-4 text-sm text-[var(--sage-dark)]">
              {mensajePago}
            </div>
          )}

          {liquidacionesFiltradas.length ===
          0 ? (
            <div className="mt-6 rounded-[28px] bg-white p-8 shadow-sm">
              <p className="text-gray-500">
                No hay liquidaciones para mostrar.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">

              {liquidacionesFiltradas.map(
                (liquidacion) => {
                  const historial =
                    pagosLiquidacion(
                      liquidacion.id
                    );

                  const pagada =
                    liquidacion.estado_pago ===
                    "pagado";

                  return (
                    <div
                      key={liquidacion.id}
                      className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="text-xl font-semibold text-[var(--text)]">
                              {liquidacion.profesional_nombre}
                            </h3>

                            <span
                              className={`
                                rounded-full
                                px-3 py-1
                                text-xs
                                font-semibold
                                uppercase
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

                          <p className="mt-1 text-sm text-gray-400">
                            {liquidacion.especialidad}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">

                            <span>
                              {formatearFecha(
                                liquidacion.periodo_desde
                              )}{" "}
                              al{" "}
                              {formatearFecha(
                                liquidacion.periodo_hasta
                              )}
                            </span>

                            <span>
                              {liquidacion.horas} h
                            </span>

                          </div>

                        </div>

                        <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[520px]">

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

                          <div className="rounded-2xl bg-gray-50 p-4">
                            <p className="text-xs text-gray-400">
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

                      {!pagada && (
                        <div className="mt-6 rounded-2xl border border-black/5 bg-gray-50 p-5">

                          <div className="flex items-center gap-2">
                            <DollarSign
                              size={19}
                              className="text-[var(--sage-dark)]"
                            />

                            <h4 className="font-semibold text-[var(--text)]">
                              Registrar pago
                            </h4>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-4">

                            <input
                              type="number"
                              min="0"
                              max={
                                liquidacion.saldo
                              }
                              placeholder="Monto"
                              value={
                                montosPago[
                                  liquidacion.id
                                ] ?? ""
                              }
                              onChange={(e) =>
                                setMontosPago(
                                  (prev) => ({
                                    ...prev,
                                    [liquidacion.id]:
                                      e.target.value,
                                  })
                                )
                              }
                              className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--sage)]"
                            />

                            <input
                              type="date"
                              value={
                                fechasPago[
                                  liquidacion.id
                                ] ??
                                obtenerHoyArgentina()
                              }
                              onChange={(e) =>
                                setFechasPago(
                                  (prev) => ({
                                    ...prev,
                                    [liquidacion.id]:
                                      e.target.value,
                                  })
                                )
                              }
                              className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--sage)]"
                            />

                            <input
                              type="text"
                              placeholder="Observación opcional"
                              value={
                                observacionesPago[
                                  liquidacion.id
                                ] ?? ""
                              }
                              onChange={(e) =>
                                setObservacionesPago(
                                  (prev) => ({
                                    ...prev,
                                    [liquidacion.id]:
                                      e.target.value,
                                  })
                                )
                              }
                              className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[var(--sage)]"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                registrarPago(
                                  liquidacion
                                )
                              }
                              disabled={
                                guardandoPago ===
                                liquidacion.id
                              }
                              className="rounded-xl bg-[var(--sage-dark)] px-5 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                              {guardandoPago ===
                              liquidacion.id
                                ? "Guardando..."
                                : "Registrar pago"}
                            </button>

                          </div>

                        </div>
                      )}

                      {/* HISTORIAL */}

                      {historial.length > 0 && (
                        <div className="mt-6">

                          <div className="flex items-center gap-2">

                            <ReceiptText
                              size={18}
                              className="text-[var(--sage)]"
                            />

                            <h4 className="font-semibold text-[var(--text)]">
                              Historial de pagos
                            </h4>

                          </div>

                          <div className="mt-3 space-y-2">

                            {historial.map(
                              (pago) => (
                                <div
                                  key={pago.id}
                                  className="flex flex-col gap-1 rounded-xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >

                                  <div>
                                    <p className="font-medium text-[var(--text)]">
                                      {formatearPesos(
                                        pago.monto
                                      )}
                                    </p>

                                    {pago.observaciones && (
                                      <p className="mt-1 text-xs text-gray-400">
                                        {pago.observaciones}
                                      </p>
                                    )}
                                  </div>

                                  <p className="text-sm text-gray-500">
                                    {formatearFecha(
                                      pago.fecha_pago
                                    )}
                                  </p>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        )}

        {/* HISTORIAL RESERVAS */}

        {seccionAdmin === "reservas" && (
        <div className="mt-8">

          <h2 className="text-2xl font-semibold text-[var(--text)]">
            Reservas y turnos
          </h2>

          <p className="mt-2 text-gray-500">
            {reservasFiltradas.length} registros encontrados.
          </p>

          {cargando ? (
            <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
              <p className="text-gray-500">
                Cargando reservas...
              </p>
            </div>
          ) : reservasFiltradas.length ===
            0 ? (
            <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
              <p className="text-gray-500">
                No hay reservas para mostrar.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">

              {reservasFiltradas.map(
                (reserva) => (
                  <div
                    key={reserva.id}
                    className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm"
                  >

                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="text-lg font-semibold text-[var(--text)]">
                        {reserva.profesional_nombre}
                      </h3>

                      <span
                        className={`
                          rounded-full px-3 py-1
                          text-xs font-semibold uppercase
                          ${
                            reserva.tipo_reserva ===
                            "profesional"
                              ? "bg-[var(--sage-light)] text-[var(--sage-dark)]"
                              : "bg-blue-50 text-blue-600"
                          }
                        `}
                      >
                        {reserva.tipo_reserva ===
                        "profesional"
                          ? "Reserva profesional"
                          : "Paciente"}
                      </span>

                      <span
                        className={`
                          rounded-full px-3 py-1
                          text-xs font-semibold uppercase
                          ${
                            reserva.estado ===
                            "confirmado"
                              ? "bg-green-50 text-green-700"
                              : ""
                          }
                          ${
                            reserva.estado ===
                            "pendiente"
                              ? "bg-amber-50 text-amber-700"
                              : ""
                          }
                          ${
                            reserva.estado ===
                            "rechazado"
                              ? "bg-red-50 text-red-600"
                              : ""
                          }
                          ${
                            reserva.estado ===
                            "cancelado"
                              ? "bg-gray-100 text-gray-600"
                              : ""
                          }
                        `}
                      >
                        {reserva.estado}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-gray-400">
                      {reserva.especialidad}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-gray-600">

                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={18}
                          className="text-[var(--sage)]"
                        />

                        {formatearFecha(
                          reserva.fecha
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock
                          size={18}
                          className="text-[var(--sage)]"
                        />

                        {formatearHora(
                          reserva.hora
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Building2
                          size={18}
                          className="text-[var(--sage)]"
                        />

                        Consultorio{" "}
                        {reserva.consultorio_id}
                      </div>

                      {reserva.tipo_reserva !==
                        "profesional" &&
                        reserva.nombre_paciente && (
                          <div className="flex items-center gap-2">

                            <UserRound
                              size={18}
                              className="text-[var(--sage)]"
                            />

                            {reserva.nombre_paciente}

                          </div>
                        )}

                    </div>

                    {reserva.motivo_reserva && (
                      <p className="mt-4 text-sm text-gray-500">
                        Motivo:{" "}
                        {reserva.motivo_reserva}
                      </p>
                    )}

                    {reserva.estado ===
                      "confirmado" && (
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">

                        <span className="rounded-full bg-gray-50 px-3 py-1.5 text-gray-500">
                          Valor hora:{" "}
                          {Number(
                            reserva.valor_hora ??
                              0
                          ) > 0
                            ? formatearPesos(
                                reserva.valor_hora
                              )
                            : "Sin tarifa"}
                        </span>

                        <span className="rounded-full bg-[var(--sage-light)] px-3 py-1.5 font-medium text-[var(--sage-dark)]">
                          Importe:{" "}
                          {formatearPesos(
                            reserva.importe
                          )}
                        </span>

                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </div>

        )}

      </div>
    </div>
  );
}

export default PanelAdmin;