import React, { useState, useEffect, useRef } from 'react';

interface VoiceInputButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  className?: string;
}

export default function VoiceInputButton({
  isListening,
  onStartListening,
  onStopListening,
  className
}: VoiceInputButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_RECORDING_TIME = 180; // 3 minutes in seconds
  
  useEffect(() => {
    // Check if speech recognition is supported
    const supported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    setIsSupported(supported);
  }, []);
  
  useEffect(() => {
    if (isListening) {
      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop after MAX_RECORDING_TIME seconds
          if (newTime >= MAX_RECORDING_TIME) {
            onStopListening();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      // Clear timer and reset
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening, onStopListening]);
  
  if (!isSupported) {
    return null; // Don't render the button if speech recognition is not supported
  }
  
  const handleClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex flex-col items-center">
      <button
      type="button"
      onClick={handleClick}
        className={`rounded-full p-2 ${
          isListening ? "bg-red-500 animate-pulse text-white" : "bg-gray-200 text-gray-700"
        } ${className || ''}`}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
        title={isListening ? "Stop listening" : "Voice input (max 3 minutes)"}
    >
      {isListening ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
      ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
      )}
      </button>
      {isListening && (
        <div className="text-xs text-red-500 mt-1">
          {formatTime(recordingTime)}/{formatTime(MAX_RECORDING_TIME)}
        </div>
      )}
    </div>
  );
}
