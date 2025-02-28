
# Modèles d'Intelligence Artificielle

## Modèles Supportés

1. **Mistral 7B (Recommandé)**
   - Modèle par défaut dans l'application
   - Bon équilibre performance / ressources requises
   - Excellentes capacités de raisonnement et de compréhension
   - Idéal pour déploiement local ou cloud

2. **Ollama (Local)**
   - Modèles disponibles : llama2, mistral, phi
   - Exécution locale sur votre machine
   - Ne nécessite pas de clé API
   - Installation via https://ollama.ai/download

3. **Hugging Face**
   - Modèles : mistral-7b, llama-2, falcon-40b
   - Plateforme open source
   - Gratuit pour les modèles de base

4. **Phi-3 (Microsoft)**
   - Versions : phi-3-small, phi-3-medium
   - Optimisé pour la compréhension
   - Open source

5. **OpenAI (Optionnel)**
   - Modèles : gpt-4-turbo, gpt-4, gpt-3.5-turbo
   - Nécessite une clé API
   - Performances supérieures

6. **DeepSeek**
   - Spécialisations : deepseek-coder, deepseek-chat
   - Nécessite une clé API
   - Optimisé pour les tâches spécifiques

## Configuration et Utilisation

### Configuration des LLM

```typescript
import { LLMConfigComponent } from '@/components/config/LLMConfig';

<LLMConfigComponent onSave={() => {
  console.log('Configuration LLM sauvegardée');
}} />
```

### Paramètres Configurables

- **Mode** : auto/manuel
- **Température** : 0.0 - 1.0 (contrôle la créativité)
- **Tokens maximum** : limite de la longueur des réponses
- **Cache** : activation/désactivation du cache des réponses
- **Taille des lots** : optimisation du traitement par lots

### Bonnes Pratiques

1. **Choix du Modèle**
   - Utilisez Mistral 7B pour un bon équilibre performances/ressources
   - Ollama pour le développement local simplifié
   - OpenAI pour les cas nécessitant plus de performances

2. **Optimisation**
   - Activez le cache pour les requêtes fréquentes
   - Ajustez la température selon le cas d'usage
   - Utilisez le mode batch pour les traitements en lots

3. **Ressources Requises**
   - Mistral 7B : 16GB de RAM minimum, GPU recommandé
   - DistilGPT2 : 4GB de RAM minimum
   - Pour les grands modèles : 24GB+ RAM, GPU avec 8GB+ VRAM
