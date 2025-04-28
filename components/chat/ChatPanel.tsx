import React, { useState } from 'react';
import { useChat } from '../../hooks/useChat';
import InteractiveAvatar from './InteractiveAvatar';
import VoiceInput from './VoiceInput';

export const ChatPanel = () => {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <VoiceInput onTranscript={(text) => setInput(text)} />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};