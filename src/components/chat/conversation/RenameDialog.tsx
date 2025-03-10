
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameDialogProps {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  onTitleChange: (value: string) => void;
  onSave: () => void;
}

export function RenameDialog({
  open,
  title,
  onOpenChange,
  onTitleChange,
  onSave
}: RenameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Conversation</DialogTitle>
          <DialogDescription>
            Enter a new title for this conversation
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Conversation title"
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
