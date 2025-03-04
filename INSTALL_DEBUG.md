
# Guide de dépannage de l'installation FileChat

Si vous rencontrez des problèmes lors de l'installation de FileChat, voici quelques étapes pour résoudre les problèmes courants.

## Problème 1: Erreur d'installation de PyTorch

### Symptômes
- Erreur: "Could not find a version that satisfies the requirement torch==2.0.1+cpu"
- Erreur lors de l'installation des dépendances Python

### Solution
1. Exécutez le script de diagnostic pour vérifier votre environnement:
   - Windows: `scripts\diagnostic.bat`
   - Linux/Mac: `scripts/unix/diagnostic.sh`

2. Installation manuelle de PyTorch:
   ```
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
   ```

3. Puis réinstallation des autres dépendances:
   ```
   pip install -r requirements.txt
   ```

## Problème 2: Erreur liée à Rust/Cargo manquant

### Symptômes
- Erreur: "Cargo, the Rust package manager, is not installed or is not on PATH"
- Problèmes avec l'installation de `tokenizers` ou `bitsandbytes`
- Messages "error: subprocess-exited-with-error" lors de l'installation des packages Python

### Solution
1. Méthode automatique (recommandée):
   - Réexécutez simplement le script `setup-venv.bat` qui tentera d'installer Rust automatiquement
   - Ou exécutez `scripts\prepare-deployment.bat` qui inclut cette fonctionnalité

2. Installation manuelle de Rust:
   - Windows: 
     ```
     curl -O https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe
     rustup-init.exe -y
     ```
   - Linux/Mac: 
     ```
     curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
     source "$HOME/.cargo/env"
     ```

3. Après l'installation, redémarrez votre terminal et vérifiez:
   ```
   rustc --version
   cargo --version
   ```

4. Alternative sans Rust (mode léger):
   - Définissez la variable d'environnement `NO_RUST_INSTALL=1`
   - Relancez le script d'installation:
     - Windows: `set NO_RUST_INSTALL=1 && scripts\setup-venv.bat`
     - Linux/Mac: `NO_RUST_INSTALL=1 bash scripts/unix/setup-venv.sh`

## Problème 3: Mémoire insuffisante lors du chargement des modèles

### Symptômes
- L'application plante lors du chargement des modèles d'IA
- Erreurs de mémoire insuffisante

### Solution
1. Utilisez un modèle plus léger dans `serve_model.py` en remplaçant:
   ```python
   DEFAULT_MODEL = "distilgpt2"  # au lieu de "mistralai/Mistral-7B-Instruct-v0.1"
   ```

2. Ajustez les paramètres de quantification pour réduire l'empreinte mémoire:
   ```python
   model = AutoModelForCausalLM.from_pretrained(
       DEFAULT_MODEL, 
       torch_dtype=torch.float16,
       low_cpu_mem_usage=True,
       device_map="auto"
   )
   ```

## Problème 4: Utilisation alternative avec Ollama

Si vous rencontrez des difficultés avec l'installation complète, vous pouvez utiliser Ollama comme alternative:

1. Téléchargez et installez Ollama depuis [https://ollama.ai/download](https://ollama.ai/download)
2. Exécutez Ollama et téléchargez un modèle adapté:
   ```
   ollama pull llama2
   ```
3. Lancez FileChat en mode cloud uniquement:
   - Windows: `start-cloud-mode.bat`
   - Linux/Mac: `MODE_CLOUD=1 bash scripts/unix/start-app-simplified.sh`

## Problème 5: Échec de compilation des packages Python

### Symptômes
- Erreurs lors de la compilation des packages Python
- Messages d'erreur "error: subprocess-exited-with-error"
- Messages indiquant que des outils de développement sont manquants

### Solution pour Windows
1. Installez les Visual C++ Build Tools:
   - Téléchargez et installez [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Lors de l'installation, sélectionnez "Développement Desktop en C++"

2. Réinstallez les packages Python:
   ```
   pip install -r requirements.txt
   ```

3. Si les problèmes persistent, utilisez le mode léger:
   ```
   set NO_RUST_INSTALL=1
   scripts\setup-venv.bat
   ```

## Besoin d'aide supplémentaire?
Si les problèmes persistent, lancez l'outil de diagnostic et partagez les résultats pour obtenir une assistance plus précise.
```
scripts\diagnostic.bat
```

