
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Folder, Share2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IndexingForm } from './IndexingForm';
import { SharedFoldersList } from './SharedFoldersList';
import { RecentKnowledgeBases } from './RecentKnowledgeBases';

interface KnowledgeBase {
  id: string;
  status: string;
  total_files: number;
  processed_files: number;
  current_folder?: string;
  parent_folder?: string;
}

interface FolderIndexingTabsProps {
  recentKnowledgeBases: KnowledgeBase[];
  sharedFoldersCount: number;
  onStartIndexing: (folderId: string, options: Record<string, any>) => Promise<void>;
  onSelectFolder: (folderId: string) => void;
  isLoading: boolean;
}

export function FolderIndexingTabs({
  recentKnowledgeBases,
  sharedFoldersCount,
  onStartIndexing,
  onSelectFolder,
  isLoading
}: FolderIndexingTabsProps) {
  const [activeTab, setActiveTab] = useState('index');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="index">
          <Folder className="h-4 w-4 mr-2" />
          Indexer un dossier
        </TabsTrigger>
        <TabsTrigger value="shared" className="relative">
          <Share2 className="h-4 w-4 mr-2" />
          Dossiers partagés
          {sharedFoldersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 text-xs h-4 min-w-4 flex items-center justify-center p-0"
            >
              {sharedFoldersCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="recent">
          <Clock className="h-4 w-4 mr-2" />
          Bases récentes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="index" className="space-y-6">
        <IndexingForm 
          onStartIndexing={onStartIndexing}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="shared" className="space-y-4">
        <SharedFoldersList onSelectFolder={onSelectFolder} />
      </TabsContent>
      
      <TabsContent value="recent" className="space-y-4">
        <RecentKnowledgeBases knowledgeBases={recentKnowledgeBases} />
      </TabsContent>
    </Tabs>
  );
}
