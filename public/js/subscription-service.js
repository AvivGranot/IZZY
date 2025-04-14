import { db } from './firebase-config.js';
import { SUBSCRIPTION_PLANS } from './config.js';

class SubscriptionService {
    constructor(state) {
        this.state = state;
    }

    async subscribe(plan) {
        if (!this.state.currentUser || !this.state.currentUserId) {
            throw new Error("User not authenticated");
        }

        if (!SUBSCRIPTION_PLANS[plan]) {
            throw new Error("Invalid subscription plan");
        }

        try {
            // Simulate payment processing
            await this.simulatePayment(plan);

            // Update user subscription status
            const subscriptionData = {
                isSubscribed: true,
                subscriptionPlan: plan,
                subscriptionStartDate: firebase.database.ServerValue.TIMESTAMP,
                subscriptionEndDate: this.calculateEndDate(plan),
                lastPaymentDate: firebase.database.ServerValue.TIMESTAMP,
                nextPaymentDate: this.calculateNextPaymentDate(plan)
            };

            await this.updateUserSubscription(subscriptionData);
            
            // Update local state
            Object.assign(this.state, {
                isSubscribed: true,
                subscriptionPlan: plan,
                ...subscriptionData
            });

            return {
                success: true,
                plan: plan,
                message: `Successfully subscribed to ${plan} plan`
            };
        } catch (error) {
            console.error("Subscription error:", error);
            throw error;
        }
    }

    async simulatePayment(plan) {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate success (in real implementation, this would integrate with a payment provider)
        return {
            success: true,
            transactionId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount: SUBSCRIPTION_PLANS[plan].price,
            currency: 'USD'
        };
    }

    calculateEndDate(plan) {
        const now = new Date();
        switch(plan) {
            case 'monthly':
                return new Date(now.setMonth(now.getMonth() + 1)).getTime();
            case 'annual':
                return new Date(now.setFullYear(now.getFullYear() + 1)).getTime();
            default:
                throw new Error("Invalid plan for end date calculation");
        }
    }

    calculateNextPaymentDate(plan) {
        const now = new Date();
        switch(plan) {
            case 'monthly':
                return new Date(now.setMonth(now.getMonth() + 1)).getTime();
            case 'annual':
                return new Date(now.setFullYear(now.getFullYear() + 1)).getTime();
            default:
                throw new Error("Invalid plan for payment date calculation");
        }
    }

    async updateUserSubscription(subscriptionData) {
        return db.ref(`users/${this.state.currentUserId}`).update(subscriptionData);
    }

    async cancelSubscription() {
        if (!this.state.currentUser || !this.state.currentUserId) {
            throw new Error("User not authenticated");
        }

        if (!this.state.isSubscribed) {
            throw new Error("No active subscription to cancel");
        }

        try {
            const cancellationData = {
                isSubscribed: false,
                subscriptionPlan: null,
                cancellationDate: firebase.database.ServerValue.TIMESTAMP,
                // Keep the end date as is to allow access until current period ends
            };

            await this.updateUserSubscription(cancellationData);
            
            // Update local state
            Object.assign(this.state, {
                isSubscribed: false,
                subscriptionPlan: null,
                ...cancellationData
            });

            return {
                success: true,
                message: "Subscription successfully cancelled"
            };
        } catch (error) {
            console.error("Cancellation error:", error);
            throw error;
        }
    }

    async checkSubscriptionStatus() {
        if (!this.state.currentUser || !this.state.currentUserId) {
            return { isSubscribed: false };
        }

        try {
            const snapshot = await db.ref(`users/${this.state.currentUserId}`).once('value');
            const userData = snapshot.val();

            if (!userData) return { isSubscribed: false };

            const now = Date.now();
            const isExpired = userData.subscriptionEndDate && userData.subscriptionEndDate < now;

            if (isExpired && userData.isSubscribed) {
                // Subscription has expired, update status
                await this.updateUserSubscription({
                    isSubscribed: false,
                    subscriptionPlan: null
                });
                return { isSubscribed: false };
            }

            return {
                isSubscribed: userData.isSubscribed,
                plan: userData.subscriptionPlan,
                endDate: userData.subscriptionEndDate,
                nextPaymentDate: userData.nextPaymentDate
            };
        } catch (error) {
            console.error("Error checking subscription status:", error);
            throw error;
        }
    }
}

export default SubscriptionService; 