import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-linear-to-b from-[#E6FFE8] via-[#F2FFF4] to-white px-6 md:px-10 py-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <div className="flex flex-col gap-4">

          <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 leading-tight">
            AyurQ-Care
          </h1>

          <h2 className="text-2xl md:text-3xl font-bold text-green-700">
            Where Ayurveda Meets Technology
          </h2>

          <h3 className="text-xl md:text-2xl font-semibold text-green-600">
            Best AI-Powered EMR Software
          </h3>

          <p className="text-gray-700 max-w-xl mt-2 leading-relaxed">
            Connect with top doctors from around the world and get the best advice
            for your health — because you deserve expert care at every step.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-5 mt-8">
            <button
              onClick={() => navigate("/consult")}
              className="bg-green-500 hover:bg-green-600 transition text-black font-semibold px-8 py-3 rounded-full shadow-lg flex items-center gap-2"
            >
              Consult Now <span>↗</span>
            </button>

            <button
              onClick={() => navigate("/paranaai")}
              className="bg-white border border-green-500 hover:bg-green-50 transition text-green-700 font-semibold px-8 py-3 rounded-full shadow flex items-center gap-2"
            >
              🧠 PranaAI <span>↗</span>
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center">
          <img
            src="/src/assets/hero-image.svg"
            alt="Ayurvedic AI Healthcare"
            className="w-[90%] max-w-md drop-shadow-xl"
          />
        </div>

      </div>
    </section>
  );
}
