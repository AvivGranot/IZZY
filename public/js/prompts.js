let freePrompts = Number(localStorage.getItem('freePrompts') || 3);
const DEFAULT_FREE_PROMPTS = 3;

function updatePromptCounter() {
  const counter = document.getElementById('free-prompts-count');
  if (counter) counter.textContent = freePrompts;
  const warning = document.getElementById('prompts-warning');
  const warningCount = document.getElementById('prompts-warning-count');
  if (warning && warningCount) {
    warningCount.textContent = freePrompts;
    warning.classList.toggle('hidden', freePrompts > 1);
  }
  // Disable send button if no prompts left
  const sendBtn = document.getElementById('sendButton');
  if (sendBtn) sendBtn.disabled = freePrompts <= 0;
}

function resetPromptCount() {
  console.log("Resetting prompt count to default:", DEFAULT_FREE_PROMPTS);
  freePrompts = DEFAULT_FREE_PROMPTS;
  localStorage.setItem('freePrompts', freePrompts);
  updatePromptCounter();
}

function decrementPromptCount() {
  console.log("Decrementing prompt count from:", freePrompts);
  if (freePrompts > 0) {
    freePrompts--;
    localStorage.setItem('freePrompts', freePrompts);
    updatePromptCounter();
    
    if (freePrompts <= 0) {
      showSubscriptionModal();
    }
  }
  return freePrompts;
}

function showSubscriptionModal() {
  document.getElementById('subscribeModal').classList.remove('hidden');
  document.getElementById('sendButton').disabled = true;
}

function closeSubscribeModal() {
  document.getElementById('subscribeModal').classList.add('hidden');
}

window.closeSubscribeModal = closeSubscribeModal; // for inline onclick
window.resetPromptCount = resetPromptCount; // export for other modules
window.decrementPromptCount = decrementPromptCount; // export for other modules

// Initialize the prompt counter on page load
document.addEventListener('DOMContentLoaded', function() {
  updatePromptCounter();
  
  // Add event listener for restart button to reset prompt count
  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', function() {
      resetPromptCount();
    });
  }
});

async function handleSend() {
  if (freePrompts <= 0) {
    showSubscriptionModal();
    return;
  }
  const userInput = document.getElementById('userInput').value.trim();
  if (!userInput) return;
  
  // Get the actual sendMessage function from the API module
  const sendMessage = window.IZZY_API?.sendMessage;
  if (!sendMessage) {
      console.error("IZZY_API or sendMessage not found!");
      appendMessage('izzy', 'Error: Cannot connect to API.'); // Provide feedback
      return;
  }

  // Disable input while waiting
  document.getElementById('userInput').disabled = true;
  document.getElementById('sendButton').disabled = true; // Consider adding a loading state too
  // Optionally: show spinner

  appendMessage('user', userInput); // Show user message immediately
  document.getElementById('userInput').value = ''; // Clear input *after* sending

  try {
    const izzyData = await sendMessage(userInput);
    
    // Check if it was a fallback response (heuristically)
    const isFallback = FALLBACK_RESPONSES.includes(izzyData.response) || 
                      izzyData.response.includes("great to meet you") || 
                      izzyData.response.includes("doing well, thanks") ||
                      izzyData.response.includes("I'm IZZY, your AI conversation partner") ||
                      izzyData.response.includes("safe, judgment-free environment");

    if (izzyData && izzyData.response && !isFallback) {
      // Decrement only on successful, non-fallback response
      if (window.decrementPromptCount) {
           window.decrementPromptCount();
      } else {
          console.warn("decrementPromptCount not found");
      }
      appendMessage('izzy', izzyData.response);
    } else {
      // Handle fallback or error response without decrementing
      console.warn("Received fallback or invalid response:", izzyData);
      appendMessage('izzy', izzyData.response || "Sorry, I couldn't process that."); 
    }

  } catch (error) {
      console.error("Error during handleSend:", error);
      appendMessage('izzy', 'Sorry, something went wrong.');
  } finally {
      // Re-enable input regardless of success/failure
      document.getElementById('userInput').disabled = false;
      // Re-enable send button only if prompts > 0
      updatePromptCounter(); // This will set the button state based on current freePrompts
      // Optionally: hide spinner
  }
}

// Make sure FALLBACK_RESPONSES is accessible here if needed for the check
// It might be better to pass a flag from sendMessage or check status code if possible
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

// Make appendMessage available if it's defined in another file (e.g., chat.js)
// Assuming appendMessage exists globally or is imported/available
// declare const appendMessage: (speaker: string, message: string) => void; // REMOVED

document.getElementById('sendButton').addEventListener('click', handleSend);
document.querySelectorAll('[onclick="closeSubscribeModal()"]').forEach(btn => {
  btn.addEventListener('click', closeSubscribeModal);
});