function Button({
  children,
  href = "#",
  variant = "primary",
  className = "",
}) {
  const base =
  "inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-center font-medium transition-all duration-300";
  
  const variants = {
    primary:
      "bg-[var(--sage)] text-white hover:bg-[var(--sage-dark)] hover:-translate-y-1 hover:shadow-xl",

    secondary:
     "border border-white/50 bg-white/15 text-white backdrop-blur-md hover:bg-white hover:text-[var(--text)] hover:-translate-y-1 hover:shadow-xl",

    outline:
      "border border-[var(--sage)] text-[var(--sage)] hover:bg-[var(--sage)] hover:text-white",
  };

  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </a>
  );
}

export default Button;