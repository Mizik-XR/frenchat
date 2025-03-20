
import { React } from "@/core/ReactInstance";
import { ConnectionStatusBadge } from "./ConnectionStatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/useAuthSession";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isLovableEnvironment } from "@/utils/environment";

export const NavBar = ({ children }: { children?: React.ReactNode }) => {
  const { user, signOut, isOfflineMode } = useAuthSession();
  const isLovable = isLovableEnvironment();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-white">Frenchat</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/chat"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600"
              >
                Chat
              </Link>
              <Link
                to="/document"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600"
              >
                Documents
              </Link>
              {!isOfflineMode && (
                <Link
                  to="/profile"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600"
                >
                  Profil
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {children}
            
            <ThemeToggle />
            
            {user && !isLovable && (
              <UserAvatar />
            )}
            
            {user && !isOfflineMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                Déconnexion
              </Button>
            )}
            
            <ConnectionStatusBadge />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
