import { Quote, Star } from "lucide-react";

function TestimonialCard({ nombre, texto, delay = 0 }) {
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
    >
      <Quote className="text-[#5E8F5A]" size={34} />

      <div className="flex gap-1 mt-4 mb-5 text-[#D9B65B]">
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
        <Star size={18} fill="currentColor" />
      </div>

      <p className="text-gray-600 leading-8 italic">
        "{texto}"
      </p>

        <div className="flex items-center gap-4 mt-8">
        <div className="w-12 h-12 rounded-full bg-[#5E8F5A] text-white flex items-center justify-center font-bold text-lg">
            {nombre.charAt(0)}
        </div>

        <div>
            <h4 className="font-semibold text-[#374137]">
            {nombre}
            </h4>

            <p className="text-sm text-gray-500">
            Alumno de Santosha
            </p>
        </div>
        </div>
    </div>
  );
}

export default TestimonialCard;