
import { ConfigHeader } from "@/components/config/ConfigHeader";
import { ConfigWizard } from "@/components/config/ConfigWizard";
import { useAuth } from "@/components/AuthProvider";

export function Config() {
  const { user } = useAuth();

  console.log("Config component mounting...", user);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto py-8">
        <ConfigHeader />
        <ConfigWizard />
      </div>
    </div>
  );
}
