
import React from "react";
import { cn } from "@/lib/utils";

interface ThreeStateToggleProps extends React.HTMLAttributes<HTMLDivElement> {
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
}

export function ThreeStateToggle({ 
  className, 
  options, 
  value, 
  onValueChange, 
  ...props 
}: ThreeStateToggleProps) {
  if (options.length !== 3) {
    throw new Error("ThreeStateToggle requires exactly 3 options");
  }

  return (
    <div
      className={cn(
        "relative flex h-8 w-[280px] rounded-full bg-muted p-1 text-sm font-medium",
        className
      )}
      {...props}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          className={cn(
            "relative flex-1 rounded-full text-center text-xs transition-all duration-200 focus:outline-none",
            value === option.value
              ? "bg-white text-primary shadow-sm dark:bg-slate-800"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
          {value === option.value && (
            <span
              className={cn(
                "absolute inset-0 z-[-1] rounded-full",
                index === 0
                  ? "bg-french-blue"
                  : index === 1
                  ? "bg-gray-500"
                  : "bg-french-red"
              )}
            />
          )}
        </button>
      ))}
    </div>
  );
}
