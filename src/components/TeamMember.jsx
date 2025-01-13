import React from 'react';
import { FaLinkedin, FaGithub, FaBehance } from "react-icons/fa";
import { HiMail } from "react-icons/hi";

export default function TeamMember({ name, role, photo, linkedin, github, behance, email }) {
  return (
    <div className="card group hover:scale-105 transition-all duration-300">
      <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
        <img 
          src={photo} 
          alt={name} 
          className="w-full h-full object-cover object-center"
        />
        {/* Reduced opacity for light mode, kept darker for dark mode */}
        <div className="absolute inset-0 bg-gradient-to-t from-light-surface/30 dark:from-dark-surface/90 to-transparent rounded-lg" />
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
          {name}
        </h3>
        <p className="text-light-text/70 dark:text-dark-text/70 mb-4">
          {role}
        </p>
        
        <div className="flex justify-center space-x-4">
          {linkedin && (
            <a 
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-primary dark:text-dark-primary hover:opacity-75 transition-opacity text-xl"
            >
              <FaLinkedin />
            </a>
          )}
          {github && (
            <a 
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-primary dark:text-dark-primary hover:opacity-75 transition-opacity text-xl"
            >
              <FaGithub />
            </a>
          )}
          {behance && (
            <a 
              href={behance}
              target="_blank"
              rel="noopener noreferrer"
              className="text-light-primary dark:text-dark-primary hover:opacity-75 transition-opacity text-xl"
            >
              <FaBehance />
            </a>
          )}
          {email && (
            <a 
              href={`mailto:${email}`}
              className="text-light-primary dark:text-dark-primary hover:opacity-75 transition-opacity text-xl"
            >
              <HiMail />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
