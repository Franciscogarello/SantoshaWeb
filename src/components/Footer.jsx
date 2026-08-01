import logo from "../assets/logo.png";
import {
  MapPin,
  MessageCircle,
  ArrowUp,
  Camera,
} from "lucide-react";
import contacto from "../data/contacto";

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[var(--sage-dark)] text-[var(--cream)]">
      {/* Detalles de fondo */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 w-96 h-96 rounded-full bg-[#8BA784]/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-8">

        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">

          {/* Marca */}
          <div className="lg:col-span-2">
            <a href="#inicio" className="inline-block">
              <img
                src={logo}
                alt="Logo Santosha"
                className="h-20 brightness-0 invert"
              />
            </a>

            <p className="mt-6 max-w-md text-[#DDE7DA] leading-8">
              Un espacio de luz para respirar, reconectar y encontrar
              bienestar a través de prácticas conscientes.
            </p>

            <a
              href="#contacto"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F8F5F0] px-6 py-3 font-medium text-[#3F6640] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
            >
              <MessageCircle size={19} />
              Comenzá tu práctica
            </a>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Navegación
            </h3>

            <nav className="mt-6 flex flex-col items-start gap-4 text-[#DDE7DA]">
              <a href="#inicio" className="transition hover:text-white">
                Inicio
              </a>

              <a href="#nosotros" className="transition hover:text-white">
                Nosotros
              </a>

              <a href="#actividades" className="transition hover:text-white">
                Actividades
              </a>

              <a href="#espacio" className="transition hover:text-white">
                Espacio
              </a>

              <a href="#contacto" className="transition hover:text-white">
                Contacto
              </a>
            </nav>
          </div>

          {/* Contacto y redes */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Encontranos
            </h3>

            <div className="mt-6 space-y-5 text-[#DDE7DA]">
              <a
                href="#contacto"
                className="flex items-start gap-3 transition hover:text-white"
              >
                <MapPin size={21} className="mt-1 shrink-0" />
                <span>Santa Fe, Argentina</span>
              </a>

              <a
                href={contacto.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-white"
              >
                <Camera size={21} />
                <span>{contacto.instagramVisible}</span>
              </a>

              <a
                href={contacto.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition hover:text-white"
              >
                <MessageCircle size={21} />
                <span>WhatsApp</span>
              </a>
              <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              contacto.direccion
  )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 transition hover:text-white"
>
  <MapPin size={21} className="mt-1 shrink-0" />
  <span>{contacto.direccion}</span>
</a>
            </div>
          </div>

        </div>

        {/* Parte inferior */}
        <div className="mt-16 flex flex-col gap-5 border-t border-white/15 pt-7 text-sm text-[#BFCDBD] sm:flex-row sm:items-center sm:justify-between">

          <p>
            © 2026 Santosha · Todos los derechos reservados.
          </p>

          <a
            href="#inicio"
            className="inline-flex items-center gap-2 self-start transition hover:text-white sm:self-auto"
          >
            Volver arriba
            <ArrowUp size={17} />
          </a>

        </div>

      </div>
    </footer>
  );
}

export default Footer;