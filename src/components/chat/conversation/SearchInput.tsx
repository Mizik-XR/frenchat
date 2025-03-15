
import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchInput = ({ searchQuery, setSearchQuery }: SearchInputProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const resetSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`} />
      <Input
        ref={searchInputRef}
        className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
        placeholder="Rechercher une conversation..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
      />
      {searchQuery && (
        <button 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={resetSearch}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
