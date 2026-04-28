import { useEffect, useMemo, useRef, useState } from "react";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useDeleteOpenaiConversation,
  useListOpenaiMessages,
} from "@workspace/api-client-react";
import { streamAdvisorMessage } from "@/lib/openaiStream";
import { useAuth } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Plus,
  Trash2,
  BrainCircuit,
  User as UserIcon,
} from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Conversation = {
  id: number;
  title?: string | null;
};

type ApiMessage = {
  id: string | number;
  role: string;
  content: string;
};

type LocalMessage = {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
};

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value;

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  if (
    value &&
    typeof value === "object" &&
    "items" in value &&
    Array.isArray((value as { items?: unknown }).items)
  ) {
    return (value as { items: T[] }).items;
  }

  if (
    value &&
    typeof value === "object" &&
    "results" in value &&
    Array.isArray((value as { results?: unknown }).results)
  ) {
    return (value as { results: T[] }).results;
  }

  return [];
}

function normalizeRole(role: string): LocalMessage["role"] {
  if (role === "user" || role === "assistant" || role === "system") {
    return role;
  }

  return "assistant";
}

export default function AdvisorPage() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  const {
    data: conversationsResponse,
    isLoading: loadingConvos,
  } = useListOpenaiConversations();

  const createConvo = useCreateOpenaiConversation();
  const deleteConvo = useDeleteOpenaiConversation();

  const conversations = useMemo(
    () => normalizeArray<Conversation>(conversationsResponse),
    [conversationsResponse]
  );

  const [activeId, setActiveId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAutoCreatedRef = useRef(false);

  const {
    data: serverMessagesResponse,
    isLoading: loadingMsgs,
  } = useListOpenaiMessages(activeId ?? 0, {
    query: {
      enabled: Boolean(activeId),
      queryKey: ["/api/openai/conversations", activeId, "messages"],
    },
  });

  const serverMessages = useMemo(
    () => normalizeArray<ApiMessage>(serverMessagesResponse),
    [serverMessagesResponse]
  );

  useEffect(() => {
    if (loadingConvos) return;

    if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
      return;
    }

    if (
      conversations.length === 0 &&
      !activeId &&
      !createConvo.isPending &&
      !hasAutoCreatedRef.current
    ) {
      hasAutoCreatedRef.current = true;

      createConvo.mutate(
        { data: { title: "New Chat" } },
        {
          onSuccess: (res: Conversation) => {
            setActiveId(res.id);
            queryClient.invalidateQueries({
              queryKey: ["/api/openai/conversations"],
            });
          },
          onError: () => {
            hasAutoCreatedRef.current = false;
            toast({
              title: "Failed to create conversation",
              variant: "destructive",
            });
          },
        }
      );
    }
  }, [
    loadingConvos,
    conversations,
    activeId,
    createConvo,
    toast,
  ]);

  useEffect(() => {
    if (isStreaming) return;

    setLocalMessages(
      serverMessages.map((message) => ({
        id: message.id,
        role: normalizeRole(message.role),
        content: message.content ?? "",
      }))
    );
  }, [serverMessages, isStreaming, activeId]);

  useEffect(() => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [localMessages]);

  const handleCreate = async () => {
    try {
      const res = await createConvo.mutateAsync({
        data: { title: "New Chat" },
      });

      setActiveId(res.id);
      setLocalMessages([]);

      await queryClient.invalidateQueries({
        queryKey: ["/api/openai/conversations"],
      });
    } catch {
      toast({
        title: "Failed to create conversation",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    e.stopPropagation();

    try {
      await deleteConvo.mutateAsync({ id });

      const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== id
      );

      if (activeId === id) {
        const nextConversation = remainingConversations[0];

        setActiveId(nextConversation?.id ?? null);
        setLocalMessages([]);
      }

      await queryClient.invalidateQueries({
        queryKey: ["/api/openai/conversations"],
      });
    } catch {
      toast({
        title: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userMessage = input.trim();

    if (!userMessage || isStreaming) return;

    let conversationId = activeId;

    if (!conversationId) {
      try {
        const res = await createConvo.mutateAsync({
          data: { title: "New Chat" },
        });

        conversationId = res.id;
        setActiveId(res.id);

        await queryClient.invalidateQueries({
          queryKey: ["/api/openai/conversations"],
        });
      } catch {
        toast({
          title: "Failed to start conversation",
          variant: "destructive",
        });
        return;
      }
    }

    setInput("");

    const newUserMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
    };

    const tempAssistantMessage: LocalMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
    };

    setLocalMessages((prev) => [
      ...prev,
      newUserMessage,
      tempAssistantMessage,
    ]);

    setIsStreaming(true);

    await streamAdvisorMessage({
      conversationId,
      content: userMessage,
      getToken,

      onDelta: (text) => {
        setLocalMessages((prev) => {
          const lastMessage = prev[prev.length - 1];

          if (!lastMessage || lastMessage.role !== "assistant") {
            return prev;
          }

          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
      },

      onDone: () => {
        setIsStreaming(false);

        queryClient.invalidateQueries({
          queryKey: ["/api/openai/conversations", conversationId, "messages"],
        });

        queryClient.invalidateQueries({
          queryKey: ["/api/openai/conversations"],
        });
      },

      onError: (err) => {
        toast({
          title: "Stream error",
          description: err.message,
          variant: "destructive",
        });

        setIsStreaming(false);

        setLocalMessages((prev) =>
          prev.filter((message) => message.id !== tempAssistantMessage.id)
        );
      },
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 pb-4">
      <Card className="hidden w-64 shrink-0 flex-col overflow-hidden md:flex">
        <div className="border-b p-4">
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={createConvo.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {loadingConvos ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                    activeId === conversation.id
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="truncate pr-2">
                    {conversation.title || "New Chat"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, conversation.id)}
                    className="p-1 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No conversations yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex flex-1 flex-col overflow-hidden border-muted bg-muted/10">
        <div
          ref={scrollRef}
          className="flex-1 space-y-6 overflow-y-auto p-4"
        >
          {loadingMsgs && localMessages.length === 0 ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-2/3" />
              <Skeleton className="ml-auto h-16 w-2/3" />
              <Skeleton className="h-16 w-2/3" />
            </div>
          ) : localMessages.length > 0 ? (
            localMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "prose prose-sm max-w-none rounded-bl-none border bg-card text-card-foreground shadow-sm dark:prose-invert"
                  }`}
                >
                  {message.role === "assistant" ? (
                    message.content ? (
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : (
                      <div className="flex h-5 items-center gap-1">
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    )
                  ) : (
                    <div className="whitespace-pre-wrap">
                      {message.content}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-70">
              <BrainCircuit className="mb-4 h-12 w-12" />
              <p className="text-base font-medium">Orion Advisor</p>
              <p className="mt-1 text-sm">
                How can I help you analyze the markets today?
              </p>
            </div>
          )}
        </div>

        <div className="border-t bg-background p-4">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a symbol, portfolio strategy, or market news..."
              className="rounded-full border-muted bg-muted/50 py-6 pr-12 text-base focus-visible:ring-primary"
              disabled={isStreaming}
            />

            <Button
              type="submit"
              size="icon"
              className="absolute right-1.5 h-9 w-9 rounded-full"
              disabled={!input.trim() || isStreaming}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-2 text-center text-xs text-muted-foreground">
            Orion Advisor can make mistakes. Consider verifying important
            information.
          </div>
        </div>
      </Card>
    </div>
  );
}