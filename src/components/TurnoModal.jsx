import { useEffect, useState } from "react";
import {
  X,
  CalendarDays,
  Clock,
  User,
  Phone,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function TurnoModal({ profesional, onClose }) {
  const [fecha, setFecha] = useState("");
  const [horario, setHorario] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const [profesionalId, setProfesionalId] = useState(null);
  const [consultorioId, setConsultorioId] = useState(null);

  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const [profesionalAusente, setProfesionalAusente] =
    useState(false);

  // =========================================================
  // BUSCAR PROFESIONAL
  // =========================================================

  useEffect(() => {
    const buscarProfesional = async () => {
      const { data, error } = await supabase
        .from("profesionales")
        .select("id, consultorio_id")
        .eq("nombre", profesional.profesional)
        .single();

      if (error) {
        console.error("Error buscando profesional:", error);
        return;
      }

      setProfesionalId(data.id);
      setConsultorioId(data.consultorio_id);
    };

    if (profesional?.profesional) {
      buscarProfesional();
    }
  }, [profesional]);

  // =========================================================
  // CARGAR DISPONIBILIDAD
  // =========================================================

  useEffect(() => {
    const cargarDisponibilidad = async () => {
      if (!fecha || !profesionalId || !consultorioId) {
        setHorarios([]);
        setProfesionalAusente(false);
        return;
      }

      setCargandoHorarios(true);
      setHorario("");
      setHorarios([]);
      setProfesionalAusente(false);

      // =====================================================
      // 1. COMPROBAR AUSENCIA
      // =====================================================

      const {
        data: estaAusente,
        error: ausenciaError,
      } = await supabase.rpc("profesional_ausente", {
        p_profesional_id: profesionalId,
        p_fecha: fecha,
      });

      if (ausenciaError) {
        console.error(
          "Error consultando ausencia:",
          ausenciaError
        );

        setHorarios([]);
        setCargandoHorarios(false);
        return;
      }

      // Si el profesional bloqueó ese día,
      // detenemos todo acá.
      if (estaAusente) {
        setProfesionalAusente(true);
        setHorarios([]);
        setCargandoHorarios(false);
        return;
      }

      // =====================================================
      // 2. OBTENER DÍA DE LA SEMANA
      // =====================================================

      const [anio, mes, dia] = fecha.split("-").map(Number);

      const fechaLocal = new Date(
        anio,
        mes - 1,
        dia
      );

      const diaSemana = fechaLocal.getDay();

      // Domingo o sábado
      if (diaSemana === 0 || diaSemana === 6) {
        setHorarios([]);
        setCargandoHorarios(false);
        return;
      }

      // =====================================================
      // 3. DISPONIBILIDAD SEMANAL
      // =====================================================

      const {
        data: disponibilidad,
        error: disponibilidadError,
      } = await supabase
        .from("disponibilidad")
        .select(
          "hora_inicio, hora_fin, duracion_minutos"
        )
        .eq("profesional_id", profesionalId)
        .eq("dia_semana", diaSemana)
        .eq("activo", true)
        .single();

      if (disponibilidadError) {
        console.error(
          "Error cargando disponibilidad:",
          disponibilidadError
        );

        setHorarios([]);
        setCargandoHorarios(false);
        return;
      }

      // =====================================================
      // 4. HORARIOS OCUPADOS DEL CONSULTORIO
      // =====================================================

      const {
        data: ocupados,
        error: ocupadosError,
      } = await supabase.rpc(
        "obtener_horarios_ocupados",
        {
          p_consultorio_id: consultorioId,
          p_fecha: fecha,
        }
      );

      if (ocupadosError) {
        console.error(
          "Error consultando horarios ocupados:",
          ocupadosError
        );

        setHorarios([]);
        setCargandoHorarios(false);
        return;
      }

      const horasOcupadas = (ocupados ?? []).map(
        (item) => item.hora.slice(0, 5)
      );

      // =====================================================
      // 5. GENERAR HORARIOS
      // =====================================================

      const [horaInicio, minutoInicio] =
        disponibilidad.hora_inicio
          .split(":")
          .map(Number);

      const [horaFin, minutoFin] =
        disponibilidad.hora_fin
          .split(":")
          .map(Number);

      const inicio =
        horaInicio * 60 + minutoInicio;

      const fin =
        horaFin * 60 + minutoFin;

      const duracion =
        disponibilidad.duracion_minutos;

      const opciones = [];

      let minutosActuales = inicio;

      while (
        minutosActuales + duracion <= fin
      ) {
        const horas = Math.floor(
          minutosActuales / 60
        );

        const minutos =
          minutosActuales % 60;

        const horaFormateada =
          `${String(horas).padStart(2, "0")}:${String(
            minutos
          ).padStart(2, "0")}`;

        if (
          !horasOcupadas.includes(
            horaFormateada
          )
        ) {
          opciones.push(horaFormateada);
        }

        minutosActuales += duracion;
      }

      setHorarios(opciones);
      setCargandoHorarios(false);
    };

    cargarDisponibilidad();
  }, [
    fecha,
    profesionalId,
    consultorioId,
  ]);

  // =========================================================
  // ENVIAR SOLICITUD
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !profesionalId ||
      !fecha ||
      !horario ||
      !nombre ||
      !telefono
    ) {
      alert("Completá todos los campos.");
      return;
    }

    if (profesionalAusente) {
      alert(
        "El profesional no atiende en la fecha seleccionada."
      );
      return;
    }

    const { data, error } =
      await supabase.rpc(
        "solicitar_turno",
        {
          p_profesional_id: profesionalId,
          p_fecha: fecha,
          p_hora: horario,
          p_nombre_paciente: nombre,
          p_telefono: telefono,
        }
      );

    if (error) {
      console.error(
        "Error al solicitar turno:",
        error
      );

      if (
        error.message?.includes(
          "un_turno_activo_por_consultorio"
        )
      ) {
        alert(
          "Ese horario acaba de ser ocupado. Por favor elegí otro."
        );
      } else {
        alert(
          "No pudimos enviar la solicitud. Por favor intentá nuevamente."
        );
      }

      return;
    }

    console.log(
      "Solicitud creada. ID:",
      data
    );

    alert(
      "Solicitud enviada correctamente ✅\n\nEl turno quedó pendiente de confirmación por el profesional."
    );

    onClose();
  };

  // =========================================================
  // PANTALLA
  // =========================================================

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/40 px-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          relative w-full max-w-lg
          rounded-[32px] bg-white
          p-7 shadow-2xl sm:p-9
        "
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="
            absolute right-5 top-5 z-20
            flex h-10 w-10 cursor-pointer
            items-center justify-center
            rounded-full bg-gray-100
            text-gray-600 transition
            hover:bg-gray-200
          "
        >
          <X size={20} />
        </button>

        <div className="pr-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--sage)]">
            Solicitud de turno
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-[var(--text)]">
            {profesional?.profesional}
          </h2>

          <p className="mt-2 text-gray-500">
            {profesional?.especialidad}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          {/* FECHA */}

          <div>
            <label className="mb-2 flex items-center gap-2 font-medium text-[var(--text)]">
              <CalendarDays
                size={18}
                className="text-[var(--sage)]"
              />
              Fecha
            </label>

            <input
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(e.target.value)
              }
              required
              className="
                w-full rounded-2xl
                border border-gray-200
                px-4 py-3
                outline-none transition
                focus:border-[var(--sage)]
              "
            />
          </div>

          {/* HORARIO */}

          <div>
            <label className="mb-2 flex items-center gap-2 font-medium text-[var(--text)]">
              <Clock
                size={18}
                className="text-[var(--sage)]"
              />
              Horario
            </label>

            <select
              value={horario}
              onChange={(e) =>
                setHorario(e.target.value)
              }
              required
              disabled={
                !fecha ||
                cargandoHorarios ||
                profesionalAusente ||
                horarios.length === 0
              }
              className="
                w-full rounded-2xl
                border border-gray-200
                bg-white px-4 py-3
                outline-none transition
                focus:border-[var(--sage)]
                disabled:cursor-not-allowed
                disabled:bg-gray-50
                disabled:text-gray-400
              "
            >
              {!fecha && (
                <option value="">
                  Primero seleccioná una fecha
                </option>
              )}

              {fecha &&
                cargandoHorarios && (
                  <option value="">
                    Cargando horarios...
                  </option>
                )}

              {fecha &&
                !cargandoHorarios &&
                profesionalAusente && (
                  <option value="">
                    El profesional no atiende este día
                  </option>
                )}

              {fecha &&
                !cargandoHorarios &&
                !profesionalAusente &&
                horarios.length === 0 && (
                  <option value="">
                    No hay horarios disponibles
                  </option>
                )}

              {fecha &&
                !cargandoHorarios &&
                !profesionalAusente &&
                horarios.length > 0 && (
                  <>
                    <option value="">
                      Seleccionar horario
                    </option>

                    {horarios.map((hora) => (
                      <option
                        key={hora}
                        value={hora}
                      >
                        {hora}
                      </option>
                    ))}
                  </>
                )}
            </select>

            {fecha &&
              !cargandoHorarios &&
              profesionalAusente && (
                <p className="mt-2 text-sm font-medium text-amber-600">
                  El profesional no atiende en la fecha seleccionada.
                </p>
              )}

            {fecha &&
              !cargandoHorarios &&
              !profesionalAusente &&
              horarios.length === 0 && (
                <p className="mt-2 text-sm text-gray-400">
                  No hay horarios disponibles para esa fecha.
                </p>
              )}
          </div>

          {/* NOMBRE */}

          <div>
            <label className="mb-2 flex items-center gap-2 font-medium text-[var(--text)]">
              <User
                size={18}
                className="text-[var(--sage)]"
              />
              Nombre y apellido
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ej: Juan Pérez"
              required
              className="
                w-full rounded-2xl
                border border-gray-200
                px-4 py-3
                outline-none transition
                focus:border-[var(--sage)]
              "
            />
          </div>

          {/* TELÉFONO */}

          <div>
            <label className="mb-2 flex items-center gap-2 font-medium text-[var(--text)]">
              <Phone
                size={18}
                className="text-[var(--sage)]"
              />
              Teléfono
            </label>

            <input
              type="tel"
              value={telefono}
              onChange={(e) =>
                setTelefono(e.target.value)
              }
              placeholder="Ej: 342 555 1234"
              required
              className="
                w-full rounded-2xl
                border border-gray-200
                px-4 py-3
                outline-none transition
                focus:border-[var(--sage)]
              "
            />
          </div>

          {/* ENVIAR */}

          <button
            type="submit"
            disabled={
              profesionalAusente ||
              cargandoHorarios ||
              horarios.length === 0
            }
            className="
              mt-3 w-full cursor-pointer
              rounded-full
              bg-[var(--sage-dark)]
              px-6 py-4
              font-semibold text-white
              shadow-md
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-lg
              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:hover:translate-y-0
            "
          >
            Enviar solicitud
          </button>
        </form>

        <p className="mt-5 text-center text-sm leading-6 text-gray-400">
          El turno quedará pendiente hasta ser confirmado por el profesional.
        </p>
      </div>
    </div>
  );
}

export default TurnoModal;