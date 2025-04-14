// System Constants
const SYSTEM = {
    VERSION: '1.0.0',
    NAME: 'IZZY',
    SUPPORT_PHONE: '+1 (555) 123-4567' // Replace with actual support number
};

// User Roles and Permissions
const USER_ROLES = {
    FREE: 'free',
    PREMIUM: 'premium',
    ADMIN: 'admin'
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
    MONTHLY: {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 30,
        interval: 'month',
        features: ['Unlimited prompts', 'Voice input/output', 'Premium templates']
    },
    ANNUAL_MONTHLY: {
        id: 'annual_monthly',
        name: 'Annual Plan (Monthly Billing)',
        price: 20,
        interval: 'month',
        billingPeriod: 'year',
        features: ['All monthly features', 'Save $120/year', 'Priority support']
    },
    ANNUAL_UPFRONT: {
        id: 'annual_upfront',
        name: 'Annual Plan (Upfront)',
        price: 200,
        interval: 'year',
        savings: 40,
        features: ['All monthly features', 'Save $160/year', 'Priority support']
    }
};

// Prompt Limits
const PROMPT_LIMITS = {
    FREE: {
        daily: 3,
        total: 3
    },
    PREMIUM: {
        daily: Infinity,
        total: Infinity
    }
};

// Referral System
const REFERRAL_SYSTEM = {
    rewards: {
        ONE_REFERRAL: 5,
        TWO_REFERRALS: 10,
        THREE_REFERRALS: 15
    },
    limits: {
        MAX_DAILY_REFERRALS: 3,
        MAX_TOTAL_REFERRALS: Infinity
    },
    prefix: 'IZZY'
};

// Analytics Events
const ANALYTICS_EVENTS = {
    USER_REGISTERED: 'user_registered',
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    PROMPT_USED: 'prompt_used',
    REFERRAL_COMPLETED: 'referral_completed',
    FEEDBACK_SUBMITTED: 'feedback_submitted'
};

// Email Templates
const EMAIL_TEMPLATES = {
    WELCOME: 'welcome_email',
    PROMPT_LIMIT: 'prompt_limit_notification',
    REFERRAL_REWARD: 'referral_reward_notification',
    SUBSCRIPTION_CONFIRMATION: 'subscription_confirmation',
    CANCELLATION_CONFIRMATION: 'cancellation_confirmation'
};

// Cache Settings
const CACHE_CONFIG = {
    version: 1,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    prefix: 'izzy_cache_'
};

// Export all configurations
export {
    SYSTEM,
    USER_ROLES,
    SUBSCRIPTION_PLANS,
    PROMPT_LIMITS,
    REFERRAL_SYSTEM,
    ANALYTICS_EVENTS,
    EMAIL_TEMPLATES,
    CACHE_CONFIG
}; 