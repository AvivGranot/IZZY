import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/hooks/useChat";
import VoiceInputButton from "./VoiceInputButton";

interface ChatPanelProps {
  messages: Message[];
  messagesLeft: number;
  onSendMessage: (message: string) => void;
  isAiTyping: boolean;
  isListening?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
}

export default function ChatPanel({ 
  messages, 
  messagesLeft, 
  onSendMessage, 
  isAiTyping,
  isListening = false,
  onStartListening = () => {},
  onStopListening = () => {}
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxChars = 400;
  
  // When receiving speech input
  useEffect(() => {
    if (isListening) {
      // If we're listening, we may want to show a visual indicator
    }
  }, [isListening]);
  
  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
      if (isListening) {
        onStopListening();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Chat Messages Area */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={message.sender === "user" ? "flex justify-end" : "flex items-start space-x-2"}
          >
            {message.sender === "ai" && (
              <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white">
                <div className="text-xs">AI</div>
              </div>
            )}
            <div 
              className={
                message.sender === "user" 
                  ? "message-bubble-user gradient-cta p-3 text-sm text-white max-w-[80%]" 
                  : "message-bubble-ai bg-gray-100 dark:bg-gray-700 p-3 text-sm max-w-[80%]"
              }
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {/* AI typing indicator */}
        {isAiTyping && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white">
              <div className="text-xs">AI</div>
            </div>
            <div className="message-bubble-ai bg-gray-100 dark:bg-gray-700 p-3 text-sm max-w-[80%]">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Counter */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          You have <span className="font-bold">{messagesLeft}</span> free message{messagesLeft !== 1 ? 's' : ''} left.
        </p>
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.slice(0, maxChars))}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-3 pr-10 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ask your AI Coach anything..."
              maxLength={maxChars}
              rows={2}
            />
            <div className="absolute bottom-2 right-2">
              <VoiceInputButton
                isListening={isListening}
                onStartListening={onStartListening}
                onStopListening={onStopListening}
              />
            </div>
          </div>
          <Button 
            className="gradient-cta rounded-full p-3 text-white" 
            onClick={handleSend}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
