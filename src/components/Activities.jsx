import ActivityCard from "./ActivityCard";
import actividades from "../data/actividades";
import SectionTitle from "./SectionTitle";

function Activities() {
  return (
    <section
      id="actividades"
      data-aos="fade-up"
      className="scroll-mt-24 bg-[#F8F5F0] py-28"
    >
      <div className="max-w-7xl mx-auto px-8">

<SectionTitle
  title="Nuestras disciplinas"
  subtitle="Elegí la práctica que mejor acompañe tu momento."
/>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {actividades.map((actividad, index) => (
            <ActivityCard
              key={actividad.disciplina}
              delay={index * 150}
              {...actividad}
            />
          ))}

        </div>

      </div>
    </section>
  );
}

export default Activities;