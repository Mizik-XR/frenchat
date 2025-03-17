
// Stub pour faire compiler l'application
export const openAiService = {
  generateMessage: async (prompt: string, options: any = {}) => {
    console.warn('openAiService.generateMessage est un stub et ne produit pas de réponse réelle');
    return { 
      content: "Réponse générée par un stub openAiService. Cette méthode n'est pas implémentée.",
      usage: { total_tokens: 0 }
    };
  }
};
