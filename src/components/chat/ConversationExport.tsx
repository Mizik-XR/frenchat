
import React from "react";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { Download, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConversationExportProps {
  messages: Message[];
  title: string;
}

interface SharedConversation {
  title: string;
  messages: Message[];
  expires_at: string;
}

export const ConversationExport = ({ messages, title }: ConversationExportProps) => {
  const exportAsMarkdown = () => {
    const content = messages
      .map((msg) => {
        const role = msg.role === "user" ? "Vous" : "Assistant";
        return `### ${role}\n\n${msg.content}\n`;
      })
      .join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${title || "conversation"}.md`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation exportée",
      description: "Le fichier Markdown a été téléchargé.",
    });
  };

  const exportAsJSON = () => {
    const content = JSON.stringify(messages, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${title || "conversation"}.json`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Conversation exportée",
      description: "Le fichier JSON a été téléchargé.",
    });
  };

  const copyShareLink = async () => {
    try {
      const shareId = await generateShareLink(messages);
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Lien copié !",
        description: "Le lien de partage a été copié dans le presse-papier.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le lien de partage.",
        variant: "destructive",
      });
    }
  };

  const generateShareLink = async (messages: Message[]): Promise<string> => {
    // Utiliser une assertion de type pour la table
    const { data, error } = await (supabase
      .from('shared_conversations')
      .insert({
        title,
        messages,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      } as any)
      .select()
      .single()) as any;

    if (error) throw error;
    return data.id;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportAsMarkdown}>
          Exporter en Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          Exporter en JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyShareLink}>
          <Share2 className="h-4 w-4 mr-2" />
          Copier le lien de partage
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
