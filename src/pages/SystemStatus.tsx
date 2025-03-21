import React, { useEffect, useState } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, APP_STATE } from '@/integrations/supabase/client';
import { DiagnosticReport } from '@/components/debug/DiagnosticReport';
import { useSystemCapabilities } from '@/hooks/useSystemCapabilities';
import { SystemInfoSection } from '@/components/debug/SystemInfoSection';
import { CompatibilitySection } from '@/components/debug/CompatibilitySection';

export default function SystemStatus() {
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);
  const { isWebBLEAvailable, isFileSystemAPIAvailable, isWebGPUAvailable } = useSystemCapabilities();

  useEffect(() => {
    const checkSupabase = async () => {
      const isConnected = await supabase.auth.getSession()
        .then(() => true)
        .catch(() => false);
      setSupabaseStatus(isConnected);
    };

    checkSupabase();
  }, []);

  const handleForceOffline = () => {
    APP_STATE.setOfflineMode(true);
  };

  const handleForceOnline = () => {
    APP_STATE.setOfflineMode(false);
  };

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">État du Système</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Connectivité Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          {supabaseStatus === null ? (
            <p>Vérification en cours...</p>
          ) : supabaseStatus ? (
            <p className="text-green-500">Connecté à Supabase</p>
          ) : (
            <p className="text-red-500">Non connecté à Supabase</p>
          )}
          <div className="mt-2">
            <Button onClick={handleForceOffline} variant="destructive">
              Forcer le mode hors ligne
            </Button>
            <Button onClick={handleForceOnline} className="ml-2">
              Forcer le mode en ligne
            </Button>
          </div>
        </CardContent>
      </Card>

      <SystemInfoSection />

      <CompatibilitySection
        isWebBLEAvailable={isWebBLEAvailable}
        isFileSystemAPIAvailable={isFileSystemAPIAvailable}
        isWebGPUAvailable={isWebGPUAvailable}
      />

      <Card>
        <CardHeader>
          <CardTitle>Rapport de Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          <DiagnosticReport />
        </CardContent>
      </Card>
    </Container>
  );
}
