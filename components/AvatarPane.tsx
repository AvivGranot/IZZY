import { useState, useEffect } from "react";
import InteractiveAvatar, { AvatarState } from "./InteractiveAvatar";
import { useChat, Message } from "@/hooks/useChat";

interface AvatarPaneProps {
  imageUrl?: string;
  videoUrl?: string;
  latestMessage?: Message;
  isProcessing?: boolean;
  isListening?: boolean;
}

export default function AvatarPane({ 
  imageUrl, 
  videoUrl, 
  latestMessage, 
  isProcessing = false,
  isListening = false
}: AvatarPaneProps) {
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const { messages } = useChat();
  
  // Default avatar video and image URLs
  const defaultVideoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";
  
  // When the latest message changes or processing state changes
  useEffect(() => {
    if (isListening) {
      setAvatarState("listening");
    } else if (isProcessing) {
      setAvatarState("thinking");
    } else if (latestMessage && latestMessage.sender === "ai") {
      setAvatarState("speaking");
      
      // Reset to idle after a delay (simulating speech duration)
      const speechDuration = Math.min(latestMessage.text.length * 80, 8000); // ~80ms per character, max 8 seconds
      const timer = setTimeout(() => {
        setAvatarState("idle");
      }, speechDuration);
      
      return () => clearTimeout(timer);
    }
  }, [latestMessage, isProcessing, isListening]);
  
  // When video playback ends
  const handleVideoEnd = () => {
    setAvatarState("idle");
  };
  
  return (
    <div className="mb-6">
      <InteractiveAvatar
        imageUrl={imageUrl}
        videoUrl={videoUrl || defaultVideoUrl}
        avatarState={avatarState}
        className="aspect-4-5 shadow-lg"
        onVideoEnd={handleVideoEnd}
      />
      <div className="mt-2 text-center text-sm text-gray-600">
        {avatarState === "idle" && messages.length > 0 && "Ask me anything..."}
        {avatarState === "thinking" && "Thinking..."}
        {avatarState === "speaking" && "Speaking..."}
        {avatarState === "listening" && "Listening..."}
      </div>
    </div>
  );
}
