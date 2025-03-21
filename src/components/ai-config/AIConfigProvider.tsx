
import { React, useState } from "@/core/ReactInstance";
import { createContextSafely } from "@/utils/react/createContextSafely";

interface AIConfigContextType {
  provider: string;
  modelName: string;
  testText: string;
  summary: string;
  setProvider: (provider: string) => void;
  setModelName: (modelName: string) => void;
  setTestText: (text: string) => void;
  setSummary: (summary: string) => void;
}

const defaultAIConfig: AIConfigContextType = {
  provider: "huggingface",
  modelName: "t5-small",
  testText: "",
  summary: "",
  setProvider: () => {},
  setModelName: () => {},
  setTestText: () => {},
  setSummary: () => {}
};

// Création du contexte avec la nouvelle API
const AIConfigContext = createContextSafely<AIConfigContextType>(defaultAIConfig);

export const useAIConfigContext = () => {
  return AIConfigContext.useContext();
};

interface AIConfigProviderProps {
  children: React.ReactNode;
  initialProvider?: string;
  initialModelName?: string;
  initialTestText?: string;
}

export const AIConfigProvider = ({
  children,
  initialProvider = "huggingface",
  initialModelName = "t5-small",
  initialTestText = "Ceci est un texte d'exemple pour tester la génération de résumé. Le modèle devrait être capable de créer une version condensée de ce contenu."
}: AIConfigProviderProps) => {
  const [provider, setProvider] = useState(initialProvider);
  const [modelName, setModelName] = useState(initialModelName);
  const [testText, setTestText] = useState(initialTestText);
  const [summary, setSummary] = useState("");

  return (
    <AIConfigContext.Provider
      value={{
        provider,
        modelName,
        testText,
        summary,
        setProvider,
        setModelName,
        setTestText,
        setSummary
      }}
    >
      {children}
    </AIConfigContext.Provider>
  );
};
