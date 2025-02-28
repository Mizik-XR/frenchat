
import React from "react";
import { NavigationControls } from "./NavigationControls";
import { ThemeToggle } from "@/components/ThemeToggle";

interface PageHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <NavigationControls />
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>
      
      <div className="flex items-center space-x-4">
        {children}
        <ThemeToggle />
      </div>
    </div>
  );
}
