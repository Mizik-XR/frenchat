
import { isLocalDevelopment } from "@/services/apiConfig";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  className?: string;
  children: React.ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}

export function SidebarSection({ title, children, expanded, onToggle }: SidebarSectionProps) {
  return (
    <div className="px-3 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

export function SidebarItem({ href, icon, children, active }: SidebarItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "ghost" }),
        "w-full justify-start",
        active && "bg-muted text-primary"
      )}
    >
      {icon && <div className="mr-2">{icon}</div>}
      {children}
    </Link>
  );
}

export function SupabaseConsoleLink() {
  // Ne montrer le lien vers la console Supabase qu'en mode développement local
  if (!isLocalDevelopment()) {
    return null;
  }

  return (
    <div className="px-4 py-2">
      <p className="text-sm text-muted-foreground mb-2">
        Accédez à la console Supabase pour gérer directement votre base de données.
      </p>
      <a 
        href="https://supabase.com/dashboard/project/dbdueopvtlanxgumenpu"
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-center"
        )}
      >
        Ouvrir la console Supabase
      </a>
      <div className="text-xs text-muted-foreground mt-1 text-center">
        (Mode développement uniquement)
      </div>
    </div>
  );
}
