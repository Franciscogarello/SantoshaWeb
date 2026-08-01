function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = true,
}) {
  return (
    <div data-aos="fade-up" className={center ? "text-center" : "text-left"}>

      {eyebrow && (
        <span className="uppercase tracking-[4px] sm:tracking-[6px] text-[var(--sage)] font-semibold text-sm sm:text-base">
          {eyebrow}
        </span>
      )}

      <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-[var(--text)]">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-5 sm:mt-6 max-w-3xl mx-auto text-base sm:text-lg leading-7 sm:leading-8 text-gray-600">
          {subtitle}
        </p>
      )}

      <div className={`flex mt-7 sm:mt-8 ${center ? "justify-center" : "justify-start"}`}>
        <div className="w-20 sm:w-24 h-1 rounded-full bg-[var(--sage)]" />
      </div>

    </div>
  );
}

export default SectionTitle;