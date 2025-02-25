
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Template } from './types';

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.description}</p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
