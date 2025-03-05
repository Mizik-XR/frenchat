
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ReactNode } from "react";

interface ConfigurationCardProps {
  children: ReactNode;
  modelName: string;
}

export function ConfigurationCard({ children, modelName }: ConfigurationCardProps) {
  return (
    <Card className="p-4 bg-gray-50 border-gray-200 space-y-6 animate-in fade-in-50 duration-200">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          Configuration requise pour {modelName}
        </AlertDescription>
      </Alert>

      <Separator className="my-4" />

      {children}
    </Card>
  );
}
