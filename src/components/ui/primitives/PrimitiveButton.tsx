
import { React } from "@/core/ReactInstance";

/**
 * Composant bouton primitif
 * Base pour les autres boutons de l'application
 */
const PrimitiveButton = ({ 
  children, 
  onClick,
  className = "",
  disabled = false,
  type = "button"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default PrimitiveButton;
