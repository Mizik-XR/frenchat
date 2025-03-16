
import React from 'react';

export function NavbarLogo() {
  return (
    <div className="flex-shrink-0 flex items-center">
      <img 
        className="h-8 w-auto" 
        src="/favicon.ico" 
        alt="filechat"
        onError={(e) => {
          // Fallback en cas d'erreur de chargement de l'image
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpath d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"%3e%3c/path%3e%3c/svg%3e';
        }}
      />
      <span className="ml-2 text-white font-bold text-lg">Frenchat</span>
    </div>
  );
}
