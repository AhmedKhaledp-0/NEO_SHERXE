import { FaLinkedin, FaGithub, FaBehance } from "react-icons/fa";
import { HiMail } from "react-icons/hi";

export default function TeamMember({
  name,
  role,
  photo,
  linkedin,
  github,
  behance,
  email,
}) {
  return (
    <div className="bg-black p-8 group hover:bg-white/5 active:bg-white/5 transition-colors duration-500 flex flex-col h-full cursor-pointer">
      <div className="relative w-full aspect-square mb-8 overflow-hidden border border-white/10 grayscale group-hover:grayscale-0 group-active:grayscale-0 transition-all duration-500">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent group-active:bg-transparent transition-colors duration-500" />
      </div>

      <div className="text-center flex-1 flex flex-col">
        <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-2">
          {name}
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-8">
          {role}
        </p>

        <div className="flex justify-center gap-6 mt-auto">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white active:text-white transition-colors duration-300 text-xl"
            >
              <FaLinkedin />
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white active:text-white transition-colors duration-300 text-xl"
            >
              <FaGithub />
            </a>
          )}
          {behance && (
            <a
              href={behance}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white active:text-white transition-colors duration-300 text-xl"
            >
              <FaBehance />
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-white/40 hover:text-white active:text-white transition-colors duration-300 text-xl"
            >
              <HiMail />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
