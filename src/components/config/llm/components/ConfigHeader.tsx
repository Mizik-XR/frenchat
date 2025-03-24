
import React from '@/core/reactInstance';

interface ConfigHeaderProps {
  hasConfiguration: boolean;
}

export function ConfigHeader({ hasConfiguration }: ConfigHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Configuration du Modèle IA</h2>
        <p className="text-sm text-gray-500">
          {hasConfiguration 
            ? "Votre modèle IA est configuré et prêt à être utilisé"
            : "Configurez votre modèle d'intelligence artificielle pour commencer"}
        </p>
      </div>
      
      {hasConfiguration && (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-sm font-medium text-green-700">Configuré</span>
        </div>
      )}
    </div>
  );
}
