
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Database, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CacheStats {
  enabled: boolean;
  entries: number;
  hits: number;
  misses: number;
  hit_rate: string;
  total_size_kb: string;
  compression_enabled: boolean;
  compressed_entries: number;
  expiry_seconds: number;
  recent_entries: any[];
  error?: string;
}

export function CacheManager({ localAIUrl }: { localAIUrl: string | null }) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [ttl, setTtl] = useState<number>(24);
  const [compression, setCompression] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!localAIUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${localAIUrl}/cache-stats`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
      
      // Mettre à jour les contrôles avec les valeurs actuelles
      if (data.expiry_seconds) {
        setTtl(Math.floor(data.expiry_seconds / 3600)); // Convertir en heures
      }
      
      if (data.compression_enabled !== undefined) {
        setCompression(data.compression_enabled);
      }
      
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques du cache:", err);
      setError("Impossible de récupérer les statistiques du cache");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Actualiser les statistiques toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [localAIUrl]);

  const handleClearCache = async () => {
    if (!localAIUrl) return;
    
    try {
      const response = await fetch(`${localAIUrl}/cache-clear`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      toast({
        title: "Cache vidé",
        description: "Le cache a été vidé avec succès"
      });
      
      // Actualiser les statistiques
      fetchStats();
      
    } catch (err) {
      console.error("Erreur lors de la purge du cache:", err);
      toast({
        title: "Erreur",
        description: "Impossible de vider le cache",
        variant: "destructive"
      });
    }
  };

  const handleUpdateConfig = async () => {
    if (!localAIUrl) return;
    
    try {
      const ttlSeconds = ttl * 3600; // Convertir heures en secondes
      
      const response = await fetch(`${localAIUrl}/cache-config?ttl=${ttlSeconds}&compression=${compression}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      toast({
        title: "Configuration mise à jour",
        description: "La configuration du cache a été mise à jour"
      });
      
      // Actualiser les statistiques
      fetchStats();
      
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la configuration:", err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la configuration",
        variant: "destructive"
      });
    }
  };

  const handleCleanExpired = async () => {
    if (!localAIUrl) return;
    
    try {
      const response = await fetch(`${localAIUrl}/clean-expired-cache`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      toast({
        title: "Nettoyage en cours",
        description: "Le nettoyage des entrées expirées est en cours"
      });
      
      // Actualiser les statistiques après un court délai
      setTimeout(fetchStats, 1000);
      
    } catch (err) {
      console.error("Erreur lors du nettoyage des entrées expirées:", err);
      toast({
        title: "Erreur",
        description: "Impossible de nettoyer les entrées expirées",
        variant: "destructive"
      });
    }
  };

  if (!localAIUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestionnaire de cache</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Non disponible</AlertTitle>
            <AlertDescription>
              Le gestionnaire de cache n'est disponible qu'en mode local.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestionnaire de cache</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={fetchStats} 
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Gestionnaire de cache</CardTitle>
        <Button 
          onClick={fetchStats} 
          variant="ghost" 
          size="icon" 
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats">
          <TabsList className="mb-4">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="text-sm font-medium text-gray-500">Entrées</p>
                    <p className="text-xl font-bold">{stats.entries}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <p className="text-sm font-medium text-gray-500">Taille totale</p>
                    <p className="text-xl font-bold">{stats.total_size_kb} Ko</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taux de succès</span>
                    <span className="text-sm">{stats.hit_rate}</span>
                  </div>
                  <Progress 
                    value={parseFloat(stats.hit_rate)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Hits: {stats.hits}</span>
                    <span>Misses: {stats.misses}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">État de la compression</p>
                  <div className="flex items-center space-x-2">
                    {stats.compression_enabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                    <span>
                      {stats.compression_enabled 
                        ? `Activée (${stats.compressed_entries} entrées compressées)` 
                        : "Désactivée"}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    onClick={handleClearCache} 
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Vider le cache
                  </Button>
                  
                  <Button 
                    onClick={handleCleanExpired} 
                    variant="outline"
                    size="sm"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Nettoyer les entrées expirées
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="config">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ttl">Durée de vie des entrées (heures)</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="ttl" 
                    type="number" 
                    min="1" 
                    max="720"
                    value={ttl} 
                    onChange={(e) => setTtl(parseInt(e.target.value) || 24)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setTtl(24)}
                  >
                    Réinitialiser
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Les entrées plus anciennes que cette durée seront considérées comme expirées.
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="compression" 
                  checked={compression} 
                  onCheckedChange={setCompression}
                />
                <Label htmlFor="compression">Activer la compression</Label>
              </div>
              <p className="text-xs text-gray-500">
                La compression réduit la taille du cache mais peut légèrement augmenter le temps d'accès.
              </p>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les modifications de configuration s'appliqueront aux nouvelles entrées du cache.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleUpdateConfig} 
                className="w-full"
              >
                Appliquer les changements
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
