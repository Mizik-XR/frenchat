
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileManager } from "@/hooks/useFileManager";
import { Loader2 } from "lucide-react";

export function DocumentStatsCard() {
  const { isLoading, stats, limits } = useFileManager();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques des Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Nombre de fichiers</p>
            <p className="text-2xl font-bold">
              {stats?.totalFiles || 0} / {limits?.maxFiles || 1000}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Espace utilisé</p>
            <p className="text-2xl font-bold">
              {formatSize(stats?.totalSize || 0)} / {formatSize(limits?.maxTotalSize || 0)}
            </p>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p>• Taille maximale par fichier : {formatSize(limits?.maxFileSize || 0)}</p>
            <p>• Les fichiers sont automatiquement indexés après l'upload</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
