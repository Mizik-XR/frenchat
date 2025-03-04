
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useGoogleDriveFolders } from '@/hooks/useGoogleDriveFolders';
import { useGoogleDriveStatus } from '@/hooks/useGoogleDriveStatus';
import { useIndexingProgress } from '@/hooks/useIndexingProgress';
import { IndexingProgressBar } from '../IndexingProgressBar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { ActionButtons } from './ActionButtons';
import { DriveAuthCheck } from './DriveAuthCheck';
import { FolderIndexingTabs } from './FolderIndexingTabs';

interface KnowledgeBase {
  id: string;
  status: string;
  total_files: number;
  processed_files: number;
  current_folder?: string;
  parent_folder?: string;
}

export function FolderIndexingSelector() {
  const { user } = useAuth();
  const { sharedFolders, refreshFolders } = useGoogleDriveFolders();
  const { isConnected, checkGoogleDriveConnection } = useGoogleDriveStatus();
  const { indexingProgress, startIndexing } = useIndexingProgress();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [recentKnowledgeBases, setRecentKnowledgeBases] = useState<KnowledgeBase[]>([]);
  
  useEffect(() => {
    if (isConnected) {
      loadRecentKnowledgeBases();
    }
  }, [isConnected]);

  const loadRecentKnowledgeBases = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select('id, status, total_files, processed_files, current_folder, parent_folder')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentKnowledgeBases(data || []);
    } catch (error) {
      console.error('Error loading recent knowledge bases:', error);
    }
  };
  
  const handleStartIndexing = async (folderId: string, options: Record<string, any>) => {
    setIsLoading(true);
    try {
      await startIndexing(folderId, options);
      loadRecentKnowledgeBases();
    } catch (error) {
      console.error('Error starting indexation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    checkGoogleDriveConnection();
    refreshFolders();
    loadRecentKnowledgeBases();
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
  };

  if (!isConnected) {
    return <DriveAuthCheck isConnected={isConnected} />;
  }

  return (
    <div className="space-y-6">
      <ActionButtons onRefresh={handleRefresh} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Base de connaissances Google Drive</CardTitle>
          <CardDescription>
            Indexez vos dossiers Google Drive pour créer une base de connaissances accessible depuis le chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FolderIndexingTabs 
            recentKnowledgeBases={recentKnowledgeBases}
            sharedFoldersCount={sharedFolders.length}
            onStartIndexing={handleStartIndexing}
            onSelectFolder={handleSelectFolder}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {indexingProgress && (
        <IndexingProgressBar progress={indexingProgress} />
      )}
    </div>
  );
}
