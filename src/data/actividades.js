const crearWhatsApp = (numero, disciplina, profesor) => {
  const mensaje = `Hola ${profesor}, vi la actividad de ${disciplina} en la web de Santosha y quería consultar por las clases.`;

  return `https://wa.me/549${numero}?text=${encodeURIComponent(mensaje)}`;
};

const actividades = [
  {
    disciplina: "Hatha Yoga",
    categoria: "Yoga",
    profesor: "Viviana",
    descripcion:
      "Una práctica que busca el equilibrio entre cuerpo, respiración y mente a través de posturas, respiración consciente y relajación.",
    dias: "Martes y viernes",
    horario: "08:15",
    whatsapp: crearWhatsApp(
      "3424352612",
      "Hatha Yoga",
      "Viviana"
    ),
  },

  {
    disciplina: "Hatha-Ashtanga Yoga",
    categoria: "Yoga",
    profesor: "Agostina",
    descripcion:
      "Disciplina inspirada en la tradición de Krishnamacharya que combina posturas físicas (asanas), control de la respiración (pranayama) y meditación para equilibrar el cuerpo y la mente, preservando y canalizando la fuerza vital o energía.",
    horarios: [
      "Lunes y miércoles · 10:30",
      "Lunes y miércoles · 14:30",
      "Lunes y jueves · 19:00",
    ],
    whatsapp: crearWhatsApp(
      "3425140926",
      "Hatha-Ashtanga Yoga",
      "Agostina"
    ),
  },

  {
    disciplina: "Yoga adultos mayores",
    categoria: "Yoga",
    profesor: "Andrea y Mariela",
    descripcion:
      "Una práctica accesible y adaptada que, mediante movimientos suaves y diferentes elementos, favorece la flexibilidad, movilidad, equilibrio, fuerza y coordinación.",
    horarios: [
      "Lunes y miércoles · 16:30",
      "Martes y jueves · 10:00",
    ],
    whatsapp: crearWhatsApp(
      "3424084322",
      "Yoga adultos mayores",
      "Andrea y Mariela"
    ),
  },

  {
    disciplina: "Yoga niños",
    categoria: "Yoga",
    profesor: "Vanina y María Laura",
    descripcion:
      "Una invitación a relajarse y divertirse mientras desarrollamos fuerza, coordinación, flexibilidad, equilibrio, conciencia corporal y emocional favoreciendo la autoconfianza.",
    dias: "Miércoles",
    horario: "18:15",
    whatsapp: crearWhatsApp(
      "3425053004",
      "Yoga niños",
      "Vanina y María Laura"
    ),
  },

  {
    disciplina: "Tai Chi Chuan - Chi Kung",
    categoria: "Movimiento",
    profesor: "Damián",
    descripcion:
      "Disciplinas milenarias chinas que integran el trabajo interno y físico, favoreciendo el movimiento, el equilibrio y la conexión con nuestro interior.",
    dias: "Martes y viernes",
    horario: "16:15",
    whatsapp: crearWhatsApp(
      "3424083695",
      "Tai Chi Chuan - Chi Kung",
      "Damián"
    ),
  },

  {
    disciplina: "Gimnasia integral",
    categoria: "Movimiento",
    profesor: "Adriana",
    descripcion:
      "Una actividad que combina movimiento, fuerza y flexibilidad con técnicas de Pilates, enfocada en la armonía de las posturas y el bienestar general.",
    dias: "Viernes",
    horario: "10:00",
    whatsapp: crearWhatsApp(
      "3425058282",
      "Gimnasia integral",
      "Adriana"
    ),
  },

  {
    disciplina: "Preparación para el nacimiento",
    categoria: "Preparación",
    profesor: "Licenciadas en Obstetricia",
    descripcion:
      "Un espacio para mujeres y parejas desde las 28 semanas de gestación, pensado para sentirse acompañadas, compartir el proceso y prepararse para el nacimiento.",
    dias: "Viernes",
    horario: "18:30",
    whatsapp: crearWhatsApp(
      "3426142083",
      "Preparación para el nacimiento",
      "Dina"
    ),
  },

  {
    disciplina: "Biodanza",
    categoria: "Biodanza",
    profesor: "Graciela",
    descripcion:
      "Una práctica grupal que invita a percibirnos y vincularnos de una manera más profunda, buscando el equilibrio entre lo individual y lo colectivo. No requiere saber bailar.",
    dias: "Miércoles",
    horario: "19:45",
    whatsapp: crearWhatsApp(
      "3424081106",
      "Biodanza",
      "Graciela"
    ),
  },

  {
    disciplina: "Biodanza",
    categoria: "Biodanza",
    profesor: "Milagros y Raquel",
    descripcion:
      "Una propuesta que integra ciencia y arte para potenciar nuestra identidad, despertar la alegría y el placer de movernos y fortalecer la vinculación con los demás.",
    dias: "Miércoles",
    horario: "19:45",
    whatsapp: crearWhatsApp(
      "3424494977",
      "Biodanza",
      "Milagros y Raquel"
    ),
  },
];

export default actividades;