import testimonios from "../data/testimonios";
import TestimonialCard from "./TestimonialCard";
import SectionTitle from "./SectionTitle";

function Testimonials() {
  return (
    <section
      id="testimonios"
      className="bg-white py-28"
    >
      <div className="max-w-7xl mx-auto px-8">

        <SectionTitle
          eyebrow="Opiniones"
          title="Lo que dicen nuestros alumnos"
          subtitle="Cada experiencia refleja el ambiente y la dedicación que buscamos brindar en Santosha."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {testimonios.map((testimonio, index) => (
            <TestimonialCard
              key={testimonio.nombre}
              delay={index * 120}
              {...testimonio}
            />
          ))}

        </div>

      </div>
    </section>
  );
}

export default Testimonials;