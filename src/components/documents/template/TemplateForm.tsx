
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { Template } from './types';

interface TemplateFormProps {
  template: Template;
  onTemplateChange: (template: Template) => void;
  onSave: () => void;
}

export function TemplateForm({ template, onTemplateChange, onSave }: TemplateFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nom du template</Label>
        <Input
          id="name"
          value={template.name}
          onChange={(e) => onTemplateChange({
            ...template,
            name: e.target.value
          })}
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={template.description || ''}
          onChange={(e) => onTemplateChange({
            ...template,
            description: e.target.value
          })}
        />
      </div>

      <div>
        <Label htmlFor="structure">Structure (JSON)</Label>
        <Textarea
          id="structure"
          value={JSON.stringify(template.content_structure, null, 2)}
          onChange={(e) => {
            try {
              const structure = JSON.parse(e.target.value);
              onTemplateChange({
                ...template,
                content_structure: structure
              });
            } catch (error) {
              // Ignorer les erreurs de parsing pendant l'édition
            }
          }}
          className="font-mono"
          rows={10}
        />
      </div>

      <Button onClick={onSave}>
        <Save className="h-4 w-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );
}
