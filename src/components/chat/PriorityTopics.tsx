
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PriorityTopicsProps {
  onTopicSelect: (messageId: string) => void;
  setShowPriorityTopics: (show: boolean) => void;
}

export function PriorityTopics({ onTopicSelect, setShowPriorityTopics }: PriorityTopicsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Liste de sujets prioritaires simulée
  const mockTopics = [
    { id: '1', title: 'Intégration avec Google Drive', description: 'Configuration et utilisation' },
    { id: '2', title: 'Modèles de langage locaux', description: 'Performances et configuration' },
    { id: '3', title: 'Analyse de documents PDF', description: 'Extraction de texte et indexation' },
    { id: '4', title: 'Confidentialité des données', description: 'Mesures de protection et conformité' },
    { id: '5', title: 'Optimisation des embeddings', description: 'Techniques avancées de RAG' },
  ];
  
  const filteredTopics = mockTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sujets prioritaires</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPriorityTopics(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher des sujets..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
        {filteredTopics.length > 0 ? (
          filteredTopics.map(topic => (
            <div 
              key={topic.id}
              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                onTopicSelect(topic.id);
                setShowPriorityTopics(false);
              }}
            >
              <div className="font-medium">{topic.title}</div>
              <div className="text-sm text-gray-600">{topic.description}</div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Aucun sujet trouvé</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowPriorityTopics(false)}
        >
          Fermer
        </Button>
      </div>
    </div>
  );
}
