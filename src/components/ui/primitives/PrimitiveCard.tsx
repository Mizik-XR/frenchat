
import { React } from "@/core/ReactInstance";

/**
 * Composant carte primitif
 * Base pour les autres cartes de l'application
 */
const PrimitiveCard = ({ 
  children, 
  className = "" 
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default PrimitiveCard;
