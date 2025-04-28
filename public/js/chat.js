// chat.js - Handles chat functionality for IZZY

// Import API functions if they exist
const api = window.IZZY_API || {
  sendMessage: async (message) => {
    console.error('API not initialized');
    return { response: 'Sorry, the API is not available.' };
  },
  initSpeechRecognition: () => ({
    start: () => {},
    stop: () => {},
    isSupported: false
  }),
  initSharing: () => ({
    generateReferralLink: () => '',
    shareVia: () => {}
  })
};

// Chat state
let chatHistory = [];
let isListening = false;
let promptCount = 3; // Start with 3 free prompts

// DOM elements
const elements = {
  get chatContainer() { return document.getElementById('chat-container'); },
  get promptsCount() { return document.getElementById('free-prompts-count'); },
  get promptsWarning() { return document.getElementById('prompts-warning'); },
  get promptsWarningCount() { return document.getElementById('prompts-warning-count'); },
  get userInput() { return document.getElementById('userInput'); },
  get sendButton() { return document.getElementById('sendButton'); },
  get micButton() { return document.getElementById('micButton'); },
  get restartButton() { return document.getElementById('restartBtn'); }
};

// Load chat history from local storage
function loadChatHistory() {
  const saved = localStorage.getItem('izzy_chat_history');
  if (saved) {
    try {
      chatHistory = JSON.parse(saved);
      renderChatHistory();
    } catch (e) {
      console.error('Failed to parse chat history:', e);
      chatHistory = [];
    }
  }
}

// Load prompt count from local storage
function loadPromptCount() {
  const saved = localStorage.getItem('izzy_prompt_count');
  if (saved) {
    promptCount = parseInt(saved, 10);
  } else {
    promptCount = 3; // Default to 3 free prompts
    localStorage.setItem('izzy_prompt_count', promptCount.toString());
  }
  updatePromptCountDisplay();
}

// Update the prompt count display
function updatePromptCountDisplay() {
  if (elements.promptsCount) {
    elements.promptsCount.textContent = promptCount;
  }
  
  if (elements.promptsWarning && elements.promptsWarningCount) {
    if (promptCount <= 1) {
      elements.promptsWarning.classList.remove('hidden');
      elements.promptsWarningCount.textContent = promptCount;
    } else {
      elements.promptsWarning.classList.add('hidden');
    }
  }
}

// Decrement prompt count
function decrementPromptCount() {
  if (promptCount > 0) {
    promptCount--;
    localStorage.setItem('izzy_prompt_count', promptCount.toString());
    updatePromptCountDisplay();
    
    // Show subscription modal if no prompts left
    if (promptCount === 0) {
      showSubscribeModal();
    }
  }
}

// Render chat history to the DOM
function renderChatHistory() {
  if (!elements.chatContainer) return;
  
  elements.chatContainer.innerHTML = '';
  
  if (chatHistory.length === 0) {
    elements.chatContainer.innerHTML = '<div class="text-center text-gray-500 my-4">Start a conversation with IZZY!</div>';
    return;
  }
  
  // Make conversation history visible
  const conversationHistory = document.getElementById('conversation-history');
  if (conversationHistory) {
    conversationHistory.classList.remove('hidden');
  }
  
  chatHistory.forEach(message => {
    const messageEl = document.createElement('div');
    messageEl.className = message.type === 'user' ? 'chat-message user' : 'chat-message izzy';
    
    let innerContent = '';
    if (message.type === 'assistant') {
      innerContent += `<div class="avatar">IZZY</div>`;
    }
    
    // Handle undefined content
    let content = message.content;
    if (!content || content === 'undefined' || content.trim() === '') {
      if (message.type === 'assistant') {
        content = "I'm here to help with your conversation practice!";
      } else {
        content = "(Empty message)";
      }
    }
    
    innerContent += `<div class="content">${content}</div>`;
    
    messageEl.innerHTML = innerContent;
    elements.chatContainer.appendChild(messageEl);
  });
  
  // Scroll to bottom
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

// Send a message
async function sendMessage(message) {
  if (!message.trim()) return;
  
  // Enforce word limit (200 words)
  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount > 200) {
    showToast('Message too long. Please limit to 200 words.');
    return;
  }
  
  // Check if we have prompts left
  if (promptCount <= 0) {
    showSubscribeModal();
    return;
  }
  
  // Disable send button and show loading state
  if (elements.sendButton) {
    const sendBtnText = elements.sendButton.querySelector('.send-btn-text');
    const spinner = elements.sendButton.querySelector('.spinner');
    
    if (sendBtnText) sendBtnText.textContent = 'Sending...';
    if (spinner) spinner.classList.remove('hidden');
    elements.sendButton.disabled = true;
  }
  
  // Add user message to chat
  const userMessage = {
    id: Date.now().toString(),
    content: message,
    type: 'user',
    timestamp: Date.now()
  };
  
  chatHistory.push(userMessage);
  saveChatHistory();
  renderChatHistory();
  
  // Clear input
  if (elements.userInput) {
    elements.userInput.value = '';
  }
  
  try {
    // Get response from API
    const response = await api.sendMessage(message);
    
    // Add assistant response to chat
    const assistantMessage = {
      id: Date.now().toString(),
      content: response.response,
      type: 'assistant',
      timestamp: Date.now()
    };
    
    chatHistory.push(assistantMessage);
    saveChatHistory();
    renderChatHistory();
    
    // Decrement prompt count
    decrementPromptCount();
    
    // Show restart button after conversation has started
    if (elements.restartButton && chatHistory.length >= 2) {
      elements.restartButton.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Add error message
    const errorMessage = {
      id: Date.now().toString(),
      content: 'Sorry, there was an error processing your request. Please try again.',
      type: 'assistant',
      error: true,
      timestamp: Date.now()
    };
    
    chatHistory.push(errorMessage);
    saveChatHistory();
    renderChatHistory();
  } finally {
    // Reset button state
    if (elements.sendButton) {
      const sendBtnText = elements.sendButton.querySelector('.send-btn-text');
      const spinner = elements.sendButton.querySelector('.spinner');
      
      if (sendBtnText) sendBtnText.textContent = 'Send Message';
      if (spinner) spinner.classList.add('hidden');
      elements.sendButton.disabled = false;
    }
  }
}

// Save chat history to local storage
function saveChatHistory() {
  localStorage.setItem('izzy_chat_history', JSON.stringify(chatHistory));
}

// Clear chat history
function clearChat() {
  chatHistory = [];
  saveChatHistory();
  renderChatHistory();
  
  if (elements.restartButton) {
    elements.restartButton.classList.add('hidden');
  }
  
  // Hide conversation history section
  const conversationHistory = document.getElementById('conversation-history');
  if (conversationHistory) {
    conversationHistory.classList.add('hidden');
  }
}

// Speech recognition setup
let speechRecognition = null;

function setupSpeechRecognition() {
  speechRecognition = api.initSpeechRecognition(
    (transcript) => {
      // When transcript is ready
      if (elements.userInput) {
        elements.userInput.value = transcript;
        
        // Auto-send if the message is complete
        if (transcript.endsWith('.') || transcript.endsWith('!') || transcript.endsWith('?')) {
          sendMessage(transcript);
        }
      }
      isListening = false;
      updateMicButtonState();
    },
    (isListeningState) => {
      // Listening state changed
      isListening = isListeningState;
      updateMicButtonState();
    },
    180 // 3 minutes max duration
  );
}

// Update microphone button state
function updateMicButtonState() {
  if (!elements.micButton) return;
  
  if (isListening) {
    elements.micButton.innerHTML = '<i class="fas fa-stop text-red-500 text-xl"></i>';
    elements.micButton.setAttribute('aria-label', 'Stop listening');
    elements.micButton.classList.add('recording');
  } else {
    elements.micButton.innerHTML = '<i class="fas fa-microphone text-xl"></i>';
    elements.micButton.setAttribute('aria-label', 'Use voice input');
    elements.micButton.classList.remove('recording');
  }
}

// Start dictation
function startDictation() {
  if (!speechRecognition) {
    setupSpeechRecognition();
  }
  
  if (!speechRecognition.isSupported) {
    showToast('Speech recognition is not supported in your browser.');
    return;
  }
  
  if (isListening) {
    speechRecognition.stop();
  } else {
    speechRecognition.start();
  }
}

// Setup sharing functionality
function setupSharing() {
  const sharing = api.initSharing();
  
  // Set up share buttons
  document.querySelectorAll('[data-share]').forEach(button => {
    button.addEventListener('click', () => {
      const platform = button.getAttribute('data-share');
      if (platform) {
        sharing.shareVia(platform);
      }
    });
  });
  
  // Copying referral link
  window.copyReferralLink = () => {
    const link = sharing.generateReferralLink();
    navigator.clipboard.writeText(link)
      .then(() => showToast('Referral link copied to clipboard!'))
      .catch(() => showToast('Failed to copy link. Please try again.'));
  };
}

// Show a toast message
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.remove('translate-y-full', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
  }, duration);
}

// Show subscription modal
function showSubscribeModal() {
  const modal = document.getElementById('subscribeModal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Close subscription modal
window.closeSubscribeModal = () => {
  const modal = document.getElementById('subscribeModal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

// Open share modal
window.openShareModal = () => {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.remove('hidden');
    
    // Set personal link in modal
    const personalLink = document.getElementById('personalLink');
    if (personalLink) {
      personalLink.value = api.initSharing().generateReferralLink();
    }
  }
};

// Close share modal
window.closeShareModal = () => {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.add('hidden');
  }
};

// Share via platform
window.shareVia = (platform) => {
  const sharing = api.initSharing();
  const link = document.getElementById('personalLink')?.value || sharing.generateReferralLink();
  sharing.shareVia(platform, link);
};

// Initialize chat functionality
function init() {
  loadChatHistory();
  loadPromptCount();
  setupSpeechRecognition();
  setupSharing();
  
  // Setup event listeners
  if (elements.sendButton) {
    elements.sendButton.addEventListener('click', () => {
      if (elements.userInput) {
        sendMessage(elements.userInput.value);
      }
    });
  }
  
  if (elements.userInput) {
    elements.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(elements.userInput.value);
      }
    });
  }
  
  if (elements.restartButton) {
    elements.restartButton.addEventListener('click', clearChat);
  }
  
  if (elements.micButton) {
    elements.micButton.addEventListener('click', startDictation);
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);