function GalleryCard({
  imagen,
  titulo,
  onClick,
  className = "",
  delay = 0,
}) {
  return (
    <div
      onClick={onClick}
      data-aos-delay={delay}
      data-aos="fade-up"
      className={`relative overflow-hidden rounded-3xl shadow-lg group cursor-pointer ${className}`}
    >
      <img
        src={imagen}
        alt={titulo}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <h3 className="text-xl font-semibold text-white">
          {titulo}
        </h3>
      </div>
    </div>
  );
}

export default GalleryCard;