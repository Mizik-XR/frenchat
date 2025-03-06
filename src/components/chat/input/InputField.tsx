
import { ArrowUp } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

interface InputFieldProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  hasFiles: boolean;
}

export function InputField({ input, setInput, onSubmit, isLoading, hasFiles }: InputFieldProps) {
  return (
    <div className="flex relative">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Entrez votre message..."
        className="flex-1 min-h-[80px] pr-12 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent rounded-xl"
      />
      <button 
        type="button"
        onClick={() => onSubmit()}
        disabled={isLoading || (!input.trim() && !hasFiles)}
        className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors duration-200 shadow-md"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
