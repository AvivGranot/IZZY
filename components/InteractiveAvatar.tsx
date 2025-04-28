import { useState, useRef, useEffect } from "react";
import { Maximize2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AvatarState = "idle" | "speaking" | "listening" | "thinking";

interface InteractiveAvatarProps {
  imageUrl?: string;
  videoUrl?: string;
  avatarState: AvatarState;
  className?: string;
  onVideoEnd?: () => void;
}

const defaultAvatarImage = "https://i.imgur.com/Nx3PcAL.png"; // Placeholder avatar image

export default function InteractiveAvatar({ 
  imageUrl, 
  videoUrl, 
  avatarState, 
  className,
  onVideoEnd
}: InteractiveAvatarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Dynamic styles based on avatar state
  const getStateStyles = () => {
    switch (avatarState) {
      case "speaking":
        return "border-green-500 border-2 animate-pulse";
      case "listening":
        return "border-blue-500 border-2";
      case "thinking":
        return "border-yellow-500 border-2 opacity-80";
      default:
        return "border-transparent border-2";
    }
  };

  useEffect(() => {
    // Handle video playback based on state
    if (videoRef.current) {
      if (avatarState === "speaking" && videoUrl) {
        videoRef.current.src = videoUrl;
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
        });
      } else if (avatarState === "idle" && videoRef.current.src !== "") {
        // Reset to static image when idle
        videoRef.current.pause();
      }
    }
  }, [avatarState, videoUrl]);

  // Handle video end event
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleEnded = () => {
      if (onVideoEnd) onVideoEnd();
    };
    
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoEnd]);
  
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return (
    <div 
      className={cn(
        "aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg relative",
        getStateStyles(),
        className
      )}
    >
      {avatarState === "speaking" && videoUrl ? (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover" 
          muted={isMuted}
          playsInline
          poster={imageUrl || defaultAvatarImage}
          onEnded={onVideoEnd}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={imageUrl || defaultAvatarImage}
            alt="AI Avatar" 
            className="w-full h-full object-cover"
          />
          {avatarState === "thinking" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
      
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-gray-900 bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-gray-900 bg-opacity-70 text-white rounded-full p-2 hover:bg-opacity-90"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      {avatarState === "listening" && (
        <div className="absolute bottom-4 left-4 flex space-x-1">
          <div className="w-2 h-6 bg-blue-500 rounded-full animate-sound-wave"></div>
          <div className="w-2 h-8 bg-blue-500 rounded-full animate-sound-wave animation-delay-200"></div>
          <div className="w-2 h-4 bg-blue-500 rounded-full animate-sound-wave animation-delay-400"></div>
          <div className="w-2 h-7 bg-blue-500 rounded-full animate-sound-wave animation-delay-600"></div>
        </div>
      )}
    </div>
  );
}
