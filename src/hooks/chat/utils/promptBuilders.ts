
// Stub pour faire compiler l'application
export const createChatPrompt = (messages: any[], systemPrompt?: string) => {
  console.warn('createChatPrompt est un stub et ne produit pas de prompt réel');
  return messages;
};

export const createSystemPrompt = (context: string, additionalInstructions?: string) => {
  console.warn('createSystemPrompt est un stub et ne produit pas de prompt réel');
  return `Système: ${context || 'Pas de contexte'} ${additionalInstructions || ''}`;
};
