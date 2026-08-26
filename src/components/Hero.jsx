import heroImage from "../assets/hero.jpg";
import Button from "./Button";

function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-[100svh] overflow-hidden"
    >
      {/* Imagen de fondo */}
      <img
        src={heroImage}
        alt="Espacio Santosha"
        className="absolute inset-0 h-full w-full object-cover object-[58%_center] sm:object-center"
      />

      {/* Capas de contraste */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />

      {/* Contenido */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <div className="w-full max-w-xl">

          <span className="block text-xs font-medium uppercase tracking-[4px] text-[#EADFCF] sm:text-sm sm:tracking-[6px]">
            Espacio de luz
          </span>

          <h1 className="mt-5 text-[2.35rem] font-semibold leading-[1.08] text-white sm:text-5xl md:text-7xl">
            <span className="block">
              RESPIRA CONSCIENTEMENTE Y CULTIVA TU PRESENCIA
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/90 sm:text-lg sm:leading-8 md:text-xl">
            Un espacio pensado para conectar con vos 
            misma/o, respirar profundamente y transformar 
            cada práctica en un momento de bienestar.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4 sm:mt-10">
            <Button
              href="#contacto"
              className="w-full sm:w-auto"
            >
              Comenzá tu práctica
            </Button>

            <Button
              href="#actividades"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Ver disciplinas
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;