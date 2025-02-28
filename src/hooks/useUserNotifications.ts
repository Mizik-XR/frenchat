
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  notification_type: 'shared_folder' | 'indexing_complete' | 'system';
  is_read: boolean;
  data: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export function useUserNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('expires_at', null) // Seulement les notifications qui n'ont pas expiré
        .order('created_at', { ascending: false })
        .limit(50); // Limiter pour optimiser les performances
        
      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    fetchNotifications();
    
    // Abonnement aux changements en temps réel
    if (user) {
      const subscription = supabase
        .channel('user_notifications_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          // Actualiser les notifications lors d'un changement
          fetchNotifications();
          
          // Afficher une notification toast pour les nouvelles notifications
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as UserNotification;
            toast({
              title: newNotif.title,
              description: newNotif.message,
            });
          }
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchNotifications, toast]);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Mettre à jour localement
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Mettre à jour localement
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Mettre à jour localement
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
