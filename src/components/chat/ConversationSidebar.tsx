import {
  React,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "@/core/ReactInstance";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Edit,
  Eye,
  EyeOff,
  LayoutDashboard,
  Pin,
  PinOff,
  Plus,
  Trash,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppState } from "@/contexts/AppStateContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useUpdateConversation,
} from "@/hooks/useConversations";
import {
  webUIConfigToJson,
  normalizeDate,
  jsonToWebUIConfig,
} from "@/integrations/supabase/typesCompatibility";

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  is_pinned?: boolean;
  is_archived?: boolean;
  folder_id?: string;
  settings?: any;
  user_id?: string;
}

interface Props {
  className?: string;
  conversations: Conversation[];
  isLoading: boolean;
  isError: boolean;
}

export function ConversationSidebar({
  className,
  conversations,
  isLoading,
  isError,
}: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, dispatch } = useAppState();
  const { webUIConfig } = useSettings();
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: createConversation,
    isLoading: isCreatingConversation,
    isError: isCreatingError,
  } = useCreateConversation();
  const { mutate: updateConversation } = useUpdateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();

  const onCreate = useCallback(() => {
    setIsCreating(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, []);

  const onCancel = useCallback(() => {
    setIsCreating(false);
    setNewTitle("");
  }, []);

  const onSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!newTitle) return;
      setIsCreating(false);
      createConversation(
        {
          title: newTitle,
          settings: webUIConfigToJson(webUIConfig),
        },
        {
          onSuccess: (data) => {
            setNewTitle("");
            dispatch({
              type: "setConversationId",
              payload: data.id,
            });
            navigate(`/chat/${data.id}`);
          },
          onError: (error) => {
            toast({
              title: "Error creating conversation",
              description: error.message,
              variant: "destructive",
            });
          },
        }
      );
    },
    [createConversation, dispatch, navigate, newTitle, toast, webUIConfig]
  );

  useEffect(() => {
    if (isCreatingError) {
      toast({
        title: "Error creating conversation",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }, [isCreatingError, toast]);

  const filteredConversations = conversations
    ? conversations.filter((conversation) =>
        conversation.title.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="px-3 py-2">
        <div className="flex items-center">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <p className="text-sm font-medium">Dashboard</p>
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-hidden">
        <div className="px-3 py-2">
          <div className="relative">
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="pb-2">
            {isCreating ? (
              <div className="px-3 py-2">
                <form onSubmit={onSubmit} className="grid gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Enter title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full"
                      isLoading={isCreatingConversation}
                    >
                      Create
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={onCancel}
                      disabled={isCreatingConversation}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 hover:bg-secondary"
                onClick={onCreate}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            )}
            {isLoading && (
              <div className="flex flex-col space-y-1 px-3 py-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            )}
            {isError && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Failed to load conversations. Please refresh.
              </div>
            )}
            {conversations?.length === 0 && !isLoading && !isCreating && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No conversations found.
              </div>
            )}
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                id={conversation.id}
                title={conversation.title}
                createdAt={normalizeDate(conversation.created_at)}
                updatedAt={normalizeDate(conversation.updated_at)}
                is_pinned={conversation.is_pinned}
                is_archived={conversation.is_archived}
                settings={
                  conversation.settings
                    ? jsonToWebUIConfig(conversation.settings)
                    : undefined
                }
                user_id={conversation.user_id}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          <p className="text-sm font-medium">Team</p>
        </div>
      </div>
    </div>
  );
}

interface ConversationItemProps {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  is_pinned?: boolean;
  is_archived?: boolean;
  folder_id?: string;
  settings?: any;
  user_id?: string;
}

function ConversationItem({
  id,
  title,
  createdAt,
  updatedAt,
  is_pinned,
  is_archived,
  folder_id,
  settings,
  user_id,
}: ConversationItemProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dispatch } = useAppState();
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: updateConversation } = useUpdateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();

  const onSelect = useCallback(() => {
    dispatch({
      type: "setConversationId",
      payload: id,
    });
    navigate(`/chat/${id}`);
  }, [dispatch, id, navigate]);

  const onPin = useCallback(() => {
    updateConversation({
      id: id,
      is_pinned: !is_pinned,
    });
  }, [id, is_pinned, updateConversation]);

  const onArchive = useCallback(() => {
    updateConversation({
      id: id,
      is_archived: !is_archived,
    });
  }, [id, is_archived, updateConversation]);

  const onDelete = useCallback(() => {
    setIsDeleting(true);
    deleteConversation(id, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Conversation deleted.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
      onSettled: () => {
        setIsDeleting(false);
      },
    });
  }, [deleteConversation, id, toast]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-12 w-full items-center justify-between px-3 py-2 hover:bg-secondary"
          onClick={onSelect}
        >
          <div className="flex items-center">
            <Avatar className="mr-2 h-6 w-6">
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">{title}</p>
          </div>
          {is_pinned && <Pin className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuItem onClick={onPin}>
          <Pin className="mr-2 h-4 w-4" />
          <span>{is_pinned ? "Unpin" : "Pin"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive}>
          <Eye className="mr-2 h-4 w-4" />
          <span>{is_archived ? "Unarchive" : "Archive"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} disabled={isDeleting}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
