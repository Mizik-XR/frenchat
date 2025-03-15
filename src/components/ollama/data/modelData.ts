
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  size: string;
  category: 'recommended' | 'specialized' | 'experimental';
  tags: string[];
  requirements: {
    memory: string;
    disk: string;
    gpu?: boolean;
  };
}

export const models: ModelInfo[] = [
  {
    id: 'llama3-8b',
    name: 'Llama 3 (8B)',
    description: 'Modèle polyvalent de Meta, bon équilibre entre taille et performance',
    size: '4.8 GB',
    category: 'recommended',
    tags: ['général', 'chat', 'complet'],
    requirements: {
      memory: '8 GB',
      disk: '10 GB'
    }
  },
  {
    id: 'mistral-7b',
    name: 'Mistral (7B)',
    description: 'Excellent pour les tâches générales et le traitement de texte',
    size: '4.1 GB',
    category: 'recommended',
    tags: ['général', 'texte', 'efficace'],
    requirements: {
      memory: '6 GB',
      disk: '8 GB'
    }
  },
  {
    id: 'phi-2',
    name: 'Phi-2',
    description: 'Modèle compact de Microsoft avec d\'excellentes performances',
    size: '1.7 GB',
    category: 'recommended',
    tags: ['léger', 'rapide', 'efficace'],
    requirements: {
      memory: '4 GB',
      disk: '5 GB'
    }
  },
  {
    id: 'codellama',
    name: 'Code Llama',
    description: 'Spécialisé pour le code et la programmation',
    size: '3.8 GB',
    category: 'specialized',
    tags: ['code', 'programmation', 'développement'],
    requirements: {
      memory: '8 GB',
      disk: '8 GB'
    }
  },
  {
    id: 'gemma-2b',
    name: 'Gemma (2B)',
    description: 'Modèle très léger de Google, idéal pour les systèmes limités',
    size: '1.2 GB',
    category: 'recommended',
    tags: ['très léger', 'rapide', 'limité'],
    requirements: {
      memory: '2 GB',
      disk: '3 GB'
    }
  },
  {
    id: 'llama3-70b',
    name: 'Llama 3 (70B)',
    description: 'Version large du modèle Llama, très performante',
    size: '39 GB',
    category: 'experimental',
    tags: ['avancé', 'haute performance', 'lourd'],
    requirements: {
      memory: '32 GB',
      disk: '80 GB',
      gpu: true
    }
  }
];
