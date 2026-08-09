import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <h1 className="text-8xl md:text-9xl font-black text-white tracking-[0.2em] uppercase">
          404
        </h1>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-medium tracking-widest text-white uppercase">
            Lost in Space
          </h2>
          <p className="text-white/50 font-light leading-relaxed max-w-md mx-auto">
            The trajectory you are trying to follow doesn't exist in our orbital
            mechanics model. The page might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 px-8 py-4 border border-white/20 bg-transparent text-white font-bold uppercase tracking-widest text-sm hover:bg-white/10 active:bg-white/10 transition-colors duration-300 w-full sm:w-auto"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-white/90 active:bg-white/80 transition-colors duration-300 w-full sm:w-auto"
          >
            <FontAwesomeIcon icon={faRocket} />
            <span>Return to Base</span>
          </button>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden opacity-20">
        <div className="w-[800px] h-[800px] border border-white/5 rounded-full absolute mix-blend-screen" />
        <div className="w-[600px] h-[600px] border border-white/10 rounded-full absolute mix-blend-screen" />
        <div className="w-[400px] h-[400px] border border-white/20 rounded-full absolute mix-blend-screen" />
      </div>
    </div>
  );
}
