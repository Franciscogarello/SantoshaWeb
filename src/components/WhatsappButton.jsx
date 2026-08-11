function WhatsappButton() {
  return (
    <a
      href="https://wa.me/5493424084322?text=Hola%2C%20quisiera%20informaci%C3%B3n%20sobre%20las%20actividades%20de%20Espacio%20Santosha."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a Santosha por WhatsApp"
      className="
        group
        fixed
        bottom-6
        right-6
        z-50
        flex
        h-14
        items-center
        justify-center
        gap-0
        overflow-hidden
        rounded-full
        bg-[#25D366]
        px-4
        text-white
        shadow-xl
        transition-all
        duration-300
        hover:gap-2
        hover:shadow-2xl
        md:hover:px-5
      "
    >
      {/* Logo WhatsApp */}
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-7 w-7 shrink-0"
        aria-hidden="true"
      >
        <path d="M16.04 2.003c-7.72 0-13.997 6.276-13.997 13.996 0 2.468.644 4.877 1.867 6.999L1.926 30.24l7.414-1.945a13.93 13.93 0 0 0 6.696 1.705h.006c7.718 0 14.001-6.277 14.001-13.997 0-3.74-1.457-7.257-4.102-9.902a13.902 13.902 0 0 0-9.901-4.098Zm0 25.633h-.005a11.6 11.6 0 0 1-5.913-1.618l-.424-.252-4.4 1.154 1.174-4.288-.276-.44a11.598 11.598 0 0 1-1.79-6.193c0-6.417 5.22-11.637 11.64-11.637 3.107 0 6.03 1.21 8.226 3.408a11.56 11.56 0 0 1 3.407 8.23c-.003 6.416-5.224 11.636-11.639 11.636Zm6.382-8.711c-.35-.175-2.07-1.02-2.39-1.137-.32-.117-.553-.175-.786.175-.233.35-.903 1.137-1.107 1.37-.204.234-.408.263-.758.088-.35-.175-1.477-.545-2.814-1.738-1.04-.928-1.742-2.075-1.946-2.425-.204-.35-.022-.539.153-.713.158-.157.35-.408.524-.612.175-.204.233-.35.35-.583.116-.233.058-.437-.03-.612-.087-.175-.786-1.895-1.078-2.595-.283-.681-.572-.589-.786-.6-.204-.01-.437-.012-.67-.012-.233 0-.612.087-.932.437-.32.35-1.224 1.195-1.224 2.915s1.253 3.381 1.428 3.614c.175.233 2.465 3.763 5.972 5.277.834.36 1.485.575 1.992.736.837.266 1.598.228 2.2.138.671-.1 2.07-.846 2.361-1.662.292-.816.292-1.516.204-1.662-.087-.145-.32-.233-.67-.408Z" />
      </svg>

      {/* Texto solo en escritorio */}
      <span
        className="
          hidden
          max-w-0
          whitespace-nowrap
          overflow-hidden
          font-semibold
          opacity-0
          transition-all
          duration-300
          md:block
          md:group-hover:max-w-[100px]
          md:group-hover:opacity-100
        "
      >
        Escribinos
      </span>
    </a>
  );
}

export default WhatsappButton;