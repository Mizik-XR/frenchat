
# Module RAG et IA

## Principe du RAG (Retrieval Augmented Generation)

Le système RAG de FileChat combine la recherche d'information (retrieval) et la génération de texte (generation) pour fournir des réponses précises et contextualisées:

1. **Indexation des documents** (phase offline)
   - Les documents sont découpés en chunks significatifs
   - Des embeddings vectoriels sont générés pour chaque chunk
   - Ces embeddings sont stockés dans une base de données vectorielle

2. **Recherche de contexte** (au moment de la requête)
   - La question de l'utilisateur est convertie en embedding
   - Les chunks les plus similaires sont retrouvés par similarité cosinus
   - Ces chunks forment le contexte pertinent pour la question

3. **Génération de réponse**
   - Le contexte et la question sont envoyés au modèle de langage
   - Le modèle génère une réponse basée sur ce contexte spécifique
   - La réponse est présentée à l'utilisateur avec des citations sources

## Architecture IA de FileChat

### Modèles d'IA supportés

1. **Modèles locaux** (par défaut)
   - **Ollama**: modèles comme llama2, mistral, phi
   - **Transformers.js**: modèles Hugging Face en JavaScript
   - **Serveur local**: API Python sur le port 8000

2. **Modèles cloud**
   - **Hugging Face**: via l'API Inference
   - **OpenAI**: modèles GPT (optionnel)
   - **Azure OpenAI**: déploiements privés (optionnel)
   - **Anthropic Claude**: alternative à GPT (optionnel)

### Configuration des modèles

La configuration des modèles est stockée dans la table `user_ai_configs`:

```typescript
interface AIConfig {
  provider: string;       // 'local', 'huggingface', 'openai', etc.
  model_name: string;     // 'llama2', 'mistral', 'gpt-4', etc.
  api_key?: string;       // Clé API (pour les services cloud)
  api_endpoint?: string;  // Point d'accès personnalisé
  config: {
    temperature: number;  // Contrôle de la créativité (0.0-1.0)
    max_tokens: number;   // Longueur maximale de réponse
    top_p: number;        // Sampling de probabilité (0.0-1.0)
    // Autres paramètres spécifiques au modèle
  }
}
```

L'interface de configuration permet aux utilisateurs de:
- Choisir le fournisseur de modèle (local ou cloud)
- Sélectionner un modèle spécifique
- Ajuster les paramètres de génération
- Sauvegarder plusieurs configurations

### Serveur IA local

Le serveur IA local (`serve_model.py`) offre:

- **Indépendance** des services cloud
- **Confidentialité** des données
- **Réduction des coûts** (pas de frais d'API)
- **Contrôle** sur le modèle utilisé

Configuration typique:

```python
# Exemple de configuration dans serve_model.py
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.1"  # Modèle à utiliser
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"  # GPU si disponible
MAX_LENGTH = 2048  # Longueur maximale de sortie
PORT = 8000  # Port du serveur
```

## Stratégies d'amélioration RAG

FileChat implémente plusieurs stratégies pour améliorer la qualité des réponses:

### 1. Chunking intelligent

- **Chunking par paragraphes** plutôt que par nombre fixe de tokens
- **Chevauchement** entre chunks pour éviter de perdre le contexte
- **Métadonnées** conservées pour chaque chunk (source, titre, etc.)

### 2. Recherche hybride

- **Recherche vectorielle** pour la similarité sémantique
- **Filtres sur les métadonnées** pour affiner les résultats
- **Reranking** des résultats par pertinence

### 3. Mécanismes de mémoire

- **Historique de conversation** pour maintenir le contexte
- **Citations explicites** des sources dans les réponses
- **Réutilisation des chunks** pertinents entre questions similaires

## Visualisation de données

FileChat intègre un système avancé de visualisation de données numériques:

### 1. Générateur de graphiques

- **Interface intégrée** au chat
- **Détection automatique** des fichiers CSV
- **Validation des données** avec feedback immédiat
- **Types de graphiques** multiples (barres, camembert, lignes, nuage de points)
- **Personnalisation** des axes et paramètres
- **Export** en format image

### 2. Processus d'utilisation

1. L'utilisateur upload un fichier CSV dans le chat
2. Le système détecte le format et propose l'interface de génération de graphiques
3. L'utilisateur choisit le type de graphique et configure les paramètres
4. Le graphique est généré et peut être inséré directement dans la conversation
5. Le graphique devient un élément de contexte que l'IA peut référencer

### 3. Avantages par rapport à DALL-E

- **Précision numérique** supérieure
- **Personnalisation** plus poussée
- **Rapidité** de génération
- **Pas de dépendance** à une API externe
- **Validation des données** en temps réel

### 4. Usage dans le chat

```javascript
// Exemple d'ajout d'un graphique dans la conversation
const handleChartGenerated = (imageUrl) => {
  setInput(input + `\n![Graphique généré](${imageUrl})`);
  setShowChartGenerator(false);
};
```

## Suivi des coûts et utilisation

FileChat fournit une interface de suivi des coûts pour les différents modèles d'IA:

### 1. Suivi de l'utilisation des tokens

- **Comptage automatique** des tokens utilisés par conversation
- **Ventilation par modèle** et par fournisseur
- **Historique d'utilisation** pour analyser les tendances

### 2. Estimation des coûts

- **Calcul des coûts** basé sur les tarifs actuels des fournisseurs
- **Comparaison** entre différents modèles
- **Prévisions** basées sur l'utilisation actuelle

### 3. Dashboard intégré

- **Tableau de bord** accessible depuis les paramètres
- **Métriques clés** visibles en un coup d'œil
- **Filtres temporels** (jour, semaine, mois)
- **Export des données** pour analyse externe

```typescript
// Structure des données d'utilisation
interface AIUsageMetric {
  model_name: string;
  provider: string;
  tokens_input: number;
  tokens_output: number;
  estimated_cost: number;
  operation_type: 'chat' | 'embedding' | 'indexing';
  created_at: string;
}
```

### 4. Alertes et limites

- **Seuils d'alerte** configurables
- **Notification** en cas d'utilisation élevée
- **Limites mensuelles** paramétrables
- **Mode économie** automatique

## Intégration de modèles alternatifs

Pour configurer un modèle alternatif (comme OpenAI):

1. Accédez à la section "Configuration IA" dans les paramètres
2. Sélectionnez le fournisseur (OpenAI, Anthropic, etc.)
3. Entrez votre clé API (stockée de manière sécurisée)
4. Sélectionnez le modèle spécifique
5. Ajustez les paramètres selon vos besoins

Exemple de configuration OpenAI:

```javascript
// Exemple de requête à l'API OpenAI
const generateResponse = async (prompt, context) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {role: 'system', content: 'You are a helpful assistant...'},
        {role: 'user', content: `Context: ${context}\n\nQuestion: ${prompt}`}
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

## Système de templates pour documents

FileChat inclut un système de templates pour générer des documents structurés:

1. **Templates prédéfinis**
   - Business plans
   - Demandes de subvention
   - Rapports d'analyse
   - Synthèses de documents

2. **Structure d'un template**

```typescript
interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  content_structure: {
    sections: Array<{
      title: string;
      prompts: string[];
      max_length: number;
      required: boolean;
    }>;
    metadata: {
      target_audience: string;
      difficulty: string;
      estimated_completion_time: string;
    };
  };
}
```

3. **Processus de génération**
   - Sélection d'un template
   - Remplissage des informations clés
   - Génération IA des sections
   - Prévisualisation et édition manuelle
   - Export vers le format désiré (DOCX, PDF, Google Doc)
