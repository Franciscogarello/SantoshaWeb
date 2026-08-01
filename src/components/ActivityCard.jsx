import { Leaf, MessageCircle, User, Calendar, Clock } from "lucide-react";

function ActivityCard({
  disciplina,
  profesor,
  descripcion,
  whatsapp,
  dias = "Próximamente",
  horario = "A confirmar",
  delay = 0
}) {
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className="
        group
        relative
        overflow-hidden
        bg-white
        rounded-3xl
        p-8
        shadow-lg
        border
        border-[#ECE8E1]
        hover:shadow-2xl
        hover:-translate-y-3
        transition-all
        duration-500
      "
    >
      {/* Línea superior */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#5E8F5A] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

      {/* Ícono */}
      <div className="w-14 h-14 rounded-2xl bg-[#F4F8F2] flex items-center justify-center mb-6">
        <Leaf
          size={28}
          className="text-[#5E8F5A]"
        />
      </div>

      {/* Título */}
      <h3 className="text-2xl font-semibold text-[#374137]">
        {disciplina}
      </h3>

      {/* Descripción */}
      <p className="text-gray-600 mt-4 leading-7">
        {descripcion}
      </p>

      {/* Información */}
      <div className="mt-8 space-y-4">

        <div className="flex items-center gap-3 text-[#4D5C4D]">
          <User size={18} className="text-[#5E8F5A]" />
          <span>{profesor}</span>
        </div>

        <div className="flex items-center gap-3 text-[#4D5C4D]">
          <Calendar size={18} className="text-[#5E8F5A]" />
          <span>{dias}</span>
        </div>

        <div className="flex items-center gap-3 text-[#4D5C4D]">
          <Clock size={18} className="text-[#5E8F5A]" />
          <span>{horario}</span>
        </div>

      </div>

      {/* Botón */}
      <a
        href={whatsapp}
        className="
          mt-8
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-[#5E8F5A]
          px-6
          py-3
          text-white
          font-medium
          transition-all
          duration-300
          hover:bg-[#3F6640]
          hover:scale-105
        "
      >
        <MessageCircle size={18} />
        Comenzá tu práctica
      </a>
    </div>
  );
}

export default ActivityCard;