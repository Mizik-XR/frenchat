/**
 * Tests pour le service Supabase
 * 
 * Ce fichier contient les tests unitaires pour le service Supabase.
 * Il utilise Jest et Mock Service Worker pour simuler les appels API.
 */

import { supabaseService } from '../index';
import { getSupabaseClient, resetSupabaseClient } from '@/integrations/supabase/client';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import type { Database } from '@/services/supabase';

// Configuration du serveur mock
const server = setupServer();

// Données de test
const mockUser = {
  id: '123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg'
};

const mockConversation = {
  id: '456',
  title: 'Test Conversation',
  user_id: mockUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_message_at: new Date().toISOString()
};

const mockMessage = {
  id: '789',
  content: 'Test Message',
  role: 'user' as const,
  conversation_id: mockConversation.id,
  created_at: new Date().toISOString(),
  metadata: null
};

// Configuration des tests
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  resetSupabaseClient();
});
afterAll(() => server.close());

describe('Service Supabase', () => {
  describe('Authentication', () => {
    it('devrait se connecter avec succès', async () => {
      server.use(
        rest.post('*/auth/v1/token', (req, res, ctx) => {
          return res(
            ctx.json({
              user: mockUser,
              session: {
                access_token: 'test-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600
              }
            })
          );
        })
      );

      const result = await supabaseService.auth.signIn('test@example.com', 'password');
      expect(result.user).toEqual(mockUser);
    });

    it('devrait s\'inscrire avec succès', async () => {
      server.use(
        rest.post('*/auth/v1/signup', (req, res, ctx) => {
          return res(
            ctx.json({
              user: mockUser,
              session: {
                access_token: 'test-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600
              }
            })
          );
        })
      );

      const result = await supabaseService.auth.signUp('test@example.com', 'password');
      expect(result.user).toEqual(mockUser);
    });

    it('devrait se déconnecter avec succès', async () => {
      server.use(
        rest.post('*/auth/v1/logout', (req, res, ctx) => {
          return res(ctx.json({}));
        })
      );

      await expect(supabaseService.auth.signOut()).resolves.not.toThrow();
    });
  });

  describe('Database', () => {
    it('devrait récupérer les données avec succès', async () => {
      server.use(
        rest.get('*/rest/v1/conversations', (req, res, ctx) => {
          return res(ctx.json([mockConversation]));
        })
      );

      const result = await supabaseService.database.query('conversations', {
        eq: { user_id: mockUser.id }
      });
      expect(result).toEqual([mockConversation]);
    });

    it('devrait insérer des données avec succès', async () => {
      server.use(
        rest.post('*/rest/v1/messages', (req, res, ctx) => {
          return res(ctx.json([mockMessage]));
        })
      );

      const result = await supabaseService.database.insert('messages', mockMessage);
      expect(result).toEqual([mockMessage]);
    });

    it('devrait mettre à jour des données avec succès', async () => {
      const updatedMessage = { ...mockMessage, content: 'Updated Message' };
      server.use(
        rest.patch('*/rest/v1/messages', (req, res, ctx) => {
          return res(ctx.json([updatedMessage]));
        })
      );

      const result = await supabaseService.database.update('messages', 
        { content: 'Updated Message' },
        { id: mockMessage.id }
      );
      expect(result).toEqual([updatedMessage]);
    });

    it('devrait supprimer des données avec succès', async () => {
      server.use(
        rest.delete('*/rest/v1/messages', (req, res, ctx) => {
          return res(ctx.json([mockMessage]));
        })
      );

      const result = await supabaseService.database.delete('messages', {
        id: mockMessage.id
      });
      expect(result).toEqual([mockMessage]);
    });
  });

  describe('Storage', () => {
    it('devrait uploader un fichier avec succès', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      server.use(
        rest.post('*/storage/v1/object/documents/test.txt', (req, res, ctx) => {
          return res(ctx.json({ Key: 'documents/test.txt' }));
        })
      );

      const result = await supabaseService.storage.uploadFile('documents', 'test.txt', mockFile);
      expect(result).toEqual({ Key: 'documents/test.txt' });
    });

    it('devrait télécharger un fichier avec succès', async () => {
      server.use(
        rest.get('*/storage/v1/object/documents/test.txt', (req, res, ctx) => {
          return res(ctx.text('test'));
        })
      );

      const result = await supabaseService.storage.downloadFile('documents', 'test.txt');
      expect(result).toBeDefined();
    });

    it('devrait lister les fichiers avec succès', async () => {
      server.use(
        rest.get('*/storage/v1/object/list/documents', (req, res, ctx) => {
          return res(ctx.json([{ name: 'test.txt' }]));
        })
      );

      const result = await supabaseService.storage.listFiles('documents', '');
      expect(result).toEqual([{ name: 'test.txt' }]);
    });
  });

  describe('Realtime', () => {
    it('devrait s\'abonner avec succès', () => {
      const callback = jest.fn();
      const subscription = supabaseService.realtime.subscribe('messages', callback);
      expect(subscription).toBeDefined();
    });

    it('devrait se désabonner avec succès', () => {
      const callback = jest.fn();
      const subscription = supabaseService.realtime.subscribe('messages', callback);
      expect(() => supabaseService.realtime.unsubscribe(subscription)).not.toThrow();
    });
  });
}); 