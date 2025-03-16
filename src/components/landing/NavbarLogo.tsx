
import React from 'react';

export function NavbarLogo() {
  return (
    <div className="flex-shrink-0 flex items-center">
      <svg 
        className="h-8 w-8 text-indigo-600" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span className="ml-2 text-white font-bold text-lg">Frenchat</span>
    </div>
  );
}
