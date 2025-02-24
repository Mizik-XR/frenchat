
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
    <div className="p-4 border-b border-gray-200 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un sujet..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'completed', 'archived'] as const).map((status) => (
          <Button
            key={status}
            variant={activeFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>
    </div>
  );
}
