
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TopicFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: 'all' | 'active' | 'completed' | 'archived';
  onFilterChange: (filter: 'all' | 'active' | 'completed' | 'archived') => void;
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
          placeholder="Rechercher un sujet..."
          className="pl-9 border-gray-200 focus:border-blue-200 focus:ring-blue-100 transition-all"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'active', 'completed', 'archived'] as const).map((status) => (
          <Button
            key={status}
            variant={activeFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(status)}
            className={`capitalize transition-all whitespace-nowrap ${
              activeFilter === status 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200'
            }`}
          >
            {status}
          </Button>
        ))}
      </div>
    </div>
  );
}
