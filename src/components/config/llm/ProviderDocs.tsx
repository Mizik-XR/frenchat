
import React from '@/core/reactInstance';

interface DocsSectionProps {
  title: string;
  children: React.ReactNode;
}

function DocsSection({ title, children }: DocsSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm">{title}</h3>
      {children}
    </div>
  );
}

export function TransformersInstallDocs() {
  return (
    <div className="space-y-6 text-sm bg-slate-50 p-4 rounded-lg border">
      <DocsSection title="Installation locale de Transformers">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Option 1 : Installation directe avec pip</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Installez Python (3.8 ou supérieur) depuis 
                <a href="https://www.python.org/downloads/" target="_blank" rel="noopener" className="text-blue-600 hover:underline ml-1">
                  python.org
                </a>
              </li>
              <li>Ouvrez un terminal et installez les dépendances :
                <pre className="bg-gray-100 p-2 mt-1 rounded font-mono text-xs">
                  pip install transformers torch accelerate datasets
                </pre>
              </li>
              <li>Créez un script Python <code>serve_model.py</code> :
                <pre className="bg-gray-100 p-2 mt-1 rounded font-mono text-xs whitespace-pre-wrap">
{`from transformers import pipeline
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()
model = pipeline("text-generation", model="facebook/opt-125m")

class GenerationInput(BaseModel):
    prompt: str
    max_length: int = 100

@app.post("/generate")
async def generate_text(input_data: GenerationInput):
    result = model(input_data.prompt, max_length=input_data.max_length)
    return {"generated_text": result[0]["generated_text"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)`}
                </pre>
              </li>
              <li>Installez FastAPI et uvicorn :
                <pre className="bg-gray-100 p-2 mt-1 rounded font-mono text-xs">
                  pip install fastapi uvicorn
                </pre>
              </li>
              <li>Lancez le serveur :
                <pre className="bg-gray-100 p-2 mt-1 rounded font-mono text-xs">
                  python serve_model.py
                </pre>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-2">Option 2 : Utilisation de Docker</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Installez Docker depuis 
                <a href="https://docs.docker.com/get-docker/" target="_blank" rel="noopener" className="text-blue-600 hover:underline ml-1">
                  docker.com
                </a>
              </li>
              <li>Créez un fichier <code>Dockerfile</code> :
                <pre className="bg-gray-100 p-2 mt-1 rounded font-mono text-xs whitespace-pre-wrap">
{`FROM python:3.9-slim

WORKDIR /app
COPY serve_model.py .

RUN pip install transformers torch accelerate datasets fastapi uvicorn

EXPOSE 8000
CMD ["python", "serve_model.py"]`}
                </pre>
              </li>
              <li>Construisez l&apos;image :
                <pre className="bg-gray-100 p-2 mt-1 rounded font-mono text-xs">
                  docker build -t transformers-api .
                </pre>
              </li>
              <li>Lancez le conteneur :
                <pre className="bg-gray-100 p-2 mt-1 rounded font-mono text-xs">
                  docker run -p 8000:8000 transformers-api
                </pre>
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-2">Notes importantes</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Assurez-vous d&apos;avoir au moins 8 Go de RAM disponible</li>
              <li>La première exécution téléchargera le modèle (~500 Mo - 2 Go)</li>
              <li>Pour les modèles plus grands, augmentez la RAM Docker à 16 Go</li>
              <li>L&apos;API sera accessible sur <code>http://localhost:8000</code></li>
              <li>Testez avec <code>curl -X POST http://localhost:8000/generate -H &quot;Content-Type: application/json&quot; -d &apos;{`{"prompt": "Hello"}`}&apos;</code></li>
            </ul>
          </div>
        </div>
      </DocsSection>
    </div>
  );
}
