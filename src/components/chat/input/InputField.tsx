
import { ArrowUp } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

interface InputFieldProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e?: React.FormEvent) => void;  // Make the event parameter optional
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
        className="flex-1 min-h-[80px] pr-12"
      />
      <button 
        type="button"
        onClick={() => onSubmit()}  // Call without passing an event
        disabled={isLoading || (!input.trim() && !hasFiles)}
        className="absolute right-2 bottom-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-400"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
