
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  MessageSquare, 
  FileText, 
  BarChart, 
  Menu, 
  ChevronDown
} from 'lucide-react';
import { ModeToggle } from "../ThemeToggle";
import { UserAvatar } from '../auth/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../AuthProvider';
import { Badge } from '../ui/badge';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const NavBar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useUserNotifications();
  const [showMenu, setShowMenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const closeMobileMenu = () => {
    setShowMenu(false);
  };

  const renderNavLinks = () => (
    <>
      <Button
        asChild
        variant={isActive('/chat') ? 'default' : 'ghost'}
        size="sm"
        className="hidden md:flex"
      >
        <Link to="/chat">
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Link>
      </Button>
      <Button
        asChild
        variant={isActive('/documents') ? 'default' : 'ghost'}
        size="sm"
        className="hidden md:flex"
      >
        <Link to="/documents">
          <FileText className="h-4 w-4 mr-2" />
          Documents
        </Link>
      </Button>
      <Button
        asChild
        variant={isActive('/monitoring') ? 'default' : 'ghost'}
        size="sm"
        className="hidden md:flex"
      >
        <Link to="/monitoring">
          <BarChart className="h-4 w-4 mr-2" />
          Monitoring
        </Link>
      </Button>
      <Button
        asChild
        variant={isActive('/config') ? 'default' : 'ghost'}
        size="sm"
        className="hidden md:flex"
      >
        <Link to="/config">
          <Settings className="h-4 w-4 mr-2" />
          Configuration
        </Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img src="/favicon.ico" alt="filechat" className="mr-2 w-6 h-6" />
          <span className="font-bold text-lg">filechat</span>
        </Link>
      </div>

      <div className="flex-1 flex justify-center">
        {renderNavLinks()}
      </div>

      <div className="flex items-center gap-2">
        <NotificationCenter />

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
            >
              <UserAvatar />
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <UserAvatar />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Mon compte</span>
                  {user && <span className="text-xs text-muted-foreground">{user.email}</span>}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/chat" className="w-full cursor-pointer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Chat</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/documents" className="w-full cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Documents</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/monitoring" className="w-full cursor-pointer">
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Monitoring</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/config" className="w-full cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuration</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {showMenu && (
        <div className="fixed inset-0 top-14 z-50 bg-background border-t md:hidden">
          <div className="flex flex-col p-4 space-y-3">
            <Button
              asChild
              variant={isActive('/chat') ? 'default' : 'ghost'}
              onClick={closeMobileMenu}
            >
              <Link to="/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/documents') ? 'default' : 'ghost'}
              onClick={closeMobileMenu}
            >
              <Link to="/documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/monitoring') ? 'default' : 'ghost'}
              onClick={closeMobileMenu}
            >
              <Link to="/monitoring">
                <BarChart className="h-4 w-4 mr-2" />
                Monitoring
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive('/config') ? 'default' : 'ghost'}
              onClick={closeMobileMenu}
            >
              <Link to="/config">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
