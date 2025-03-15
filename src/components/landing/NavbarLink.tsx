
import { Button } from "@/components/ui/button";

interface NavbarLinkProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function NavbarLink({ onClick, children, className = "text-gray-300 hover:text-white" }: NavbarLinkProps) {
  return (
    <Button onClick={onClick} variant="ghost" className={className}>
      {children}
    </Button>
  );
}
