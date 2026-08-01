import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";

import SectionTitle from "./SectionTitle";
import GalleryCard from "./GalleryCard";
import galeria from "../data/galeria";

function Gallery() {
  const [index, setIndex] = useState(-1);

  return (
    <>
      <section
        id="espacio"
        className="scroll-mt-24 bg-[#F8F5F0] pt-20 pb-16 md:pt-28 md:pb-20"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">

          <SectionTitle
            eyebrow="Nuestro espacio"
            title="Un lugar pensado para respirar."
            subtitle="Cada rincón de Santosha fue creado para que puedas desconectar del ritmo cotidiano y regalarte un momento de calma."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mt-12 md:mt-16">

            {/* Imagen principal */}
            <GalleryCard
              {...galeria[0]}
              delay={0}
              onClick={() => setIndex(0)}
              className="h-[300px] sm:h-[420px] lg:h-[560px]"
            />

            {/* Imágenes secundarias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">

              <GalleryCard
                {...galeria[1]}
                delay={100}
                onClick={() => setIndex(1)}
                className="h-[260px] sm:col-span-2"
              />

              <GalleryCard
                {...galeria[2]}
                delay={200}
                onClick={() => setIndex(2)}
                className="h-[260px]"
              />

              <GalleryCard
                {...galeria[3]}
                delay={300}
                onClick={() => setIndex(3)}
                className="h-[260px]"
              />

            </div>
          </div>

        </div>
      </section>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={galeria.map((foto) => ({
          src: foto.imagen,
          alt: foto.titulo,
        }))}
      />
    </>
  );
}

export default Gallery;