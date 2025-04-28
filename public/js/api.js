/**
 * API client for the IZZY app
 * Handles communication with the backend
 */

// Set the API URL to the Flask backend
const API_URL = 'http://localhost:5000';
console.log('API initialized with URL:', API_URL);

// Fallback responses when backend is not available
const FALLBACK_RESPONSES = [
  "Hi there! I'm IZZY. How can I help you today?",
  "Hello! I'm IZZY, your AI conversation partner. What would you like to chat about?",
  "Great to see you! I'm IZZY. Tell me something about yourself.",
  "Hi! I'm here to help you practice conversations. What's on your mind?",
  "Hello there! I'm IZZY. How are you feeling today?",
  "I'm IZZY, your AI conversation partner. What would you like to discuss?",
  "Nice to meet you! I'm IZZY. How can I assist you today?",
  "I'm IZZY! I'm here to chat with you. What would you like to talk about?",
  "Hello! I'm your AI conversation partner. What's something you'd like to discuss?",
  "Hi! I'm IZZY. I'm here to help you practice your conversation skills. What's on your mind?"
];

/**
 * Send a message to the AI backend
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Response with the AI's reply
 */
async function sendMessage(message) {
  if (!message || typeof message !== 'string') {
    console.error('Invalid message format:', message);
    return { response: getSmartFallbackResponse(null) };
  }

  try {
    console.log('Sending message to backend:', message);
    console.log('API URL being used:', API_URL);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout to 30 seconds
    
    // Add more detailed logging
    console.log('Sending fetch request to:', `${API_URL}/ask`);
    console.log('Request payload:', JSON.stringify({ prompt: message }));
    
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ prompt: message }),
      signal: controller.signal,
      credentials: 'omit' // Don't send cookies
    });
    
    // Clear timeout after response is received
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Backend responded with status: ${response.status}`);
      return { response: getSmartFallbackResponse(message) };
    }

    const data = await response.json();
    console.log('Response from backend:', data);
    
    // Check if we got a valid response
    if (!data || !data.response || data.response === 'undefined') {
      console.warn('Backend returned invalid data:', data);
      return { response: getSmartFallbackResponse(message) };
    }
    
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    // Return a fallback response instead of throwing
    return { response: getSmartFallbackResponse(message) };
  }
}

/**
 * Get a context-aware fallback response
 */
function getSmartFallbackResponse(message) {
  if (!message) return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  
  const lowerMessage = message.toLowerCase();
  
  // Simple pattern matching for common questions
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! It's great to meet you. How are you doing today?";
  }
  
  if (lowerMessage.includes('how are you')) {
    return "I'm doing well, thanks for asking! How about you?";
  }
  
  if (lowerMessage.includes('name') && (lowerMessage.includes('your') || lowerMessage.includes('what'))) {
    return "I'm IZZY, your AI conversation partner. I'm here to help you practice your communication skills!";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('do for me')) {
    return "I'm here to help you practice conversations in a safe, judgment-free environment. We can chat about various topics, and I can provide feedback on your communication style if you'd like.";
  }
  
  // Default random response for anything else
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

/**
 * Initialize the speech recognition capabilities
 * @param {Function} onTranscriptReady - Callback for when transcript is ready
 * @param {Function} onListeningChange - Callback for listening state changes
 * @param {number} maxDuration - Maximum recording duration in seconds (default: 180 / 3 minutes)
 * @returns {Object} Speech recognition controls
 */
function initSpeechRecognition(onTranscriptReady, onListeningChange, maxDuration = 180) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech recognition not supported in this browser');
    return {
      start: () => console.warn('Speech recognition not supported'),
      stop: () => {},
      isSupported: false
    };
  }

  let recognition = null;
  let timer = null;
  
  const start = () => {
    if (recognition) {
      recognition.stop();
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      onListeningChange(true);
      
      // Set timer to automatically stop after maxDuration
      timer = setTimeout(() => {
        stop();
      }, maxDuration * 1000);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscriptReady(transcript);
    };
    
    recognition.onend = () => {
      onListeningChange(false);
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      onListeningChange(false);
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    
    recognition.start();
  };
  
  const stop = () => {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  
  return {
    start,
    stop,
    isSupported: true
  };
}

/**
 * Initialize the sharing functionality
 * @returns {Object} Sharing utilities
 */
function initSharing() {
  const generateReferralLink = () => {
    // In a real app, this would generate a unique referral code
    const baseUrl = window.location.origin;
    const referralCode = 'FRIEND' + Math.floor(Math.random() * 10000);
    return `${baseUrl}?ref=${referralCode}`;
  };
  
  const shareVia = (platform, referralLink) => {
    const link = referralLink || generateReferralLink();
    const text = 'Check out IZZY - the AI avatar for real conversations!';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent('I\'ve been using IZZY to practice my conversation skills and thought you might like it too!\n\nCheck it out: ' + link)}`;
        break;
      default:
        console.warn('Unknown sharing platform:', platform);
        return;
    }
    
    window.open(shareUrl, '_blank');
  };
  
  return {
    generateReferralLink,
    shareVia
  };
}

// Export API functions
window.IZZY_API = {
  sendMessage,
  initSpeechRecognition,
  initSharing
}; 