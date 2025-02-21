
export function useHuggingFace(provider: string = 'huggingface') {
  const textGeneration = async (options: any) => {
    try {
      // Simulation de réponse pour le moment
      return [{
        generated_text: "Je suis désolé, mais je ne peux pas traiter votre demande pour le moment. Le service est en cours d'initialisation."
      }];
    } catch (error) {
      console.error("Erreur lors de l'appel à Hugging Face:", error);
      throw error;
    }
  };

  return { textGeneration };
}
