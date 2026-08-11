import { useState } from "react";
import ActivityCard from "./ActivityCard";
import actividades from "../data/actividades";
import SectionTitle from "./SectionTitle";

function Activities() {
  const [filtro, setFiltro] = useState("Todas");

  const categorias = [
    "Todas",
    "Yoga",
    "Biodanza",
    "Movimiento",
    "Preparación",
  ];

  const actividadesFiltradas =
    filtro === "Todas"
      ? actividades
      : actividades.filter(
          (actividad) => actividad.categoria === filtro
        );

  return (
    <section
      id="actividades"
      data-aos="fade-up"
      className="scroll-mt-24 bg-[#F8F5F0] py-28"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <SectionTitle
          title="Nuestras disciplinas"
          subtitle="Elegí la práctica que mejor acompañe tu momento."
        />

        {/* Filtros */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              type="button"
              onClick={() => setFiltro(categoria)}
              className={`rounded-full px-5 py-2.5 font-medium transition-all duration-300 ${
                filtro === categoria
                  ? "bg-[var(--sage)] text-white shadow-md"
                  : "border border-black/5 bg-white text-[var(--text)] hover:bg-[var(--cream-dark)]"
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        {/* Actividades */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {actividadesFiltradas.map((actividad, index) => (
            <ActivityCard
              key={`${actividad.disciplina}-${actividad.profesor}`}
              delay={index * 100}
              {...actividad}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default Activities;