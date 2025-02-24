
import { ConfigurationStep } from "@/components/config/steps/ConfigurationStep";

export default function Config() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold">Configuration de FileChat</h1>
          <p className="text-gray-600 mt-2">
            Configurez les différents aspects de l'application selon vos besoins
          </p>
        </div>
        
        <ConfigurationStep />
      </div>
    </div>
  );
}
