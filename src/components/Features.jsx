import { Leaf, Sparkles } from "lucide-react";

function Features() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Texto principal */}
          <div>
            <span className="uppercase tracking-[5px] text-[var(--sage)] font-semibold text-sm sm:text-base">
              Conocé Santosha
            </span>

            <h2 className="mt-5 text-4xl sm:text-5xl font-semibold leading-tight text-[var(--text)]">
              Un espacio creado para acompañarte.
            </h2>

            <p className="mt-7 text-base sm:text-lg leading-8 text-gray-600">
              Santosha nace como un lugar de encuentro, calma y movimiento
              consciente. Un espacio pensado para que puedas detenerte,
              respirar y reconectar con vos mismo.
            </p>

            <p className="mt-5 text-base sm:text-lg leading-8 text-gray-600">
              Cada práctica busca respetar tus tiempos y acompañarte en el
              camino hacia un mayor bienestar físico, mental y emocional.
            </p>
          </div>

          {/* Frase destacada */}
          <div className="relative overflow-hidden rounded-[36px] bg-[var(--sage-dark)] px-8 py-12 sm:px-12 sm:py-16 text-[var(--cream)] shadow-xl">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <Leaf
              size={36}
              className="relative text-[var(--sage-light)]"
            />

            <blockquote className="relative mt-8 text-2xl sm:text-3xl font-medium leading-relaxed">
              “No se trata de llegar más lejos, sino de volver a habitarte.”
            </blockquote>

            <div className="relative mt-8 flex items-center gap-3 text-[var(--cream-dark)]">
              <Sparkles size={19} />
              <span>Espacio Santosha</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Features;