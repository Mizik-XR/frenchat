
import { React } from "@/core/ReactInstance";
import { PrimitiveCard } from '../primitives';

/**
 * Panel composite qui utilise PrimitiveCard comme base
 * et ajoute des fonctionnalités supplémentaires
 */
const CompositePanel = ({
  children,
  title,
  className = "",
  headerClassName = ""
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerClassName?: string;
}) => {
  return (
    <PrimitiveCard className={className}>
      {title && (
        <div className={`p-4 border-b ${headerClassName}`}>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </PrimitiveCard>
  );
};

export default CompositePanel;
