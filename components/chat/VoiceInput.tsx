import React, { useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const { startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => {
      onTranscript(text);
      setIsListening(false);
    }
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  return (
    <button 
      className={`voice-input-btn ${isListening ? 'active' : ''}`}
      onClick={toggleListening}
    >
      {isListening ? 'Stop' : 'Voice'}
    </button>
  );
};

export default VoiceInput;