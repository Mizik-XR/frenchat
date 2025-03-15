
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useOpenAIRagHook } from '@/hooks/useOpenAIRag';

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export const useRAG = () => {
  const [isIndexing, setIsIndexing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isUsingOpenAI, setIsUsingOpenAI] = useState(false);
  
  // Intégrer le hook OpenAI RAG
  const openAIRag = useOpenAIRagHook();

  const indexDocument = async (documentId: string, content: string) => {
    setIsIndexing(true);
    try {
      const { error } = await supabase.functions.invoke('rag-indexing', {
        body: { action: 'index', documentId, content }
      });

      if (error) throw error;

      toast({
        title: "Document indexé",
        description: "Le document a été correctement indexé pour la recherche",
      });
    } catch (error) {
      console.error('Erreur lors de l\'indexation:', error);
      toast({
        title: "Erreur d'indexation",
        description: "Impossible d'indexer le document",
        variant: "destructive"
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const searchDocuments = async (query: string, useOpenAI: boolean = false) => {
    setIsSearching(true);
    setIsUsingOpenAI(useOpenAI);
    
    try {
      if (useOpenAI) {
        // Récupérer d'abord les documents pertinents avec le système traditionnel
        const { data, error } = await supabase.functions.invoke('rag-indexing', {
          body: { action: 'search', query }
        });

        if (error) throw error;
        
        // Utiliser OpenAI pour améliorer la réponse si des résultats ont été trouvés
        if (data.results && data.results.length > 0) {
          // Combiner le contenu des documents les plus pertinents
          const combinedContent = data.results
            .map((result: SearchResult) => result.content)
            .join("\n\n");
          
          // Obtenir une réponse améliorée via OpenAI
          const enhancedResponse = await openAIRag.queryDocument(
            combinedContent, 
            `Question: ${query}. Réponds uniquement avec les informations présentes dans le document.`
          );
          
          if (enhancedResponse) {
            // Ajouter la réponse améliorée en début de liste
            const enhancedResult: SearchResult = {
              id: 'enhanced-response',
              content: enhancedResponse,
              similarity: 1.0,
              metadata: { 
                source: 'openai',
                type: 'enhanced_response',
                original_query: query
              }
            };
            
            setResults([enhancedResult, ...data.results]);
            return [enhancedResult, ...data.results];
          }
        }
        
        // Si OpenAI échoue, revenir aux résultats traditionnels
        setResults(data.results);
        return data.results;
      } else {
        // Recherche traditionnelle
        const { data, error } = await supabase.functions.invoke('rag-indexing', {
          body: { action: 'search', query }
        });

        if (error) throw error;

        setResults(data.results);
        return data.results;
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible d'effectuer la recherche dans les documents",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const toggleOpenAIMode = () => {
    setIsUsingOpenAI(!isUsingOpenAI);
    toast({
      title: `Mode ${!isUsingOpenAI ? 'OpenAI' : 'Standard'} activé`,
      description: !isUsingOpenAI 
        ? "Les recherches utiliseront OpenAI pour des réponses améliorées" 
        : "Les recherches utiliseront le moteur de recherche standard"
    });
  };

  return {
    indexDocument,
    searchDocuments,
    isIndexing,
    isSearching,
    results,
    isUsingOpenAI,
    toggleOpenAIMode,
    
    // Exposer également les fonctions OpenAI RAG directes
    openAIRag: {
      queryDocument: openAIRag.queryDocument,
      createAssistantWithFiles: openAIRag.createAssistantWithFiles,
      sendMessageToAssistant: openAIRag.sendMessageToAssistant,
      isLoading: openAIRag.isLoading
    }
  };
};
