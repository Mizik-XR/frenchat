
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

interface ConfigurationCardProps {
  children: ReactNode;
  modelName: string;
  isOpenSource?: boolean;
  pricingInfo?: string;
}

export function ConfigurationCard({ 
  children, 
  modelName, 
  isOpenSource = false,
  pricingInfo 
}: ConfigurationCardProps) {
  return (
    <Card className="p-5 bg-gray-50 border-gray-200 space-y-6 animate-in fade-in-50 duration-200 shadow-sm">
      <Alert className="bg-blue-50 border-blue-200 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
        <AlertDescription className="text-blue-700">
          Configuration requise pour <span className="font-medium">{modelName}</span>
        </AlertDescription>
      </Alert>

      {isOpenSource && (
        <Alert className="bg-green-50 border-green-200 flex items-start gap-2">
          <Info className="h-4 w-4 text-green-600 mt-0.5" />
          <AlertDescription className="text-green-700">
            <span className="font-medium">Modèle open source</span> {pricingInfo ? `- ${pricingInfo}` : ''}
          </AlertDescription>
        </Alert>
      )}

      {!isOpenSource && pricingInfo && (
        <Alert className="bg-amber-50 border-amber-200 flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-600 mt-0.5" />
          <AlertDescription className="text-amber-700">
            {pricingInfo}
          </AlertDescription>
        </Alert>
      )}

      <Separator className="my-4" />

      {children}
    </Card>
  );
}
