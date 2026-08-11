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
      "Una práctica que une movimiento, respiración y conciencia corporal.",
    dias: "Martes y viernes",
    horario: "",
    whatsapp: crearWhatsApp("3424352612", "Hatha Yoga", "Viviana"),
  },
  {
    disciplina: "Hatha Yoga",
    categoria: "Yoga",
    profesor: "Agostina",
    descripcion:
      "Una práctica para conectar con el cuerpo, la respiración y encontrar equilibrio.",
    dias: "Resto de los días",
    horario: "",
    whatsapp: crearWhatsApp("3425140926", "Hatha Yoga", "Agostina"),
  },
  {
    disciplina: "Yoga adultos mayores",
    categoria: "Yoga",
    profesor: "Andrea y Mariela",
    descripcion:
      "Una práctica adaptada para favorecer la movilidad, el equilibrio y el bienestar.",
    dias: "",
    horario: "",
    whatsapp: crearWhatsApp(
      "3424084322",
      "Yoga adultos mayores",
      "Andrea y Mariela"
    ),
  },
  {
    disciplina: "Gimnasia integral",
    categoria: "Movimiento",
    profesor: "Adriana",
    descripcion:
      "Movimiento y ejercicio integral para fortalecer el cuerpo y mejorar el bienestar.",
    dias: "Viernes",
    horario: "",
    whatsapp: crearWhatsApp(
      "3425058282",
      "Gimnasia integral",
      "Adriana"
    ),
  },
  {
    disciplina: "Pilates Mat",
    categoria: "Movimiento",
    profesor: "",
    descripcion:
      "Una práctica enfocada en fortalecer, mejorar la postura y desarrollar conciencia corporal.",
    dias: "Martes y jueves",
    horario: "14:30",
    whatsapp: "",
  },
  {
    disciplina: "Tai Chi",
    categoria: "Movimiento",
    profesor: "Damián",
    descripcion:
      "Movimiento consciente, respiración y equilibrio a través de una práctica suave y fluida.",
    dias: "",
    horario: "",
    whatsapp: crearWhatsApp("3424083695", "Tai Chi", "Damián"),
  },
  {
    disciplina: "Biodanza",
    categoria: "Biodanza",
    profesor: "Milagros y Raquel",
    descripcion:
      "Un espacio de encuentro, movimiento y expresión para conectar con uno mismo y con los demás.",
    dias: "Miércoles",
    horario: "",
    whatsapp: crearWhatsApp(
      "3424494977",
      "Biodanza",
      "Milagros y Raquel"
    ),
  },
  {
    disciplina: "Biodanza",
    categoria: "Biodanza",
    profesor: "Graciela",
    descripcion:
      "Una experiencia de movimiento y expresión que invita a conectar con las emociones y el bienestar.",
    dias: "Martes",
    horario: "",
    whatsapp: crearWhatsApp("3424081106", "Biodanza", "Graciela"),
  },
  {
    disciplina: "Preparación para el parto",
    categoria: "Preparación",
    profesor: "Dina y otras",
    descripcion:
      "Un espacio de acompañamiento y preparación consciente para transitar el embarazo y el parto.",
    dias: "",
    horario: "",
    whatsapp: crearWhatsApp(
      "3426142083",
      "Preparación para el parto",
      "Dina"
    ),
  },
  {
    disciplina: "Yoga niños",
    categoria: "Yoga",
    profesor: "Vanina y María Laura",
    descripcion:
      "Una propuesta lúdica para que los más chicos exploren el movimiento, la respiración y la calma.",
    dias: "",
    horario: "",
    whatsapp: crearWhatsApp(
      "3425053004",
      "Yoga niños",
      "Vanina y María Laura"
    ),
  },
];

export default actividades;