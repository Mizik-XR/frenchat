
import { DemoStage } from "./types";

export const DEMO_STAGES: DemoStage[] = [
  'intro',
  'auth',
  'config',
  'indexing',
  'chat',
  'conclusion'
];

export const STAGE_DESCRIPTIONS: Record<DemoStage, string> = {
  intro: "Bienvenue dans la démo de FileChat",
  auth: "Authentification avec Supabase",
  config: "Configuration des sources de documents",
  indexing: "Indexation des documents",
  chat: "Dialogue avec vos documents",
  conclusion: "Récapitulatif des fonctionnalités"
};

export const STAGE_DETAILS: Record<DemoStage, string> = {
  intro: "FileChat est une application qui permet d'indexer vos documents provenant de différentes sources et d'interagir avec eux via une interface de chat IA. Dans cette démo, nous allons explorer les fonctionnalités principales de l'application.",
  auth: "FileChat utilise Supabase pour l'authentification. Les utilisateurs peuvent se connecter avec leur email et un mot de passe, ou utiliser l'authentification OAuth avec Google ou Microsoft.",
  config: "Configurez facilement vos sources de documents comme Google Drive ou Microsoft Teams. FileChat s'occupe d'indexer vos documents pour les rendre interrogeables.",
  indexing: "Le processus d'indexation analyse vos documents et extrait leur contenu pour permettre des recherches précises et des réponses pertinentes.",
  chat: "Posez des questions à vos documents dans un format conversationnel. L'IA utilise les documents indexés pour générer des réponses précises avec des références aux sources.",
  conclusion: "Vous avez découvert les principales fonctionnalités de FileChat. Cette application vous permet de centraliser, indexer et interroger vos documents de manière intuitive."
};
