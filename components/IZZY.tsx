import React, { useState, useEffect } from 'react';
import ChatTab from './chat/ChatTab';
import { SubscriptionModal } from './subscription/SubscriptionModal';
import { usePromptCount } from '../hooks/usePromptCount';
import VoiceInputButton from './VoiceInputButton';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const IZZY = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { promptCount } = usePromptCount();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Voice input for up to 3 minutes
  const { startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => {
      setTranscript(text);
      setIsListening(false);
    },
    continuous: true
  });

  const handleStartListening = () => {
    startListening();
    setIsListening(true);
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
  };

  // Listen for subscription modal events
  useEffect(() => {
    const handleShowSubscription = () => {
      setShowSubscriptionModal(true);
    };

    window.addEventListener('showSubscription', handleShowSubscription);

    return () => {
      window.removeEventListener('showSubscription', handleShowSubscription);
    };
  }, []);

  return (
    <div className="izzy-container">
      {/* Header without subscription UI */}
      <header className="p-4 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">IZZY</h1>
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'chat' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            {/* Add more tabs as needed */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4">
        {activeTab === 'chat' && <ChatTab />}
        
        {/* Voice input display if not in chat */}
        {transcript && activeTab !== 'chat' && (
          <div className="voice-transcript mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Voice Input:</h3>
            <p>{transcript}</p>
          </div>
        )}

        {/* Prompt count display */}
        <div className="prompt-count mt-6 text-center">
          <p className="text-sm text-gray-600">
            You have <span className="font-bold">{promptCount}</span> free prompts remaining.
          </p>
        </div>

        {/* Referral Program section */}
        <div className="referral-program mt-10 p-6 bg-gray-50 rounded-xl text-center">
          <h2 className="text-xl font-bold mb-2">Share IZZY with Friends</h2>
          <p className="mb-4">Invite friends and get more free prompts!</p>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://wa.me/?text=Check%20out%20IZZY%20-%20the%20AI%20avatar%20for%20real%20conversations!%20https://izzy-app.com/?ref=yourcode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.722 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/sharer/sharer.php?u=https://izzy-app.com/?ref=yourcode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href="https://twitter.com/intent/tweet?text=Check%20out%20IZZY%20-%20the%20AI%20avatar%20for%20real%20conversations!&url=https://izzy-app.com/?ref=yourcode" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a 
              href="mailto:?subject=Check%20out%20IZZY%20-%20the%20AI%20avatar%20for%20real%20conversations!&body=I've%20been%20using%20IZZY%20to%20practice%20my%20conversation%20skills%20and%20thought%20you%20might%20like%20it%20too!%0A%0ACheck%20it%20out:%20https://izzy-app.com/?ref=yourcode" 
              className="bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default IZZY; 