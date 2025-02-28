
import React from 'react';
import { Bell, CheckCheck, Trash2, Share2, FileCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useUserNotifications, UserNotification } from '@/hooks/useUserNotifications';

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'shared_folder':
      return <Share2 className="h-4 w-4 text-blue-500" />;
    case 'indexing_complete':
      return <FileCheck className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  }
};

function formatRelativeTime(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  
  return format(past, 'dd/MM/yyyy');
}

const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: UserNotification, 
  onMarkAsRead: (id: string) => void, 
  onDelete: (id: string) => void 
}) => {
  return (
    <Card className={`mb-2 ${notification.is_read ? 'bg-muted/30' : 'bg-white border-l-4 border-l-blue-500'}`}>
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NotificationIcon type={notification.notification_type} />
            <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatRelativeTime(notification.created_at)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1 pb-1">
        <CardDescription className="text-sm text-foreground">
          {notification.message}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-2 flex justify-end gap-1">
        {!notification.is_read && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2" 
            onClick={() => onMarkAsRead(notification.id)}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Marquer comme lu</span>
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-muted-foreground hover:text-destructive" 
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useUserNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 px-1.5 h-5 min-w-5 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <span className="text-sm text-muted-foreground">Chargement...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
              <span className="text-sm text-muted-foreground">Aucune notification</span>
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
