
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TopicFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: 'all' | 'active' | 'archived' | 'unassigned';
  onFilterChange: (filter: 'all' | 'active' | 'archived' | 'unassigned') => void;
}

export function TopicFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange
}: TopicFiltersProps) {
  return (
    <div className="p-4 border-b border-gray-100 space-y-4 bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="relative transition-all">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher..."
          className="pl-9 border-gray-200 focus:border-blue-200 focus:ring-blue-100 transition-all"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'active', label: 'Actifs' },
          { id: 'archived', label: 'Archivés' },
          { id: 'unassigned', label: 'Sans dossier' }
        ].map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id as TopicFiltersProps['activeFilter'])}
            className={`transition-all whitespace-nowrap ${
              activeFilter === filter.id 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200'
            }`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
