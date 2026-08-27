const crearWhatsApp = (numero, especialidad, profesional) => {
  const mensaje = `Hola ${profesional}, vi tu contacto de ${especialidad} en la web de Santosha y quería hacer una consulta.`;

  return `https://wa.me/549${numero}?text=${encodeURIComponent(mensaje)}`;
};

const consultorios = [
  {
    especialidad: "Psicología",
    profesional: "Agostina Garello",
    whatsapp: crearWhatsApp(
      "3425140926",
      "Psicología",
      "Agostina"
    ),
  },

  {
    especialidad: "Psicología",
    profesional: "Nicolás Borgia",
    whatsapp: crearWhatsApp(
      "3425053969",
      "Psicología",
      "Nicolás"
    ),
  },

  {
    especialidad: "Nutrición",
    profesional: "Camila Condori",
    whatsapp: crearWhatsApp(
      "3425437050",
      "Nutrición",
      "Camila"
    ),
  },

  {
    especialidad: "Masajes",
    profesional: "Paola Gillaza",
    whatsapp: crearWhatsApp(
      "3424661407",
      "Masajes",
      "Paola"
    ),
  },

  {
    especialidad: "Terapias Holísticas",
    profesional: "Paola Peralta",
    whatsapp: crearWhatsApp(
      "3425242838",
      "Terapias Holísticas",
      "Paola"
    ),
  },
];

export default consultorios;