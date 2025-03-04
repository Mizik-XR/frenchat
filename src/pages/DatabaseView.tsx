
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DatabaseEntry {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
}

export default function DatabaseView() {
  const [entries, setEntries] = useState<DatabaseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulation du chargement des données
    const loadData = async () => {
      setLoading(true);
      try {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Générer des données factices
        const mockData: DatabaseEntry[] = Array.from({ length: 10 }).map((_, i) => ({
          id: `entry-${i + 1}`,
          name: `Document ${i + 1}`,
          type: ['PDF', 'DOCX', 'TXT', 'CSV'][Math.floor(Math.random() * 4)],
          size: Math.floor(Math.random() * 1000) * 1024,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        }));
        
        setEntries(mockData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la base de données.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefresh = () => {
    // Recharger les données
    toast({
      title: "Actualisation",
      description: "Actualisation des données en cours...",
    });
    
    // Réexécuter l'effet de chargement
    setLoading(true);
    setTimeout(() => {
      const newData = [...entries];
      // Ajouter une entrée ou modifier une existante pour simuler un changement
      newData.unshift({
        id: `entry-${Date.now()}`,
        name: `Nouveau document ${Math.floor(Math.random() * 100)}`,
        type: ['PDF', 'DOCX', 'TXT', 'CSV'][Math.floor(Math.random() * 4)],
        size: Math.floor(Math.random() * 1000) * 1024,
        created_at: new Date().toISOString(),
      });
      setEntries(newData);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vue de la base de données</h1>
        <Button onClick={handleRefresh} disabled={loading}>
          {loading ? 'Chargement...' : 'Actualiser'}
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Aperçu des données de votre base de connaissances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Documents</h3>
              <p className="text-3xl font-bold">{entries.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Taille totale</h3>
              <p className="text-3xl font-bold">
                {formatFileSize(entries.reduce((acc, entry) => acc + entry.size, 0))}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <h3 className="text-lg font-medium">Types de fichiers</h3>
              <p className="text-3xl font-bold">
                {new Set(entries.map(entry => entry.type)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Documents indexés</CardTitle>
          <CardDescription>Liste des documents dans votre base de connaissances</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Chargement des données...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Date de création</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell>{formatFileSize(entry.size)}</TableCell>
                    <TableCell>{formatDate(entry.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
