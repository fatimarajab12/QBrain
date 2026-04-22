import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Trash2, Copy, Check, Download, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useChatMessages } from "@/components/ProjectChatBot/hooks/useChatMessages";
import { MessageList } from "@/components/ProjectChatBot/components/MessageList";
import { ChatInput } from "@/components/ProjectChatBot/components/ChatInput";
import { projectService } from "@/services/project.service";
import { CHAT_CONFIG } from "@/components/ProjectChatBot/constants";

const ChatPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectId ? projectService.fetchProjectById(projectId) : null,
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSend,
    clearChat,
  } = useChatMessages(projectId || '', project?.name);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, CHAT_CONFIG.INPUT_FOCUS_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleCopyChat = async () => {
    const chatText = messages
      .map(msg => `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text}`)
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(chatText);
      toast({
        title: "Copied!",
        description: "Chat history copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy chat",
        variant: "destructive",
      });
    }
  };

  const handleExportChat = () => {
    const chatData = {
      project: project?.name,
      date: new Date().toISOString(),
      messages: messages.map(msg => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${project?.name || 'project'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Chat history exported successfully",
    });
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Project not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-cyan-50/20 dark:to-cyan-950/10">
      {/* Enhanced Header */}
      <div className="border-b bg-card/95 backdrop-blur-sm shadow-sm px-4 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="flex-shrink-0 hover:bg-accent"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              AI Chat Assistant
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {project?.name || "Project Chat"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-9"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                className="h-9 w-9"
                title="Search messages"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyChat}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportChat}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={clearChat}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Chat Container with better spacing */}
      <div className="flex-1 flex flex-col min-h-0 p-4 md:p-6 lg:p-8">
        <div className="flex-1 flex flex-col min-h-0 max-w-6xl w-full mx-auto">
          <Card className="flex-1 flex flex-col shadow-xl border-2 border-cyan-500/20 bg-card/95 backdrop-blur-sm overflow-hidden">
            {/* Messages Area - Enhanced */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              {searchQuery && (
                <div className="px-4 py-2 bg-cyan-50 dark:bg-cyan-950/20 border-b text-sm text-muted-foreground">
                  Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} matching "{searchQuery}"
                </div>
              )}
              
              <MessageList
                messages={filteredMessages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* Input Area - Enhanced */}
            <div className="border-t bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/10 dark:to-blue-950/10">
              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSend={handleSend}
                inputRef={inputRef}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
