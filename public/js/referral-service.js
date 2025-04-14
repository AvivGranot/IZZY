import { db } from './firebase-config.js';
import { REFERRAL_PROMPTS_TIERS, MAX_REFERRALS_REWARDED } from './config.js';

class ReferralService {
    constructor(state) {
        this.state = state;
    }

    async generateReferralCode() {
        if (!this.state.currentUser || !this.state.currentUserId) {
            throw new Error("User not authenticated");
        }

        const code = this.createUniqueCode();
        
        try {
            await db.ref(`referralCodes/${code}`).set({
                userId: this.state.currentUserId,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });

            await db.ref(`users/${this.state.currentUserId}/referralCode`).set(code);
            
            return code;
        } catch (error) {
            console.error("Error generating referral code:", error);
            throw error;
        }
    }

    createUniqueCode() {
        // Generate a unique 8-character code
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 5);
        return `${timestamp.slice(-5)}${randomStr}`.toUpperCase();
    }

    async processReferral(referralCode) {
        if (!this.state.currentUser || !this.state.currentUserId) {
            throw new Error("User not authenticated");
        }

        try {
            // Get referrer's user ID
            const referralSnapshot = await db.ref(`referralCodes/${referralCode}`).once('value');
            const referralData = referralSnapshot.val();

            if (!referralData || !referralData.userId) {
                throw new Error("Invalid referral code");
            }

            if (referralData.userId === this.state.currentUserId) {
                throw new Error("Cannot use own referral code");
            }

            // Check if user was already referred
            const userReferralSnapshot = await db.ref(`users/${this.state.currentUserId}/referredBy`).once('value');
            if (userReferralSnapshot.val()) {
                throw new Error("User already used a referral code");
            }

            // Get referrer's current referral count
            const referrerSnapshot = await db.ref(`users/${referralData.userId}`).once('value');
            const referrerData = referrerSnapshot.val() || {};
            const currentReferrals = referrerData.referralCount || 0;

            if (currentReferrals >= MAX_REFERRALS_REWARDED) {
                throw new Error("Referrer has reached maximum referrals");
            }

            // Calculate rewards based on current tier
            const rewardPrompts = this.calculateRewardPrompts(currentReferrals);

            // Update referrer's data
            await db.ref(`users/${referralData.userId}`).update({
                referralCount: currentReferrals + 1,
                promptsRemaining: (referrerData.promptsRemaining || 0) + rewardPrompts,
                totalReferralRewards: (referrerData.totalReferralRewards || 0) + rewardPrompts
            });

            // Update referred user's data
            await db.ref(`users/${this.state.currentUserId}`).update({
                referredBy: referralCode,
                referredAt: firebase.database.ServerValue.TIMESTAMP
            });

            return {
                success: true,
                rewardPrompts,
                message: `Successfully processed referral. Referrer earned ${rewardPrompts} prompts.`
            };
        } catch (error) {
            console.error("Error processing referral:", error);
            throw error;
        }
    }

    calculateRewardPrompts(currentReferrals) {
        for (const tier of REFERRAL_PROMPTS_TIERS) {
            if (currentReferrals < tier.maxReferrals) {
                return tier.promptReward;
            }
        }
        return 0;
    }

    async getReferralStats() {
        if (!this.state.currentUser || !this.state.currentUserId) {
            throw new Error("User not authenticated");
        }

        try {
            const snapshot = await db.ref(`users/${this.state.currentUserId}`).once('value');
            const userData = snapshot.val() || {};

            return {
                referralCode: userData.referralCode || null,
                referralCount: userData.referralCount || 0,
                totalReferralRewards: userData.totalReferralRewards || 0,
                referredBy: userData.referredBy || null,
                referredAt: userData.referredAt || null
            };
        } catch (error) {
            console.error("Error getting referral stats:", error);
            throw error;
        }
    }

    async getReferralLink() {
        let code = await this.getReferralStats().then(stats => stats.referralCode);
        
        if (!code) {
            code = await this.generateReferralCode();
        }

        return `${window.location.origin}?ref=${code}`;
    }
}

export default ReferralService; 