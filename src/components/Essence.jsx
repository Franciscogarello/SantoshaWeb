import { Heart, Leaf, Sparkles } from "lucide-react";

function Essence() {
  return (
    <section
      id="nosotros"
      className="scroll-mt-24 bg-[#F8F5F0] py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <div className="text-center">

          <span className="uppercase tracking-[4px] sm:tracking-[5px] text-[var(--sage)] font-semibold text-sm sm:text-base">
            Nuestra esencia
          </span>

          <h2 className="mt-5 text-4xl sm:text-5xl font-semibold leading-tight text-[var(--text)]">
            Un espacio para volver a vos.
          </h2>

          <p className="max-w-3xl mx-auto mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-gray-600 leading-7 sm:leading-8 md:leading-9">
            En Santosha creemos que el bienestar comienza cuando encontramos
            un momento para detenernos, respirar y escucharnos. Cada práctica
            es una invitación a conectar con el cuerpo, la mente y la calma.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mt-12 md:mt-20">

          <div className="bg-white rounded-3xl p-7 sm:p-8 md:p-10 shadow-md text-center hover:-translate-y-2 transition-all duration-300">
            <Leaf
              size={38}
              className="mx-auto text-[var(--sage)]"
            />

            <h3 className="text-xl sm:text-2xl font-semibold mt-5">
              Bienestar
            </h3>

            <p className="text-gray-600 mt-4 leading-7">
              Un espacio pensado para cuidar cuerpo, mente y emociones.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 sm:p-8 md:p-10 shadow-md text-center hover:-translate-y-2 transition-all duration-300">
            <Heart
              size={38}
              className="mx-auto text-[var(--sage)]"
            />

            <h3 className="text-xl sm:text-2xl font-semibold mt-5">
              Comunidad
            </h3>

            <p className="text-gray-600 mt-4 leading-7">
              Personas que comparten un camino de crecimiento y respeto.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 sm:p-8 md:p-10 shadow-md text-center hover:-translate-y-2 transition-all duration-300">
            <Sparkles
              size={38}
              className="mx-auto text-[var(--sage)]"
            />

            <h3 className="text-xl sm:text-2xl font-semibold mt-5">
              Equilibrio
            </h3>

            <p className="text-gray-600 mt-4 leading-7">
              Cada encuentro busca ayudarte a encontrar tu propio ritmo.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Essence;