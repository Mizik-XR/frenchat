
// Ajout de la définition de type Json si elle n'existe pas déjà
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
