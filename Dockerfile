
FROM python:3.9-slim

WORKDIR /app

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers nécessaires
COPY requirements.txt .
COPY serve_model.py .

# Installation des dépendances Python
RUN pip3 install --no-cache-dir -r requirements.txt

# Installation de torch CPU
RUN pip3 install --no-cache-dir torch==2.0.1+cpu --index-url https://download.pytorch.org/whl/cpu

# Exposition du port
EXPOSE 8000

# Commande de démarrage
CMD ["python", "serve_model.py"]
