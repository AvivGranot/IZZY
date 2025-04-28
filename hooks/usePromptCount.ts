import { useState, useEffect } from 'react';

// Start with 3 free prompts
const MAX_FREE_PROMPTS = 3;

export const usePromptCount = () => {
  const [promptCount, setPromptCount] = useState(() => {
    // Check localStorage for existing prompt count
    const savedCount = localStorage.getItem('izzy_prompt_count');
    return savedCount ? parseInt(savedCount, 10) : MAX_FREE_PROMPTS;
  });

  // Save prompt count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('izzy_prompt_count', promptCount.toString());
  }, [promptCount]);

  const decrementPrompts = () => {
    if (promptCount > 0) {
      const newCount = promptCount - 1;
      setPromptCount(newCount);
      
      // If this was the last prompt, show subscription modal
      if (newCount === 0) {
        // Dispatch custom event to show subscription modal
        window.dispatchEvent(new CustomEvent('showSubscription'));
      }
    }
  };

  const resetPrompts = () => {
    setPromptCount(MAX_FREE_PROMPTS);
  };

  return {
    promptCount,
    decrementPrompts,
    resetPrompts,
    maxPrompts: MAX_FREE_PROMPTS
  };
};