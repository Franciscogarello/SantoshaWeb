import { useState } from "react";
import { Camera, MapPin, Phone, Send } from "lucide-react";
import contacto from "../data/contacto";

function Contact() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const [enviado, setEnviado] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Por ahora solo simulamos el envío.
    console.log("Consulta enviada:", formData);

    setEnviado(true);

    setFormData({
      nombre: "",
      email: "",
      mensaje: "",
    });

    setTimeout(() => {
      setEnviado(false);
    }, 4000);
  };

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

        {/* Contacto y formulario */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-12">

          {/* Datos de contacto */}
          <div
            data-aos="fade-right"
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

          {/* Formulario */}
          <form
            data-aos="fade-left"
            onSubmit={handleSubmit}
            className="rounded-[32px] bg-white p-7 shadow-lg sm:p-10"
          >
            <div>
              <label
                htmlFor="nombre"
                className="block font-medium text-[var(--text)]"
              >
                Nombre
              </label>

              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre"
                className="mt-3 w-full rounded-2xl border border-gray-200 bg-[#FAFAF8] px-5 py-4 outline-none transition focus:border-[var(--sage)] focus:ring-4 focus:ring-[var(--sage-light)]/20"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="email"
                className="block font-medium text-[var(--text)]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tunombre@email.com"
                className="mt-3 w-full rounded-2xl border border-gray-200 bg-[#FAFAF8] px-5 py-4 outline-none transition focus:border-[var(--sage)] focus:ring-4 focus:ring-[var(--sage-light)]/20"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="mensaje"
                className="block font-medium text-[var(--text)]"
              >
                Mensaje
              </label>

              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Contanos en qué actividad estás interesado..."
                className="mt-3 w-full resize-none rounded-2xl border border-gray-200 bg-[#FAFAF8] px-5 py-4 outline-none transition focus:border-[var(--sage)] focus:ring-4 focus:ring-[var(--sage-light)]/20"
              />
            </div>

            <button
              type="submit"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sage)] px-7 py-4 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--sage-dark)] hover:shadow-xl"
            >
              <Send size={19} />
              Enviar consulta
            </button>

            {enviado && (
              <p className="mt-5 rounded-2xl bg-green-50 px-5 py-4 text-center font-medium text-green-700">
                ¡Gracias! Tu consulta fue registrada.
              </p>
            )}
          </form>

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