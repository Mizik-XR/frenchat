
import { useState } from 'react';
import { Folder } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface FolderTreeProps {
  onFolderSelect: (folderId: string) => void;
}

interface FolderItem {
  id: string;
  name: string;
  children?: FolderItem[];
}

// Exemple de structure de dossiers
const mockFolders: FolderItem[] = [
  {
    id: 'folder1',
    name: 'Mes Documents',
    children: [
      { id: 'folder1-1', name: 'Projets' },
      { id: 'folder1-2', name: 'Archives' }
    ]
  },
  {
    id: 'folder2',
    name: 'Partagés avec moi',
    children: [
      { id: 'folder2-1', name: 'Équipe Marketing' }
    ]
  }
];

export const FolderTree = ({ onFolderSelect }: FolderTreeProps) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
    onFolderSelect(folderId);
  };

  const renderFolder = (folder: FolderItem, level = 0) => {
    const isSelected = folder.id === selectedFolderId;
    const paddingLeft = level * 20;

    return (
      <div key={folder.id}>
        <div 
          className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => handleFolderClick(folder.id)}
        >
          <Folder className="mr-2 h-4 w-4" />
          <span>{folder.name}</span>
        </div>
        {folder.children?.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        {mockFolders.map(folder => renderFolder(folder))}
      </CardContent>
    </Card>
  );
};
