import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/chat/send", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  return (
    <>
      {/* Floating AI Avatar Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            size="icon"
            className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-primary to-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 animate-[float_3s_ease-in-out_infinite] border-0"
            onClick={() => setIsOpen(true)}
            data-testid="button-open-chatbot"
          >
            <MessageSquare className="h-7 w-7" />
          </Button>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] flex flex-col shadow-2xl border-0 bg-card">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-primary/90 shadow-sm">
                <AvatarFallback className="text-primary-foreground font-bold text-base">
                  AI
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-bold" data-testid="text-chatbot-title">
                  AI Assistant
                </h3>
                <p className="text-sm text-muted-foreground font-medium">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-chatbot"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground" data-testid="text-chatbot-empty">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base font-medium">Start a conversation with your AI assistant</p>
                  <p className="text-sm mt-2">Ask me to schedule interviews, analyze candidates, or anything else!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                  data-testid={`message-${msg.role}`}
                >
                  <Avatar className={`h-10 w-10 ${
                    msg.role === "assistant" ? "bg-gradient-to-br from-primary to-primary/90 shadow-sm" : "bg-secondary"
                  }`}>
                    <AvatarFallback className={msg.role === "assistant" ? "text-primary-foreground font-semibold" : "font-semibold"}>
                      {msg.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground border border-border/50"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-accent">
                    <AvatarFallback className="text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                  <div className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-6 border-t border-border/50 bg-muted/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <Input
                placeholder="Ask me anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
                className="flex-1 h-11 border-border/50 focus:border-primary/50 transition-colors"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                data-testid="button-voice-input"
                className="h-11 w-11 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
                className="h-11 w-11 shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </>
  );
}
