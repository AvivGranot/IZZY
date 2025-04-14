import { db } from './firebase-config.js';

class ChatService {
    constructor(state) {
        this.state = state;
    }

    async sendMessage(messageText) {
        if (!messageText?.trim()) return;

        if (!this.state.currentUser || !this.state.currentUserId) {
            throw new Error("User not authenticated");
        }

        if (!this.state.isSubscribed && this.state.promptsLeft <= 0) {
            throw new Error("No prompts remaining");
        }

        try {
            // Create new conversation if needed
            if (!this.state.currentConversationId) {
                this.state.currentConversationId = db.ref(`chats/${this.state.currentUserId}`).push().key;
                await this.updateUserData(this.state.currentUserId, {
                    currentConversationId: this.state.currentConversationId,
                    conversations: firebase.database.ServerValue.increment(1)
                });
            }

            // Save user message
            await this.saveMessage(messageText, 'user');

            // Get AI response
            const aiResponse = await this.getAIResponse(messageText);
            await this.saveMessage(aiResponse, 'assistant');

            // Update prompts if not subscribed
            if (!this.state.isSubscribed) {
                await this.decrementPrompts();
            }

            return {
                userMessage: messageText,
                aiResponse: aiResponse
            };
        } catch (error) {
            console.error("Error in message flow:", error);
            throw error;
        }
    }

    async saveMessage(text, sender) {
        if (!this.state.currentUserId || !this.state.currentConversationId) {
            throw new Error("Missing user or conversation ID");
        }

        const chatRef = db.ref(`chats/${this.state.currentUserId}/${this.state.currentConversationId}`);
        const newMessageRef = chatRef.push();
        
        const messageData = {
            text: text,
            sender: sender,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        await newMessageRef.set(messageData);

        // Update local storage backup
        const localChat = JSON.parse(localStorage.getItem('izzy_chat_history') || '[]');
        localChat.push({ text, sender });
        localStorage.setItem('izzy_chat_history', JSON.stringify(localChat));
    }

    async getAIResponse(userMessage) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const responses = [
            "That's interesting! Tell me more.",
            "I understand. How did that make you feel?",
            "What do you think led to that situation?",
            "That's a good point. Can you elaborate?",
            "I see. What would you like to explore about that?",
            "How do you think you might handle that differently next time?",
            "That sounds challenging. What support do you need?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    async decrementPrompts() {
        const result = await db.ref(`users/${this.state.currentUserId}`).transaction(userData => {
            if (userData) {
                userData.promptsLeft = Math.max(0, (userData.promptsLeft || 0) - 1);
                userData.promptsUsed = (userData.promptsUsed || 0) + 1;
            }
            return userData;
        });

        if (result.committed) {
            this.state.promptsLeft = result.snapshot.val().promptsLeft;
            this.state.promptsUsed = result.snapshot.val().promptsUsed;
            localStorage.setItem('izzy_prompts_left', this.state.promptsLeft);
            return {
                promptsLeft: this.state.promptsLeft,
                promptsUsed: this.state.promptsUsed
            };
        }

        throw new Error("Failed to update prompts");
    }

    async loadChatHistory() {
        if (!this.state.currentUserId || !this.state.currentConversationId) {
            return [];
        }

        const chatRef = db.ref(`chats/${this.state.currentUserId}/${this.state.currentConversationId}`);
        const snapshot = await chatRef.orderByChild('timestamp').once('value');
        
        const messages = [];
        snapshot.forEach(childSnapshot => {
            messages.push(childSnapshot.val());
        });

        return messages;
    }

    async startNewConversation() {
        if (!this.state.currentUserId) {
            throw new Error("User not authenticated");
        }

        const newConversationId = db.ref(`chats/${this.state.currentUserId}`).push().key;
        
        await this.updateUserData(this.state.currentUserId, {
            currentConversationId: newConversationId,
            conversations: firebase.database.ServerValue.increment(1)
        });

        this.state.currentConversationId = newConversationId;
        localStorage.removeItem('izzy_chat_history');
        
        return newConversationId;
    }

    async updateUserData(userId, data) {
        return db.ref(`users/${userId}`).update(data);
    }
}

export default ChatService; 