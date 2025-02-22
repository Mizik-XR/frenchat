
import React from 'react';
import { DocumentManager } from '@/components/documents/DocumentManager';

export const Documents = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestionnaire de documents</h1>
      <DocumentManager />
    </div>
  );
};

export default Documents;
