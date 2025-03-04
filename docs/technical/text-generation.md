
# Génération de Texte

## Vue d'ensemble

Le module de génération de texte est responsable de traiter les requêtes de l'utilisateur et de générer des réponses intelligentes. Il prend en charge différentes stratégies d'exécution (locale ou cloud) et gère les scénarios de repli.

## Hook principal : `generateText`

```typescript
export async function generateText(
  options: TextGenerationParameters,
  serviceType: AIServiceType,
  isCloudModeForced: boolean,
  localAIUrl: string | null,
  localProvider: LLMProviderType,
  modelDownloadStatus: ModelDownloadStatus,
  provider: string,
  setIsLoading: (isLoading: boolean) => void,
  setError: (error: string | null) => void
): Promise<TextGenerationResponse[]> {
  setIsLoading(true);
  setError(null);
  
  try {
    // Validation des entrées
    const validationError = validateTextGenerationInput(options);
    if (validationError) {
      throw new Error(`Erreur de validation: ${validationError}`);
    }
    
    // Détermination de la stratégie d'exécution
    const executionStrategy = isCloudModeForced ? 'cloud' : 
      await determineExecutionStrategy(options, serviceType).catch(err => {
        console.warn("Erreur lors de la détermination de la stratégie:", err);
        return 'cloud' as const; // Fallback en cas d'erreur
      });
    
    // Exécution de la requête avec la stratégie déterminée
    const response = await executeAIRequest(
      options, 
      executionStrategy, 
      localAIUrl, 
      localProvider, 
      modelDownloadStatus, 
      provider
    );
    
    return response;
  } catch (e) {
    console.error("Erreur lors de l'appel au modèle:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    setError(errorMessage);
    
    // Notification d'erreur contextuelle
    if (!isCloudModeForced || (isCloudModeForced && serviceType === 'cloud')) {
      notifyServiceChange(
        "Erreur de connexion au service d'IA",
        "Impossible de se connecter au service d'IA. Vérifiez votre connexion ou essayez plus tard.",
        "destructive"
      );
    }
    
    // Réponse de repli
    return [{ generated_text: "Désolé, je n'ai pas pu générer de réponse en raison d'une erreur de connexion. Veuillez réessayer." }];
  } finally {
    setIsLoading(false);
  }
}
```

## Détermination de la stratégie

Le système utilise plusieurs facteurs pour déterminer où exécuter la génération de texte :

```typescript
async function determineExecutionStrategy(
  options: TextGenerationParameters,
  serviceType: AIServiceType
): Promise<'local' | 'cloud'> {
  // Option forcée localement
  if (options.forceLocal === true) {
    return 'local';
  }
  
  // Option forcée vers le cloud
  if (options.forceCloud === true) {
    return 'cloud';
  }
  
  // Utiliser le type de service configuré
  if (serviceType === 'local') {
    return 'local';
  } else if (serviceType === 'cloud') {
    return 'cloud';
  }
  
  // Par défaut, utiliser le cloud pour hybrid
  return 'cloud';
}
```

## Interface API locale

L'API locale expose des endpoints RESTful pour la génération de texte :

```python
@router.post("/generate")
async def generate_text(input_data: GenerationInput):
    """Génère du texte à partir d'un prompt"""
    try:
        # Charger le modèle si nécessaire
        if not lazy_load_model():
            raise HTTPException(status_code=500, detail="Impossible de charger le modèle")
        
        # Utiliser le mode fallback si activé
        result = await fallback_generate(input_data)
        
        return result
    except Exception as e:
        error_msg = f"Erreur lors de la génération: {str(e)}"
        logger.error(error_msg)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)
```

## Modèles de données

Les interfaces TypeScript définissent les structures pour les requêtes et réponses :

```typescript
export interface TextGenerationParameters {
  // Paramètres communs
  prompt?: string;
  inputs?: string;
  system_prompt?: string;
  
  // Contrôle de la génération
  temperature?: number;
  top_p?: number;
  max_length?: number;
  
  // Configuration d'exécution
  model?: string;
  api_key?: string;
  forceLocal?: boolean;
  forceCloud?: boolean;
  
  // Paramètres avancés (optionnels)
  parameters?: {
    temperature?: number;
    top_p?: number;
    max_length?: number;
    [key: string]: any;
  };
}

export interface TextGenerationResponse {
  generated_text: string;
  [key: string]: any;
}
```

## Gestion d'erreurs et repli

Le système implémente une stratégie de repli en cascade :

1. Tentative initiale avec la stratégie choisie
2. Si échec local, basculement vers le cloud
3. Si échec cloud, message d'erreur utilisateur avec options de récupération
