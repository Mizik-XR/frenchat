
"""
Module pour l'inférence de modèle et les modes de repli
"""
import traceback
import json
from typing import Dict, Any, Optional
from .config import logger

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
    
    # Valider l'entrée utilisateur avant de l'envoyer aux API
    def validate_input() -> Optional[str]:
        if not isinstance(input_data.prompt, str):
            return "Le prompt doit être une chaîne de caractères"
        if len(input_data.prompt) > 10000:
            return "Le prompt est trop long (max 10000 caractères)"
        return None
    
    validation_error = validate_input()
    if validation_error:
        logger.warning(f"Validation d'entrée échouée: {validation_error}")
        return {"generated_text": f"Erreur: {validation_error}"}
    
    for api in apis:
        try:
            # Configuration sécurisée d'aiohttp avec timeout et limites
            timeout = ClientTimeout(total=api["timeout"])
            conn = aiohttp.TCPConnector(ssl=True, limit=10)
            
            async with aiohttp.ClientSession(connector=conn, timeout=timeout) as session:
                # Ajout d'en-têtes de sécurité et validation
                headers = {
                    "Content-Type": "application/json",
                    "User-Agent": "FileChat/1.0",
                    "X-Request-ID": f"filechat-{id(input_data)}"
                }
                
                try:
                    async with session.post(
                        api["url"], 
                        json=api["data"], 
                        headers=headers,
                        raise_for_status=True
                    ) as response:
                        if response.status == 200:
                            # Validation et traitement sécurisé des réponses JSON
                            try:
                                result = await response.json(content_type=None)
                                
                                # Validation du format de réponse
                                if isinstance(result, list) and len(result) > 0:
                                    if api["result_key"] in result[0]:
                                        return {"generated_text": result[0].get(api["result_key"], "")}
                                elif isinstance(result, dict):
                                    if api["result_key"] in result:
                                        return {"generated_text": result.get(api["result_key"], "")}
                                
                                # Si le format ne correspond pas, réponse générique
                                return {"generated_text": "Réponse reçue mais dans un format inattendu."}
                            except json.JSONDecodeError:
                                logger.warning(f"Réponse non-JSON de {api['url']}")
                                continue
                except aiohttp.ClientResponseError as e:
                    logger.warning(f"Erreur HTTP {e.status} de {api['url']}: {e.message}")
                    continue
                
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            logger.warning(f"Échec de l'API {api['url']}: {str(e)}")
            continue
        except Exception as e:
            logger.error(f"Erreur inattendue avec {api['url']}: {str(e)}")
            continue
    
    # Si toutes les API échouent, on renvoie un message d'erreur
    logger.error("Toutes les API ont échoué")
    return {
        "generated_text": "Désolé, je ne peux pas générer de réponse pour le moment. "
                         "Veuillez vérifier votre connexion internet ou essayer plus tard."
    }
