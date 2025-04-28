function setupEventListeners() {
  // Magic-link email form
  // dom.emailForm?.addEventListener('submit', sendMagicLink);

  // Send chat
  dom.sendButton?.addEventListener('click', handleSendMessage);
  dom.userInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  dom.restartBtn?.addEventListener('click', restartConversation);
  document.getElementById('micButton')?.addEventListener('click', startDictation);

  console.log('Event listeners set up');
}

async function handleSendMessage() {
  const textarea = dom.userInput;
  const userMessage = textarea.value.trim();
  if (!userMessage) return;
  
  // Display user message
  appendMessage('user', userMessage);
  textarea.value = '';
  dom.restartBtn?.classList.remove('hidden');
  dom.historySection?.classList.remove('hidden');
  
  try {
    // Call the API and get a response
    console.log('Sending message to API:', userMessage);
    let response;
    
    if (window.IZZY_API && window.IZZY_API.sendMessage) {
      // Use the IZZY_API if available
      response = await window.IZZY_API.sendMessage(userMessage);
    } else {
      // Fallback if API is not available
      console.warn('IZZY_API not available, using built-in sendMessage');
      response = await sendMessage(userMessage);
    }
    
    // Extract the response text
    let responseText = '';
    if (response && typeof response === 'object') {
      responseText = response.response || '';
    } else if (typeof response === 'string') {
      responseText = response;
    }
    
    // Display IZZY's response
    console.log('Received response:', responseText);
    appendMessage('izzy', responseText);
  } catch (error) {
    console.error('Error in handleSendMessage:', error);
    appendMessage('izzy', "I'm having trouble connecting right now. Please try again later.");
  }
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.className = sender === 'user' ? 'chat-bubble user-bubble' : 'chat-bubble assistant-bubble';
  
  // Handle undefined or empty messages
  let displayText = text;
  if (!displayText || displayText === 'undefined' || displayText.trim() === '') {
    displayText = sender === 'izzy' ? 
      "I'm here to help with your conversation practice!" : 
      "(Empty message)";
  }
  
  msg.textContent = (sender === 'user' ? 'You: ' : 'IZZY: ') + displayText;
  dom.chatContainer.appendChild(msg);
  dom.historySection?.classList.remove('hidden');
  dom.restartBtn?.classList.remove('hidden');
  dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
  initializeDOMElements();
  setupEventListeners();
  requestMicPermission();

  // recaptcha stub
  window.recaptchaLoaded = false;
  window.onRecaptchaLoad = () => {
    recaptchaLoaded = true;
    if (typeof setupRecaptcha === 'function') {
      setupRecaptcha();
    }
  };

  // Try to set up Firebase safely
  try {
    if (typeof window.setupFirebase === 'function') {
      window.setupFirebase();
    } else {
      console.warn('setupFirebase function not available, creating mock Firebase');
      window.auth = {
        onAuthStateChanged: cb => cb({ uid: 'test-user', email: 'test@example.com' }),
        signOut: () => Promise.resolve()
      };
      window.db = {
        ref: () => ({
          on: (_, cb) => cb({ val: () => ({}) }),
          push: () => Promise.resolve(),
          remove: () => Promise.resolve()
        })
      };
    }
    
    // Try magic link sign in if function exists
    if (typeof window.handleMagicLinkSignIn === 'function') {
      window.handleMagicLinkSignIn();
    }
  } catch (e) {
    console.error('Error setting up Firebase:', e);
  }

  // Initialize other components
  if (typeof initializePromptCount === 'function') {
    initializePromptCount();
  }

  // Initialize referral program buttons in footer
  setupReferralButtons();
  
  // Remove subscription UI from header
  removeHeaderSubscriptionUI();
  
  // Make the header narrower
  updateHeaderStyles();
  
  // Add mobile optimization
  optimizeForMobile();
});

// ask for mic once
function requestMicPermission() {
  navigator.mediaDevices?.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop()));
}

// Set up referral buttons in footer
function setupReferralButtons() {
  console.log('Setting up referral buttons in footer');
  // Target both data-share attribute elements and direct platform links in footer 
  const shareButtons = document.querySelectorAll('footer [data-share], footer a.bg-blue-600, footer a.bg-sky-500, footer a.bg-green-500, footer a.bg-blue-800, footer a.bg-gray-600');
  
  shareButtons.forEach(button => {
    console.log('Setting up button:', button);
    button.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      
      // Get platform from data attribute or element content
      let platform = this.getAttribute('data-share');
      if (!platform) {
        // Try to determine platform from content or classes
        if (this.textContent.includes('Facebook') || this.classList.contains('bg-blue-600')) {
          platform = 'facebook';
        } else if (this.textContent.includes('Twitter') || this.classList.contains('bg-sky-500')) {
          platform = 'twitter';
        } else if (this.textContent.includes('WhatsApp') || this.classList.contains('bg-green-500')) {
          platform = 'whatsapp';
        } else if (this.textContent.includes('LinkedIn') || this.classList.contains('bg-blue-800')) {
          platform = 'linkedin';
        } else if (this.textContent.includes('Email') || this.classList.contains('bg-gray-600')) {
          platform = 'email';
        }
      }
      
      console.log('Share clicked for platform:', platform);
      if (!platform) return;
      
      // Generate a referral link
      const baseUrl = window.location.origin;
      const referralCode = 'FRIEND' + Math.floor(Math.random() * 10000);
      const referralLink = `${baseUrl}?ref=${referralCode}`;
      
      // Share via the appropriate platform
      // Use IZZY_API.initSharing().shareVia if available, otherwise use local function
      if (window.IZZY_API?.initSharing?.shareVia) {
          window.IZZY_API.initSharing.shareVia(platform, referralLink);
      } else {
          shareViaReferral(platform, referralLink);
      }
    });
  });
}

// Share referral link via different platforms
function shareViaReferral(platform, link) {
  const shareText = 'Check out IZZY - the AI avatar for real conversations!';
  let shareUrl = '';
  
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + link)}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent('I\'ve been using IZZY to practice my conversation skills and thought you might like it too!\n\nCheck it out: ' + link)}`;
      break;
    default:
      showToast('Sharing option not available.');
      return;
  }
  
  // Open share dialog
  window.open(shareUrl, '_blank');
  
  // Show confirmation
  showToast(`Sharing IZZY via ${platform}!`);
}

// Show toast message
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.remove('translate-y-full', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
  }, duration);
}

// Remove subscription UI from header
function removeHeaderSubscriptionUI() {
  // Find and hide subscription button in header if it exists
  const headerSubUI = document.querySelector('nav .subscription-ui');
  if (headerSubUI) {
    headerSubUI.style.display = 'none';
  }
  
  // Also remove any subscription links from the navigation
  const subLinks = document.querySelectorAll('nav a[href="#subscribe"]');
  subLinks.forEach(link => {
    link.style.display = 'none';
  });
}

// Make the header narrower
function updateHeaderStyles() {
  const header = document.querySelector('header, nav.desktop-nav');
  if (header) {
    header.style.maxWidth = '900px';
    header.style.margin = '0 auto';
    header.style.padding = '0.75rem 1rem';
    header.style.width = '100%';
    header.style.boxSizing = 'border-box';
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    header.style.backdropFilter = 'blur(5px)';
  }
  
  // Also update the footer
  const footer = document.querySelector('footer');
  if (footer) {
    footer.style.maxWidth = '900px';
    footer.style.margin = '0 auto';
    footer.style.width = '100%';
    footer.style.boxSizing = 'border-box';
  }
}

// Optimize for mobile devices
function optimizeForMobile() {
  // Add viewport meta tag if it doesn't exist
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
    document.head.appendChild(meta);
  }
  
  // Add responsive styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .desktop-nav {
        display: none !important;
      }
      
      .mobile-nav-button {
        display: block !important;
      }
      
      .mobile-menu {
        width: 100% !important;
        max-width: 300px !important;
      }
      
      footer [data-share], footer .bg-blue-600, footer .bg-sky-500, footer .bg-green-500, footer .bg-blue-800, footer .bg-gray-600 {
        padding: 0.5rem !important;
        font-size: 0.875rem !important;
      }
      
      .chat-panel {
        height: auto !important;
        max-height: 80vh !important;
      }
      
      .subscription-options {
        flex-direction: column !important;
      }
      
      .plan {
        width: 100% !important;
        margin-bottom: 1rem !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Make buttons more touch-friendly
  const buttons = document.querySelectorAll('button, .btn, [role="button"], [type="button"]');
  buttons.forEach(button => {
    if (button.style) {
      button.style.minHeight = '44px';
      button.style.minWidth = '44px';
    }
  });
}

// Function to restart conversation
function restartConversation() {
  if (dom.chatContainer) {
    // Clear chat container
    dom.chatContainer.innerHTML = '';
    
    // Hide restart button
    if (dom.restartBtn) {
      dom.restartBtn.classList.add('hidden');
    }
    
    // Hide conversation history section
    if (dom.historySection) {
      dom.historySection.classList.add('hidden');
    }
    
    // Show initial message or placeholder
    const placeholderMsg = document.createElement('div');
    placeholderMsg.className = 'text-center text-gray-500 my-4';
    placeholderMsg.textContent = 'Start a conversation with IZZY!';
    dom.chatContainer.appendChild(placeholderMsg);
    
    // Reset any state variables if needed
    localStorage.removeItem('izzy_chat_history');
    
    // Show toast confirmation
    showToast('Conversation restarted!');
  }
}

// Fallback responses for when API is not available
const LOCAL_FALLBACK_RESPONSES = [
  "Hi there! I'm IZZY. How can I help you today?",
  "Hello! I'm IZZY, your AI conversation partner. What would you like to chat about?",
  "Great to see you! I'm IZZY. Tell me something about yourself.",
  "Hi! I'm here to help you practice conversations. What's on your mind?",
  "Hello there! I'm IZZY. How are you feeling today?",
  "I'm IZZY, your AI conversation partner. What would you like to discuss?",
  "Nice to meet you! I'm IZZY. How can I assist you today?",
  "I'm IZZY! I'm here to chat with you. What would you like to talk about?",
  "Hello! I'm your AI conversation partner. What's something you'd like to discuss?"
];

// Fallback sendMessage function in case API.js fails to load
async function sendMessage(message) {
  console.log('Using fallback sendMessage function');
  
  // A simple rule-based response system
  const lowerMessage = message.toLowerCase();
  let response = "";
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    response = "Hello! It's great to meet you. How are you doing today?";
  } else if (lowerMessage.includes('how are you')) {
    response = "I'm doing well, thanks for asking! How about you?";
  } else if (lowerMessage.includes('name') && (lowerMessage.includes('your') || lowerMessage.includes('what'))) {
    response = "I'm IZZY, your AI conversation partner. I'm here to help you practice your communication skills!";
  } else if (lowerMessage.includes('help') || lowerMessage.includes('do for me')) {
    response = "I'm here to help you practice conversations in a safe environment. We can chat about various topics, and I can provide feedback on your communication style if you'd like.";
  } else {
    // Random response for anything else
    response = LOCAL_FALLBACK_RESPONSES[Math.floor(Math.random() * LOCAL_FALLBACK_RESPONSES.length)];
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Return in the same format as the API would
  return { response: response };
}