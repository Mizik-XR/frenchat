
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("serve_model")

app = FastAPI()

try:
    logger.info("Chargement du modèle...")
    tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
    model = AutoModelForCausalLM.from_pretrained("distilgpt2")
    logger.info("Modèle chargé avec succès")
except Exception as e:
    logger.error(f"Erreur lors du chargement du modèle: {e}")
    raise

class GenerationInput(BaseModel):
    prompt: str
    max_length: Optional[int] = 100

@app.post("/generate")
async def generate_text(input_data: GenerationInput):
    try:
        inputs = tokenizer(input_data.prompt, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=input_data.max_length)
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return {"generated_text": result}
    except Exception as e:
        logger.error(f"Erreur lors de la génération: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
