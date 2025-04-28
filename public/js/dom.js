// DOM & EVENT INITIALIZATION
    // ——————————————————————————————————————————
    let dom = {}; 
 
    function initializeDOMElements() {
        dom = {
          authModal: document.getElementById('authModal'),
          emailForm: document.getElementById('email-form'),
          emailInput: document.getElementById('email'),
          emailSubmitBtn: document.getElementById('email-submit-btn'),
          emailBtnText: document.querySelector('.email-btn-text'),
          emailSpinner: document.querySelector('#email-submit-btn .spinner'),
          statusMessage: document.getElementById('auth-status-message'),
          recaptchaContainer: document.getElementById('recaptcha-container'),
          mainContent: document.getElementById('mainContent'),
          userInput: document.getElementById('userInput'),
          sendButton: document.getElementById('sendButton'),
          sendBtnText: document.querySelector('.send-btn-text'),
          sendSpinner: document.querySelector('#sendButton .spinner'),
          chatContainer: document.getElementById('chat-container'),
          historySection: document.getElementById('conversation-history'),
          restartBtn: document.getElementById('restartBtn'),
          micIcon: document.querySelector('#micButton i'),
          toast: document.getElementById('toast'),
          // …and any other elements you need…
        };
        console.log('DOM elements initialized');
      }
    