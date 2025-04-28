const ACTION_CODE_SETTINGS = {
  url: window.location.origin + window.location.pathname,
  handleCodeInApp: true
};

// Check if Firebase is in dev mode
window.isDevMode = true; // Set to true for development, set to false for production

function setupFirebase() {
  if (window.isDevMode) {
    console.log('Dev mode: mocking Firebase');
    window.firebase = {
      auth: () => ({
        onAuthStateChanged: cb => cb({ uid: 'test-user', email: 'test@example.com' }),
        sendSignInLinkToEmail: () => Promise.resolve(),
        signInWithEmailLink: () => Promise.resolve({ user: { uid: 'test-user' } }),
        signOut: () => Promise.resolve(),
        isSignInWithEmailLink: href => href.includes('signIn') // mock for dev
      })
    };
    
    window.db = {
      ref: () => ({
        on: (_, cb) => cb({ val: () => ({}) }),
        push: d => (console.log('Mock push', d), Promise.resolve()),
        remove: () => Promise.resolve()
      })
    };
    
    window.auth = window.firebase.auth();
    return;
  }

  // Only try to initialize real Firebase if not in dev mode and Firebase is available
  if (typeof firebase !== 'undefined') {
    console.log('Initializing real Firebase auth');
    try {
      window.auth = firebase.auth();
      window.db = firebase.database();
      auth.onAuthStateChanged(user => {
        if (user) {
          console.log('Real user:', user.uid);
          updateUIForLoggedInUser(user);
          loadMessages(user.uid);
        } else {
          console.log('No real user');
        }
      });
    } catch (e) {
      console.error('Error initializing Firebase:', e);
      // Fall back to mock Firebase on error
      setupDevModeFirebase();
    }
  } else {
    console.warn('Firebase not available, using mock');
    setupDevModeFirebase();
  }
}

function setupDevModeFirebase() {
  console.log('Setting up mock Firebase');
  window.auth = {
    onAuthStateChanged: cb => cb({ uid: 'test-user', email: 'test@example.com' }),
    sendSignInLinkToEmail: () => Promise.resolve(),
    signInWithEmailLink: () => Promise.resolve({ user: { uid: 'test-user' } }),
    signOut: () => Promise.resolve(),
    isSignInWithEmailLink: href => href.includes('signIn') // mock for dev
  };
  
  window.db = {
    ref: () => ({
      on: (_, cb) => cb({ val: () => ({}) }),
      push: d => (console.log('Mock push', d), Promise.resolve()),
      remove: () => Promise.resolve()
    })
  };
}

function handleMagicLinkSignIn() {
  try {
    // Check if Firebase is available
    if (!firebase || !firebase.auth) {
      console.log('Firebase auth not available for magic link sign in');
      return;
    }
    
    // Use firebase.auth().isSignInWithEmailLink for compat
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
      let email = localStorage.getItem('emailForSignIn');
      if (!email) return showStatus('Enter email to verify link', true);
      showStatus('Verifying link…');
      auth.signInWithEmailLink(email, window.location.href)
        .then(res => {
          localStorage.removeItem('emailForSignIn');
          updateUIForLoggedInUser(res.user);
          showToast('Signed in!');
        })
        .catch(err => showStatus(err.message, true))
        .finally(() => clearStatus());
    }
  } catch (e) {
    console.error('Error in magic link sign in:', e);
  }
}

function logout() {
  if (auth) {
    auth.signOut().then(() => {
      console.log('Logged out');
    });
  }
}

// Export functions to the global scope
window.setupFirebase = setupFirebase;
window.handleMagicLinkSignIn = handleMagicLinkSignIn;
window.logout = logout;