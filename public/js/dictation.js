function startDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return showToast('No Speech API', true);
  const recog = new SpeechRecognition();
  recog.continuous = true; // <-- Allow long dictation
  recog.onresult = e => {
    const t = e.results[0][0].transcript;
    // Limit to 100 words
    const words = t.trim().split(/\s+/).slice(0, 100).join(' ');
    dom.userInput.value = words;
    sendMessage(words);
    recog.stop(); // Stop after sending
  };
  recog.onend = () => {
    // Only restart if not already sent
    if (!dom.userInput.value) recog.start();
  };
  recog.start();
}