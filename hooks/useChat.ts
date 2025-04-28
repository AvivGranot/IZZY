import { useState, useCallback, useRef, useEffect } from 'react';
import { usePromptCount } from './usePromptCount';

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  error?: boolean;
  timestamp: number;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage if available
    const savedMessages = localStorage.getItem('izzy_chat_history');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const { decrementPrompts, promptCount } = usePromptCount();

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('izzy_chat_history', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || content.trim().split(/\s+/).length > 200) return;
    
    if (promptCount <= 0) {
      window.dispatchEvent(new CustomEvent('showSubscription'));
      return;
    }

    // Abort previous request if exists
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsLoading(true);
    const messageId = Date.now().toString();
    setMessages(prev => [...prev, { 
      id: messageId, 
      content, 
      type: 'user',
      timestamp: Date.now()
    }]);
    
    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: content }),
        signal: abortController.current.signal
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        id: Date.now().toString(),
        content: data.response, 
        type: 'assistant',
        timestamp: Date.now()
      }]);
      decrementPrompts();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(),
        content: 'Failed to get response. Please try again.', 
        type: 'assistant', 
        error: true,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  }, [promptCount, decrementPrompts]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('izzy_chat_history');
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  return {
    messages,
    sendMessage,
    isLoading,
    cleanup,
    clearChat
  };
};
