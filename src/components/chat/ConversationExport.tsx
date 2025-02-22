
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

interface ConversationExportProps {
  messages: Message[];
  title: string;
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
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "conversation"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "conversation"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

  const generateShareLink = async (messages: Message[]) => {
    const { data, error } = await supabase
      .from('shared_conversations')
      .insert({
        messages,
        title,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      })
      .select()
      .single();

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
