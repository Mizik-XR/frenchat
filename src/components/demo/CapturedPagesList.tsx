
import React from 'react';
import { CapturedPagesListProps } from './types';

export const CapturedPagesList: React.FC<CapturedPagesListProps> = ({
  complete,
  pages
}) => {
  if (!complete) return null;
  
  return (
    <div className="border rounded-md p-4 bg-muted/50">
      <p className="font-medium mb-2">Captures d'écran réalisées :</p>
      <ul className="list-disc pl-6 space-y-1">
        {pages.map((page, index) => (
          <li key={index}>{page.name}</li>
        ))}
      </ul>
    </div>
  );
};
