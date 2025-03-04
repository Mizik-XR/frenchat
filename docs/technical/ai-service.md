
# Service d'Intelligence Artificielle

## Vue d'ensemble

Le service d'IA est responsable de la génération de texte et du traitement des requêtes utilisateur. Il peut fonctionner en mode local (sur l'ordinateur de l'utilisateur) ou en mode cloud (via des API externes).

## Composants principaux

### 1. Hooks React

- `useHuggingFace` - Hook principal pour la génération de texte
- `useModelDownload` - Gère le téléchargement des modèles locaux

### 2. Stratégies d'exécution

Le système implémente un pattern de stratégie pour déterminer où exécuter les requêtes d'IA :

```typescript
// Exemple simplifié
async function executeAIRequest(
  options: TextGenerationParameters,
  executionStrategy: 'local' | 'cloud',
  localAIUrl: string | null,
  localProvider: LLMProviderType,
  modelDownloadStatus: ModelDownloadStatus,
  cloudProvider: string = 'huggingface'
): Promise<TextGenerationResponse[]> {
  // Basculement automatique vers le cloud si nécessaire
  if (executionStrategy === 'local' && modelDownloadStatus.status === 'downloading') {
    executionStrategy = 'cloud';
  }

  if (executionStrategy === 'local') {
    // Utilisation de l'API locale
    // ...
  } else {
    // Utilisation de l'API cloud
    // ...
  }
}
```

### 3. Serveur local

Le serveur Python local fournit les fonctionnalités suivantes :

- Génération de texte avec transformers
- Téléchargement et gestion des modèles
- Détection automatique des ressources système

## Flux de travail

1. L'utilisateur soumet une requête via `textGeneration()`
2. Le système détermine la stratégie d'exécution (local/cloud)
3. La requête est transmise au service approprié
4. La réponse est renvoyée à l'interface utilisateur

## Modes de repli (Fallback)

En cas d'erreur ou de ressources insuffisantes, le système bascule automatiquement vers des alternatives :

1. **Mode local → cloud** : Si le modèle local échoue
2. **Transformers → Ollama** : Si disponible localement
3. **Cloud standard → API externe** : Si l'API principale est indisponible

## Optimisation des performances

Le service analyse les capacités système pour optimiser l'expérience :

```python
# Analyse des ressources système
def analyze_system_resources():
    """
    Analyse les ressources système et détermine si le système 
    peut exécuter un modèle d'IA local
    """
    result = {
        "cpu_percent": None,
        "memory_available_gb": None,
        "memory_percent": None,
        "gpu_available": False,
        "gpu_info": None,
        "system_score": 0.5,
        "can_run_local_model": True
    }
    
    # Détection GPU
    gpu_info = detect_gpu()
    result["gpu_available"] = gpu_info["available"]
    
    # Analyse mémoire et CPU
    resources = analyze_memory_cpu()
    
    # Calcul score système
    result["system_score"] = calculate_system_score(...)
    
    # Évaluation capacité à exécuter localement
    result["can_run_local_model"] = assess_model_capability(...)
    
    return result
```
