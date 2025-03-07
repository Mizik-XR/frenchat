
import React from "react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface ThreeStateToggleProps {
  options: Option[];
  value: string;
  onValueChange: (value: any) => void;
}

export function ThreeStateToggle({
  options,
  value,
  onValueChange,
}: ThreeStateToggleProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
      {options.map((option) => {
        const isActive = value === option.value;
        
        let bgColorClass = "";
        if (isActive) {
          switch (option.value) {
            case "cloud":
              bgColorClass = "bg-french-blue text-white";
              break;
            case "auto":
              bgColorClass = "bg-gray-100 text-gray-800";
              break;
            case "local":
              bgColorClass = "bg-french-red text-white";
              break;
            default:
              bgColorClass = "bg-french-blue text-white";
              break;
          }
        }
        
        return (
          <button
            key={option.value}
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isActive 
                ? bgColorClass
                : "text-gray-500 hover:text-gray-900"
            )}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
