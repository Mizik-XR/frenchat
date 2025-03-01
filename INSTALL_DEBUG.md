
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

### Solution
1. Installation manuelle de Rust:
   - Windows: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh` dans PowerShell
   - Linux/Mac: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

2. Après l'installation, redémarrez votre terminal et vérifiez:
   ```
   rustc --version
   cargo --version
   ```

3. Réinstallez les dépendances:
   ```
   pip install -r requirements.txt
   ```

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

## Besoin d'aide supplémentaire?
Si les problèmes persistent, lancez l'outil de diagnostic et partagez les résultats pour obtenir une assistance plus précise.
