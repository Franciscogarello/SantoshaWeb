import {
  Leaf,
  MessageCircle,
  User,
  Calendar,
  Clock,
} from "lucide-react";

function ActivityCard({
  disciplina,
  profesor,
  descripcion,
  whatsapp,
  dias = "",
  horario = "",
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

      {/* Título */}
      <h3 className="text-2xl font-semibold text-[var(--text)]">
        {disciplina}
      </h3>

      {/* Descripción */}
      <p className="mt-4 leading-7 text-gray-600">
        {descripcion}
      </p>

      {/* Información */}
      <div className="mt-8 space-y-4">

        {profesor && (
          <div className="flex items-center gap-3 text-[#4D5C4D]">
            <User
              size={18}
              className="shrink-0 text-[var(--sage)]"
            />
            <span>{profesor}</span>
          </div>
        )}

        {dias && (
          <div className="flex items-center gap-3 text-[#4D5C4D]">
            <Calendar
              size={18}
              className="shrink-0 text-[var(--sage)]"
            />
            <span>{dias}</span>
          </div>
        )}

        {horario && (
          <div className="flex items-center gap-3 text-[#4D5C4D]">
            <Clock
              size={18}
              className="shrink-0 text-[var(--sage)]"
            />
            <span>{horario}</span>
          </div>
        )}

      </div>

      {/* Empuja el botón hacia abajo */}
      <div className="flex-1" />

      {/* Botón */}
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-8
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-full
            bg-[var(--sage)]
            px-6
            py-3
            font-medium
            text-white
            transition-all
            duration-300
            hover:scale-105
            hover:bg-[var(--sage-dark)]
          "
        >
          <MessageCircle size={18} />
          Comenzá tu práctica
        </a>
      ) : (
        <div className="mt-8">
          <span className="inline-flex rounded-full bg-gray-100 px-5 py-3 text-sm font-medium text-gray-500">
            Contacto próximamente
          </span>
        </div>
      )}
    </div>
  );
}

export default ActivityCard;