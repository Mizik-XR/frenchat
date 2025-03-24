
import React from '@/core/reactInstance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, Clock } from 'lucide-react';

interface KnowledgeBase {
  id: string;
  status: string;
  total_files: number;
  processed_files: number;
  current_folder?: string;
  parent_folder?: string;
}

interface RecentKnowledgeBasesProps {
  knowledgeBases: KnowledgeBase[];
}

export function RecentKnowledgeBases({ knowledgeBases }: RecentKnowledgeBasesProps) {
  if (knowledgeBases.length === 0) {
    return (
      <div className="text-center py-8 px-4 border rounded-lg">
        <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-medium mb-2">Aucune base de connaissances récente</h3>
        <p className="text-muted-foreground">
          Indexez un dossier pour créer une base de connaissances
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {knowledgeBases.map((kb) => (
        <Card key={kb.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Folder className="h-4 w-4" />
              {kb.current_folder || "Base de connaissances"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex h-2 w-2 rounded-full ${
                kb.status === 'completed' ? 'bg-green-500' : 
                kb.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></span>
              <span className="text-sm text-muted-foreground">
                {kb.status === 'completed' ? 'Terminé' : 
                 kb.status === 'error' ? 'Erreur' : 'En cours'}
              </span>
              <span className="text-sm text-muted-foreground ml-auto">
                {kb.processed_files || 0} / {kb.total_files || 0} fichiers
              </span>
            </div>
            {kb.status === 'running' && (
              <div className="mt-2">
                <progress 
                  className="w-full h-2" 
                  value={kb.processed_files || 0} 
                  max={kb.total_files || 100}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
