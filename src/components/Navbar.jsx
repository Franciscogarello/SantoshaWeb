import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const links = [
  { id: "inicio", label: "Inicio" },
  { id: "nosotros", label: "Nosotros" },
  { id: "consultorios", label: "Consultorios" },
  { id: "actividades", label: "Actividades" },
  { id: "espacio", label: "Espacio" },
  { id: "contacto", label: "Contacto" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 40);

      if (menuOpen || currentScrollY < 80) {
        setNavbarVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setNavbarVisible(false);
      } else {
        setNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, menuOpen]);

  useEffect(() => {
    const handleActiveSection = () => {
      const scrollPosition = window.scrollY + 180;

      for (const link of links) {
        const section = document.getElementById(link.id);

        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          setActiveSection(link.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleActiveSection);
    handleActiveSection();

    return () =>
      window.removeEventListener("scroll", handleActiveSection);
  }, []);

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
        navbarVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      } ${
        scrolled
          ? "bg-white/80 shadow-lg backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1450px] items-center justify-between px-5 py-4 sm:px-8 sm:py-6">

        {/* Logo */}
        <a href="#inicio" aria-label="Ir al inicio">
          <img
            src={logo}
            alt="Logo Santosha"
            className={`h-12 transition-all duration-300 sm:h-16 md:h-20 ${
              scrolled ? "" : "brightness-0 invert"
            }`}
          />
        </a>

        {/* Menú escritorio */}
        <ul
          className={`hidden items-center gap-7 rounded-full px-8 py-3 font-medium transition-all duration-500 md:flex ${
            scrolled
              ? "bg-transparent"
              : "border border-white/30 bg-black/25 shadow-lg backdrop-blur-md"
          }`}
        >
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className={`relative block transition-colors duration-300
                  after:absolute after:-bottom-2 after:left-0 after:h-[2px]
                  after:bg-current after:transition-all after:duration-300 ${
                    activeSection === link.id
                      ? scrolled
                        ? "text-[var(--sage-dark)] after:w-full"
                        : "text-white after:w-full"
                      : scrolled
                        ? "text-[var(--sage)] after:w-0 hover:text-[var(--sage-dark)] hover:after:w-full"
                        : "text-white/80 after:w-0 hover:text-white hover:after:w-full"
                  }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Botón hamburguesa */}
        <button
          type="button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((open) => !open)}
          className={`rounded-full p-2 transition-all duration-300 md:hidden ${
            scrolled
              ? "text-[var(--sage-dark)]"
              : "bg-black/20 text-white backdrop-blur-sm"
          }`}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menú celular */}
      {menuOpen && (
        <div className="w-full border-t border-black/5 bg-white/95 shadow-lg backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setMenuOpen(false)}
              className={`block px-6 py-4 transition-colors ${
                activeSection === link.id
                  ? "bg-[var(--cream)] font-semibold text-[var(--sage-dark)]"
                  : "text-[var(--sage)] hover:bg-[var(--cream)]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;