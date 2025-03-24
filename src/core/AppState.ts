/**
 * Gestionnaire d'état de l'application
 * 
 * Ce module gère l'état global de l'application en évitant les dépendances circulaires.
 * Il utilise le service Supabase centralisé pour les opérations de base de données.
 */

import { supabaseService } from '@/services/supabase';
import type { Database } from '@/services/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];

interface AppState {
  user: User | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  documents: Document[];
  isLoading: boolean;
  error: string | null;
}

class AppStateManager {
  private static instance: AppStateManager;
  private state: AppState = {
    user: null,
    conversations: [],
    currentConversation: null,
    messages: [],
    documents: [],
    isLoading: false,
    error: null
  };

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  private async initialize() {
    try {
      this.state.isLoading = true;
      const session = await supabaseService.auth.getSession();
      
      if (session) {
        this.state.user = await supabaseService.auth.getUser();
        await this.loadUserData();
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
      this.state.isLoading = false;
    }
  }

  private async loadUserData() {
    if (!this.state.user) return;

    try {
      // Charger les conversations
      const conversations = await supabaseService.database.query<Conversation>('conversations', {
        eq: { user_id: this.state.user.id },
        order: { column: 'updated_at', ascending: false }
      });
      this.state.conversations = conversations;

      // Charger les documents
      const documents = await supabaseService.database.query<Document>('documents', {
        eq: { user_id: this.state.user.id },
        order: { column: 'updated_at', ascending: false }
      });
      this.state.documents = documents;

      // Si une conversation est sélectionnée, charger ses messages
      if (this.state.currentConversation) {
        await this.loadMessages(this.state.currentConversation.id);
      }
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Une erreur est survenue';
    }
  }

  public async loadMessages(conversationId: string) {
    try {
      const messages = await supabaseService.database.query<Message>('messages', {
        eq: { conversation_id: conversationId },
        order: { column: 'created_at', ascending: true }
      });
      this.state.messages = messages;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Une erreur est survenue';
    }
  }

  public async createConversation(title: string) {
    if (!this.state.user) return null;

    try {
      const newConversation = await supabaseService.database.insert<Conversation>('conversations', {
        title,
        user_id: this.state.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      this.state.conversations.unshift(newConversation[0]);
      this.state.currentConversation = newConversation[0];
      return newConversation[0];
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Une erreur est survenue';
      return null;
    }
  }

  public async sendMessage(content: string, role: 'user' | 'assistant' = 'user') {
    if (!this.state.currentConversation || !this.state.user) return null;

    try {
      const newMessage = await supabaseService.database.insert<Message>('messages', {
        content,
        role,
        conversation_id: this.state.currentConversation.id,
        created_at: new Date().toISOString()
      });

      this.state.messages.push(newMessage[0]);

      // Mettre à jour la conversation
      await supabaseService.database.update<Conversation>('conversations', {
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      }, {
        id: this.state.currentConversation.id
      });

      return newMessage[0];
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Une erreur est survenue';
      return null;
    }
  }

  public async uploadDocument(file: File, title: string) {
    if (!this.state.user) return null;

    try {
      const path = `${this.state.user.id}/${Date.now()}-${file.name}`;
      await supabaseService.storage.uploadFile('documents', path, file);

      const newDocument = await supabaseService.database.insert<Document>('documents', {
        title,
        content: '', // Le contenu sera traité de manière asynchrone
        user_id: this.state.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      this.state.documents.unshift(newDocument[0]);
      return newDocument[0];
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Une erreur est survenue';
      return null;
    }
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public setCurrentConversation(conversation: Conversation | null) {
    this.state.currentConversation = conversation;
    if (conversation) {
      this.loadMessages(conversation.id);
    } else {
      this.state.messages = [];
    }
  }
}

export const appState = AppStateManager.getInstance(); 