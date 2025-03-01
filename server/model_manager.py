
"""
Gestion du modèle d'IA pour le serveur d'inférence
"""
import traceback
from .config import logger, DEFAULT_MODEL, FALLBACK_MODE, MODEL_LOADED, model, tokenizer
from .system_analyzer import analyze_system_resources

def lazy_load_model():
    """Charge le modèle seulement quand nécessaire"""
    global model, tokenizer, MODEL_LOADED
    
    if MODEL_LOADED:
        return True
        
    try:
        logger.info(f"Chargement du modèle {DEFAULT_MODEL}...")
        
        # En mode light (sans Rust), on ne charge pas réellement le modèle
        if FALLBACK_MODE:
            logger.info("Mode léger activé: utilisation d'une API externe pour l'inférence")
            MODEL_LOADED = True
            return True
            
        # Analyser les ressources système
        system_resources = analyze_system_resources()
        
        # Si les ressources système sont trop faibles, passer en mode fallback
        if not system_resources["can_run_local_model"]:
            logger.warning("Ressources système insuffisantes, passage en mode léger (API externe)")
            global FALLBACK_MODE
            FALLBACK_MODE = True
            MODEL_LOADED = True
            return True
            
        # Sinon, on essaie de charger le modèle localement
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
        model = AutoModelForCausalLM.from_pretrained(
            DEFAULT_MODEL, 
            torch_dtype=torch.float16, 
            device_map="auto"
        )
        logger.info("Modèle chargé avec succès")
        MODEL_LOADED = True
        return True
        
    except Exception as e:
        error_msg = f"Erreur lors du chargement du modèle: {str(e)}"
        logger.error(error_msg)
        traceback.print_exc()
        
        if "CUDA" in str(e) or "GPU" in str(e):
            logger.info("Erreur GPU détectée, passage en mode CPU")
            try:
                import torch
                from transformers import AutoTokenizer, AutoModelForCausalLM
                
                tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
                model = AutoModelForCausalLM.from_pretrained(
                    DEFAULT_MODEL,
                    device_map="cpu"
                )
                logger.info("Modèle chargé en mode CPU avec succès")
                MODEL_LOADED = True
                return True
            except Exception as cpu_e:
                logger.error(f"Échec du chargement en mode CPU: {str(cpu_e)}")
                
        # En cas d'erreur, on passe en mode fallback
        logger.warning("Passage en mode léger (API externe)")
        global FALLBACK_MODE
        FALLBACK_MODE = True
        MODEL_LOADED = True
        return True

async def fallback_generate(input_data):
    """Utilise une API externe quand le modèle local n'est pas disponible"""
    import aiohttp
    
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
            "result_key": "response"
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
            "result_key": "generated_text"
        }
    ]
    
    for api in apis:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(api["url"], json=api["data"], timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        if isinstance(result, list) and len(result) > 0:
                            return {"generated_text": result[0].get(api["result_key"], "")}
                        return {"generated_text": result.get(api["result_key"], "")}
        except Exception as e:
            logger.warning(f"Échec de l'API {api['url']}: {str(e)}")
            continue
    
    # Si toutes les API échouent, on renvoie un message d'erreur
    logger.error("Toutes les API ont échoué")
    return {
        "generated_text": "Désolé, je ne peux pas générer de réponse pour le moment. "
                         "Veuillez vérifier votre connexion internet ou essayer plus tard."
    }
