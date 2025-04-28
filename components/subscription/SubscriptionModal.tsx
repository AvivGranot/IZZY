import React, { useState, useEffect } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
            </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Upgrade Your Plan</h2>
          <p className="text-gray-600">You've used all your free prompts. Subscribe to continue chatting with IZZY!</p>
        </div>

        <div className="space-y-4 mb-6">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'monthly' 
                ? 'border-purple-500 bg-purple-50 shadow-sm' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  selectedPlan === 'monthly' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                } mr-3 flex items-center justify-center`}>
                  {selectedPlan === 'monthly' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <h3 className="font-semibold">Monthly Plan</h3>
              </div>
              <span className="font-bold">$9.99/month</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-8">Cancel anytime</p>
          </div>

          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
              selectedPlan === 'annual' 
                ? 'border-purple-500 bg-purple-50 shadow-sm' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className="absolute -top-2 right-4 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
              BEST VALUE
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  selectedPlan === 'annual' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                } mr-3 flex items-center justify-center`}>
                  {selectedPlan === 'annual' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <h3 className="font-semibold">Annual Plan</h3>
              </div>
              <span className="font-bold">$99.99/year</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-8">Save $20 (2 months free)</p>
          </div>
        </div>

        <button 
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
          onClick={() => {
            // In a real app, this would redirect to payment processing
            alert(`Subscribing to ${selectedPlan} plan`);
          }}
        >
          Subscribe Now
        </button>
        
        <button 
          className="w-full text-center mt-4 text-sm text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
};