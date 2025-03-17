
// Stub pour faire compiler l'application
export const anthropicService = {
  generateMessage: async (prompt: string, options: any = {}) => {
    console.warn('anthropicService.generateMessage est un stub et ne produit pas de réponse réelle');
    return { 
      content: "Réponse générée par un stub anthropicService. Cette méthode n'est pas implémentée.",
      usage: { total_tokens: 0 }
    };
  }
};
