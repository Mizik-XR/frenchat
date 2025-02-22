
import { ConfigHeader } from "@/components/config/ConfigHeader";
import { ConfigWizard } from "@/components/config/ConfigWizard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export function Config() {
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log("Config component mounting...", user);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <ConfigHeader onBack={handleBack} />
        <ConfigWizard />
      </div>
    </div>
  );
}
