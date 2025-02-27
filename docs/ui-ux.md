
# UI/UX : Style "WhatsApp"

## Conception de l'interface

FileChat adopte une interface inspirée de WhatsApp pour garantir une expérience utilisateur intuitive et familière:

### 1. Layout général

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────┐  ┌─────────────────────────────────┐ │
│  │                   │  │                                 │ │
│  │   Liste des       │  │                                 │ │
│  │   conversations   │  │        Zone de chat            │ │
│  │                   │  │                                 │ │
│  │   [Dossiers]      │  │                                 │ │
│  │   [Conversations] │  │                                 │ │
│  │   [Archivées]     │  │                                 │ │
│  │                   │  │                                 │ │
│  │                   │  │                                 │ │
│  │                   │  │                                 │ │
│  │                   │  │                                 │ │
│  │                   │  ├─────────────────────────────────┤ │
│  │                   │  │       Zone de saisie            │ │
│  └───────────────────┘  └─────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Composants principaux

- **Sidebar** (gauche): Liste des conversations, dossiers, filtres
- **ChatContainer** (droite): Affichage des messages et zone de saisie
- **MessageList**: Liste verticale des messages avec styles différenciés
- **ChatInput**: Zone de saisie avec options (envoi de fichiers, etc.)

## Fonctionnalités de type "WhatsApp"

### 1. Gestion des conversations

- **Création de conversations**: Bouton "+" pour démarrer une nouvelle conversation
- **Épinglage**: Option pour épingler les conversations importantes en haut de la liste
- **Archivage**: Déplacer les conversations terminées dans une section "Archivées"
- **Organisation en dossiers**: Regrouper les conversations par thème ou projet

### 2. Interaction avec les messages

- **Répondre à un message spécifique**: Citer un message antérieur dans la réponse
- **Réactions**: Ajouter des réactions rapides aux messages (like, etc.)
- **Actions contextuelles**: Menu d'options au survol ou clic droit sur un message
- **Mise en forme**: Support du markdown pour formater le texte

### 3. Styles visuels des messages

```
┌───────────────────────────────┐
│                               │
│  ┌─────────────────────────┐  │
│  │                         │  │
│  │  Message utilisateur    │  │
│  │                         │  │
│  └─────────────────────────┘  │
│                               │
│     ┌─────────────────────┐   │
│     │                     │   │
│     │  Réponse IA         │   │
│     │                     │   │
│     └─────────────────────┘   │
│                               │
│  ┌─────────────────────────┐  │
│  │ ┌─────────────────────┐ │  │
│  │ │ Message cité        │ │  │
│  │ └─────────────────────┘ │  │
│  │                         │  │
│  │ Réponse au message cité │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

- **Messages utilisateur**: Alignés à droite, fond coloré (souvent bleu)
- **Messages IA**: Alignés à gauche, fond clair avec bordure
- **Citations**: Affichées en plus petit avec une bordure latérale
- **Types de contenus**:
  - Texte simple
  - Markdown formaté
  - Code avec coloration syntaxique
  - Images/graphiques générés
  - Liens avec prévisualisation

## Modes d'interaction

### 1. Mode conversationnel standard

- Questions et réponses linéaires
- Historique de conversation préservé
- Contexte des questions précédentes maintenu

### 2. Mode analyse de document

- Visualisation du document à côté de la conversation
- Surlignage des parties du document référencées
- Possibilité de sélectionner une partie du document pour poser une question

### 3. Mode génération de document

- Formulaire guidé basé sur les templates
- Aperçu du document en cours de génération
- Options d'édition manuelle avant finalisation

## Composants UI réutilisables

FileChat utilise la bibliothèque shadcn/ui pour ses composants, avec une personnalisation en fonction du style "WhatsApp":

### Composants essentiels

- **Card**: Pour les messages, aperçus de documents
- **Button**: Actions principales et secondaires
- **Dropdown**: Menus contextuels
- **Dialog**: Fenêtres modales pour la configuration
- **Tooltip**: Infobulles d'aide
- **Tabs**: Navigation entre différentes sections
- **Avatar**: Représentation de l'utilisateur et de l'IA

### Adaptations de style

```css
/* Exemple de personnalisation pour les messages */
.message-user {
  @apply bg-blue-500 text-white rounded-lg p-3 ml-auto max-w-[80%];
}

.message-ai {
  @apply bg-gray-100 border border-gray-200 rounded-lg p-3 mr-auto max-w-[80%];
}

.message-quote {
  @apply bg-gray-50 border-l-4 border-gray-300 p-2 text-sm my-1;
}
```

## Onboarding et UX

### 1. Première utilisation

- **Tour guidé**: Présentation des fonctionnalités principales
- **Assistant de configuration**: Configuration pas à pas
- **Exemples interactifs**: Démonstration de cas d'usage

### 2. Aides contextuelles

- **Tooltips**: Explication des fonctionnalités au survol
- **Suggestions**: Propositions de questions ou actions
- **Feedbacks visuels**: Confirmation des actions effectuées

### 3. Responsive design

- **Adaptatif mobile**: Interface réorganisée pour petits écrans
- **Gestes tactiles**: Support du swipe et autres interactions tactiles
- **Affichage compact**: Version simplifiée pour les appareils mobiles
