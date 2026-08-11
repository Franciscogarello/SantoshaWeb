import { Camera, MapPin, Phone } from "lucide-react";
import contacto from "../data/contacto";

function Contact() {
  return (
    <section
      id="contacto"
      className="scroll-mt-24 bg-[var(--cream)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Encabezado */}
        <div data-aos="fade-up" className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[4px] text-[var(--sage)] sm:text-base sm:tracking-[5px]">
            Contacto
          </span>

          <h2 className="mt-5 text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl md:text-5xl">
            Te esperamos en Santosha
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:mt-8 sm:text-lg sm:leading-8 md:text-xl">
            Escribinos para conocer las actividades, consultar horarios o
            encontrar la práctica que mejor acompañe tu momento.
          </p>
        </div>

        {/* Datos de contacto */}
        <div className="mx-auto mt-12 max-w-3xl lg:mt-16">
          <div
            data-aos="fade-up"
            className="rounded-[32px] bg-[var(--sage-dark)] p-7 text-[var(--cream)] shadow-xl sm:p-10"
          >
            <h3 className="text-2xl font-semibold">
              Hablemos
            </h3>

            <p className="mt-4 max-w-md leading-7 text-white/80">
              Podés comunicarte por cualquiera de estos medios. Vamos a
              responderte lo antes posible.
            </p>

            <div className="mt-10 space-y-5">

              {/* Dirección */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  contacto.direccion
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-white/10"
              >
                <div className="shrink-0 rounded-2xl bg-white/10 p-3">
                  <MapPin size={23} />
                </div>

                <div>
                  <h4 className="font-semibold">
                    Dirección
                  </h4>

                  <p className="mt-1 text-white/75">
                    {contacto.direccion}
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    Tocá para ver cómo llegar.
                  </p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={contacto.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-white/10"
              >
                <div className="shrink-0 rounded-2xl bg-white/10 p-3">
                  <Phone size={23} />
                </div>

                <div>
                  <h4 className="font-semibold">
                    WhatsApp
                  </h4>

                  <p className="mt-1 text-white/75">
                    {contacto.telefonoVisible}
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    Escribinos y coordinemos tu primera clase.
                  </p>
                </div>
              </a>

              {/* Instagram */}
              <a
                href={contacto.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-white/10"
              >
                <div className="shrink-0 rounded-2xl bg-white/10 p-3">
                  <Camera size={23} />
                </div>

                <div>
                  <h4 className="font-semibold">
                    Instagram
                  </h4>

                  <p className="mt-1 text-white/75">
                    {contacto.instagramVisible}
                  </p>

                  <p className="mt-1 text-sm text-white/60">
                    Seguinos para conocer nuestras novedades.
                  </p>
                </div>
              </a>

            </div>
          </div>
        </div>

        {/* Mapa */}
        <div
          data-aos="fade-up"
          className="mt-10 overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-lg md:mt-14"
        >
          <iframe
            title="Ubicación de Espacio Santosha"
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              contacto.direccion
            )}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[320px] w-full border-0 sm:h-[380px] md:h-[450px]"
          />
        </div>

      </div>
    </section>
  );
}

export default Contact;