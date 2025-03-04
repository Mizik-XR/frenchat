
# Gestion des Modèles d'IA

## Vue d'ensemble

Le système de gestion des modèles d'IA est responsable du chargement, du téléchargement et de l'exécution des modèles de langage. Il offre plusieurs stratégies d'exécution pour s'adapter aux ressources disponibles.

## Composants principaux

### 1. Gestionnaire de modèles (model_manager.py)

```python
def lazy_load_model():
    """Charge le modèle seulement quand nécessaire"""
    global model, tokenizer, _model_loaded, _fallback_mode
    
    if _model_loaded:
        return True
        
    try:
        logger.info(f"Chargement du modèle {DEFAULT_MODEL}...")
        
        # Mode léger (sans Rust)
        if _fallback_mode:
            logger.info("Mode léger activé: utilisation d'une API externe")
            _model_loaded = True
            return True
            
        # Analyser les ressources système
        system_resources = analyze_system_resources()
        
        # Vérifier si ressources insuffisantes
        if not system_resources["can_run_local_model"]:
            logger.warning("Ressources insuffisantes, passage en mode léger")
            _fallback_mode = True
            _model_loaded = True
            return True
            
        # Charger le modèle localement avec configuration optimale
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        # Vérifier si le modèle est en cache
        model_cached = check_model_cached(DEFAULT_MODEL, huggingface_cache)
        
        if not model_cached:
            init_model_download(DEFAULT_MODEL)
            _fallback_mode = True
            _model_loaded = True
            return True
        
        # Charger avec config optimale
        use_gpu = system_resources.get("gpu_available", False)
        device_map = "auto" if use_gpu else "cpu"
        
        # Adapter selon mémoire disponible
        if system_resources.get("memory_available_gb", 0) < 8:
            # Config basse mémoire
            tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
            model = AutoModelForCausalLM.from_pretrained(
                DEFAULT_MODEL, 
                torch_dtype=torch.float16 if use_gpu else torch.float32,
                device_map=device_map,
                low_cpu_mem_usage=True,
                offload_folder="offload"
            )
        else:
            # Config standard
            tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
            model = AutoModelForCausalLM.from_pretrained(
                DEFAULT_MODEL, 
                torch_dtype=torch.float16 if use_gpu else torch.float32,
                device_map=device_map
            )

        _model_loaded = True
        return True
        
    except Exception as e:
        # Gestion des erreurs et passage en mode fallback
        logger.warning("Passage en mode léger (API externe)")
        _fallback_mode = True
        _model_loaded = True
        return True
```

### 2. Téléchargement de modèles (model_download.py)

Gère le téléchargement asynchrone des modèles et le suivi de la progression.

```python
def init_model_download(model_name):
    """Initialise le téléchargement du modèle en arrière-plan"""
    global download_progress
    
    with download_lock:
        # Vérifier si déjà en cours
        if download_progress["status"] == "downloading":
            return download_progress
        
        # Initialiser l'état
        download_progress = {
            "status": "downloading",
            "model": model_name,
            "progress": 0,
            "started_at": time.time(),
            "completed_at": None,
            "error": None,
            "size_mb": estimate_model_size(model_name),
            "downloaded_mb": 0
        }
    
    # Lancement en thread parallèle
    threading.Thread(target=download_model, args=(model_name,), daemon=True).start()
    
    return download_progress
```

### 3. Inférence de modèle (model_inference.py)

Gère l'exécution des requêtes de génération de texte.

```python
async def fallback_generate(input_data):
    """Utilise une API externe quand le modèle local n'est pas disponible"""
    import aiohttp
    import asyncio
    from aiohttp import ClientTimeout
    
    # Options d'API (priorité: locale, puis HF API, puis fallback API)
    apis = [
        {
            "url": "http://localhost:11434/api/generate",  # Ollama
            "data": {
                "model": "mistral",
                "prompt": input_data.prompt,
                "system": input_data.system_prompt,
                "stream": False
            },
            "result_key": "response",
            "timeout": 30
        },
        {
            "url": "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
            "data": {
                "inputs": f"<s>[INST] {input_data.system_prompt}\n\n{input_data.prompt} [/INST]",
                "parameters": {
                    "max_length": input_data.max_length,
                    "temperature": input_data.temperature,
                    "top_p": input_data.top_p
                }
            },
            "result_key": "generated_text",
            "timeout": 45
        }
    ]
    
    # Tentative sur chaque API dans l'ordre
    for api in apis:
        try:
            # Configuration sécurisée d'aiohttp
            async with aiohttp.ClientSession(...) as session:
                async with session.post(...) as response:
                    if response.status == 200:
                        result = await response.json()
                        return {"generated_text": result.get(api["result_key"], "")}
        except Exception as e:
            logger.warning(f"Échec de l'API {api['url']}: {str(e)}")
            continue
    
    # Si toutes les API échouent
    return {
        "generated_text": "Désolé, je ne peux pas générer de réponse pour le moment."
    }
```

## Stratégies d'exécution côté client

Le front-end utilise un système de stratégie pour déterminer où exécuter les requêtes.

```typescript
export async function executeAIRequest(
  options: TextGenerationParameters,
  executionStrategy: 'local' | 'cloud',
  localAIUrl: string | null,
  localProvider: LLMProviderType,
  modelDownloadStatus: ModelDownloadStatus,
  cloudProvider: string = 'huggingface'
): Promise<TextGenerationResponse[]> {
  
  // Stratégie locale (API locale)
  if (executionStrategy === 'local') {
    // Cas Ollama
    if (localProvider === 'ollama') {
      return await callOllamaService(options, localAIUrl);
    }
    
    // Cas général: API locale Hugging Face
    const response = await fetch(`${localAIUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...}),
    });
    
    // Traitement de la réponse
    return [{ generated_text: data.generated_text || data.response || "" }];
  } 
  // Stratégie cloud (API distante)
  else {
    // Appel API cloud (Hugging Face, OpenAI, etc.)
    const cloudResponse = await fetch(`${apiUrl}${model}`, {...});
    return await cloudResponse.json();
  }
}
```

## Compatibilité système et détection de capacités

Le système analyse les ressources disponibles pour déterminer la meilleure stratégie.

```python
# Détection de GPU
def detect_gpu():
    """Détecte la présence et les capacités d'un GPU"""
    result = {"available": False, "info": None, "type": None, "memory_mb": 0}
    
    try:
        # Détection CUDA (PyTorch)
        import torch
        if torch.cuda.is_available():
            result["available"] = True
            result["type"] = "CUDA"
            result["info"] = torch.cuda.get_device_name(0)
            result["memory_mb"] = torch.cuda.get_device_properties(0).total_memory / (1024 * 1024)
            return result
    except:
        pass
        
    # Autres méthodes de détection (ROCm, MPS, etc.)
    # ...
    
    return result
```
