
import React from 'react';

export function FrenchTitle() {
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-2xl font-bold relative">
        <span className="text-french-blue">fren</span>
        <span className="text-french-red">chat</span>
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 french-flag-gradient" />
      </h1>
    </div>
  );
}
