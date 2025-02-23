
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleDriveButton } from "./GoogleDriveButton";

export const GoogleDriveConfig = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Configuration Google Drive</CardTitle>
      </CardHeader>
      <CardContent>
        <GoogleDriveButton />
      </CardContent>
    </Card>
  );
};

