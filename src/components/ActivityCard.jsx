import {
  Leaf,
  User,
  Calendar,
  Clock,
  MessageCircle,
} from "lucide-react";

function ActivityCard({
  disciplina,
  profesor,
  descripcion,
  whatsapp,
  dias = "",
  horario = "",
  horarios = [],
  delay = 0,
}) {
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-[#ECE8E1]
        bg-white
        p-8
        shadow-lg
        transition-all
        duration-500
        hover:-translate-y-3
        hover:shadow-2xl
      "
    >
      {/* Línea superior */}
      <div className="absolute left-0 top-0 h-1 w-0 bg-[var(--sage)] transition-all duration-500 group-hover:w-full" />

      {/* Ícono */}
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F8F2]">
        <Leaf
          size={28}
          className="text-[var(--sage)]"
        />
      </div>

      {/* Disciplina */}
      <h3 className="text-2xl font-semibold text-[var(--text)]">
        {disciplina}
      </h3>

      {/* Descripción */}
      <p className="mt-4 leading-7 text-gray-600">
        {descripcion}
      </p>

      {/* Información */}
      <div className="mt-8 space-y-4">

        {/* Profesor */}
        {profesor && (
          <div className="flex items-center gap-3 text-[#4D5C4D]">
            <User
              size={18}
              className="shrink-0 text-[var(--sage)]"
            />
            <span>{profesor}</span>
          </div>
        )}

        {/* Días */}
        {dias && (
          <div className="flex items-center gap-3 text-[#4D5C4D]">
            <Calendar
              size={18}
              className="shrink-0 text-[var(--sage)]"
            />
            <span>{dias}</span>
          </div>
        )}

        {/* Horario simple */}
        {horario && (
          <div className="flex items-center gap-3 text-[#4D5C4D]">
            <Clock
              size={18}
              className="shrink-0 text-[var(--sage)]"
            />
            <span>{horario}</span>
          </div>
        )}

        {/* Varios horarios */}
        {horarios.length > 0 && (
          <div className="space-y-3">
            {horarios.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-[#4D5C4D]"
              >
                <Clock
                  size={18}
                  className="shrink-0 text-[var(--sage)]"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Mantiene todos los botones alineados abajo */}
      <div className="flex-1" />

      {/* WhatsApp */}
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-8
            inline-flex
            w-fit
            items-center
            justify-center
            gap-2
            rounded-full
            bg-[var(--sage-dark)]
            px-6
            py-3
            font-semibold
            text-white
            shadow-md
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[#405847]
            hover:shadow-lg
          "
        >
          <MessageCircle size={19} />
          Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}

export default ActivityCard;