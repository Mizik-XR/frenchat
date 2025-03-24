
import React from '@/core/reactInstance';

export function FrenchTitle() {
  return (
    <div className="flex items-center">
      <h1 className="text-2xl font-bold">
        <span className="french-blue">fren</span>
        <span className="french-white bg-french-blue px-1">ch</span>
        <span className="french-red">at</span>
      </h1>
      <div className="absolute top-0 left-0 w-full h-1 french-flag-gradient" />
      <div className="absolute bottom-0 left-0 w-full h-1 french-flag-gradient" />
    </div>
  );
}
