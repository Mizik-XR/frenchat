
# Fonctions Edge Supabase

## Vue d'ensemble

Les fonctions Edge de Supabase sont des services serverless qui permettent d'exécuter du code côté serveur sans gérer d'infrastructure. FileChat les utilise pour l'authentification OAuth, l'indexation de documents, et d'autres tâches intensives.

## Fonctions principales

### 1. Secure API Proxy

Cette fonction sert d'intermédiaire sécurisé entre le client et les API tierces comme OpenAI, Anthropic ou Google.

```typescript
// Extrait de secure-api-proxy/index.ts
serve(async (req) => {
  // Vérification d'authentification
  const { data: sessionData, error: sessionError } = 
    await supabase.auth.getUser(authHeader.split(' ')[1]);
  
  if (sessionError || !sessionData.user) {
    throw new Error('Non autorisé : Session invalide');
  }
  
  // Routage vers le service approprié
  const { service, endpoint, method, payload } = await req.json();
  
  switch (service) {
    case 'openai':
      // Configuration pour OpenAI
      break;
    case 'anthropic':
      // Configuration pour Anthropic
      break;
    // ...
  }
  
  // Exécution de la requête avec les en-têtes appropriés
  const apiResponse = await fetch(url, {...});
  
  // Journalisation et retour du résultat
  return new Response(JSON.stringify(responseData), {...});
});
```

### 2. RAG Indexing

Gère l'indexation vectorielle des documents pour la recherche sémantique.

```typescript
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { action, query, filters, useHybridSearch = true } = await req.json();
  
  if (action === 'search') {
    // Obtenir l'embedding de la requête
    const embedding = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: query
    });

    // Construction de la requête SQL avec scoring hybride
    let sqlQuery = `
      WITH ranked_results AS (
        // ... requête SQL complexe
      )
      SELECT 
        *,
        CASE 
          WHEN $2 = true THEN 
            (vector_similarity * 0.7 + text_similarity * 0.3)
          ELSE vector_similarity
        END as final_score
      FROM ranked_results
      // ...
    `;

    // Re-ranking avec Cross-Encoder si activé
    if (useHybridSearch && results.length > 0) {
      // ... logique de re-ranking
    }
    
    return new Response(JSON.stringify({results, metadata}), {...});
  }
});
```

### 3. OAuth Handlers

Gèrent l'authentification et les tokens d'accès pour Google Drive et Microsoft Teams.

## Sécurité

Toutes les fonctions Edge implémentent des mesures de sécurité :

1. **Validation des tokens JWT** pour authentifier les utilisateurs
2. **En-têtes CORS** pour contrôler l'accès depuis différentes origines
3. **Stockage chiffré** des tokens d'accès et refresh tokens
4. **Validation des entrées** pour prévenir les injections
5. **Journalisation sécurisée** excluant les données sensibles

## Déploiement

Les fonctions Edge sont déployées automatiquement lors du déploiement de l'application. Elles s'exécutent dans l'environnement Supabase et sont accessibles via des endpoints sécurisés.
