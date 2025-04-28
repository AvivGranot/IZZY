import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import VoiceInputButton from '../VoiceInputButton';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

const ChatTab = () => {
  const { messages, sendMessage, isLoading, clearChat } = useChat();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const maxWords = 200;
  const maxChars = 1000;
  
  const { startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => {
      setInput(text);
      setIsListening(false);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    }
  });

  const handleSend = () => {
    if (input.trim() && countWords(input) <= maxWords) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleStartListening = () => {
    startListening();
    setIsListening(true);
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Don't allow more than maxChars characters
    if (value.length <= maxChars) {
      setInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom of messages on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-tab w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">Chat with IZZY</h2>
        <button 
          onClick={clearChat}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear Chat
        </button>
      </div>
      
      <div className="messages-container h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            <p>No messages yet. Start a conversation with IZZY!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${
                message.type === 'user' 
                  ? 'flex justify-end' 
                  : 'flex items-start space-x-2'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white">
                  <span className="text-xs">IZZY</span>
                </div>
              )}
              <div 
                className={
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white rounded-xl p-3 max-w-[80%]' 
                    : 'bg-gray-100 text-gray-800 rounded-xl p-3 max-w-[80%]'
                }
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white">
              <span className="text-xs">IZZY</span>
            </div>
            <div className="bg-gray-100 text-gray-800 rounded-xl p-3">
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
      
      <div className="input-container p-4 border-t">
        <div className="flex items-end space-x-2">
          <div className="relative flex-grow">
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message (max 200 words)..."
              className="w-full border rounded-lg p-3 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
            <div className="absolute bottom-2 right-2">
              <VoiceInputButton
                isListening={isListening}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {countWords(input)} / {maxWords} words
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || countWords(input) > maxWords || isLoading}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab; 