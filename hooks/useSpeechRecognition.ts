import { useState, useEffect, useCallback, useRef } from "react";

interface SpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  onError?: (error: Error) => void;
  language?: string;
  continuous?: boolean;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: { new(): SpeechRecognition };
    SpeechRecognition: { new(): SpeechRecognition };
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export const useSpeechRecognition = ({
  onResult,
  onError,
  language = 'en-US',
  continuous = false
}: SpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      if (recognitionRef.current) {
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const text = event.results[0][0].transcript;
          onResult?.(text);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          onError?.(new Error(event.error));
          stopListening();
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error occurred'));
      setIsListening(false);
    }
  }, [isSupported, language, continuous, onResult, onError, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
};
