import {
  Brain,
  Apple,
  Hand,
  Sparkles,
  MessageCircle,
} from "lucide-react";

import consultorios from "../data/consultorios";
import SectionTitle from "./SectionTitle";

function Consultorios() {
  const getIcon = (especialidad) => {
    if (especialidad === "Psicología") {
      return <Brain size={24} />;
    }

    if (especialidad === "Nutrición") {
      return <Apple size={24} />;
    }

    if (especialidad === "Masajes") {
      return <Hand size={24} />;
    }

    return <Sparkles size={24} />;
  };

  return (
    <section
      id="consultorios"
      className="scroll-mt-24 bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">

        <SectionTitle
          eyebrow="Consultorios"
          title="Profesionales que acompañan tu bienestar"
          subtitle="En Santosha también encontrás espacios de atención profesional pensados para acompañarte desde distintas disciplinas."
        />

        <div
          data-aos="fade-up"
          className="mt-14 overflow-hidden rounded-[32px] border border-black/5 bg-[var(--cream)] shadow-lg"
        >
          {consultorios.map((consultorio, index) => (
            <div
              key={`${consultorio.especialidad}-${consultorio.profesional}`}
              className={`
                flex
                flex-col
                gap-5
                px-6
                py-7
                transition-colors
                duration-300
                hover:bg-white
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-8
                ${
                  index !== consultorios.length - 1
                    ? "border-b border-black/5"
                    : ""
                }
              `}
            >
              {/* Profesional */}
              <div className="flex items-center gap-5">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sage-light)]/25 text-[var(--sage-dark)]">
                  {getIcon(consultorio.especialidad)}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[var(--text)]">
                    {consultorio.especialidad}
                  </h3>

                  <p className="mt-1 text-gray-600">
                    {consultorio.profesional}
                  </p>
                </div>

              </div>

              {/* WhatsApp */}
              {consultorio.whatsapp ? (
                <a
                  href={consultorio.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[var(--sage)]
                    px-5
                    py-2.5
                    font-medium
                    text-[var(--sage-dark)]
                    transition-all
                    duration-300
                    hover:bg-[var(--sage-dark)]
                    hover:text-white
                  "
                >
                  <MessageCircle size={18} />
                  Contactar
                </a>
              ) : (
                <span className="text-sm text-gray-400">
                  Contacto próximamente
                </span>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Consultorios;