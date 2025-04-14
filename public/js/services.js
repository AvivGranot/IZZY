import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, sendSignInLinkToEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { USER_ROLES, PROMPT_LIMITS, ANALYTICS_EVENTS } from './config.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlmM-6P2WHj59R5FAvFy6ZjIDA637f7p4",
    authDomain: "izzy-auth.firebaseapp.com",
    projectId: "izzy-auth",
    storageBucket: "izzy-auth.appspot.com",
    messagingSenderId: "573135779043",
    appId: "1:573135779043:web:f6c59473f9956c917041d6",
    measurementId: "G-8JLKB2MMKS",
    databaseURL: "https://izzy-auth-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User Service
class UserService {
    static async initializeNewUser(user) {
        const userRef = doc(db, 'users', user.uid);
        const userData = {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: USER_ROLES.FREE,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            promptsUsed: {
                daily: 0,
                total: 0,
                lastResetDate: new Date().toISOString()
            },
            subscription: {
                type: 'NONE',
                startDate: null,
                endDate: null,
                autoRenew: false
            },
            referrals: {
                code: this.generateReferralCode(),
                referred: [],
                referredBy: null,
                rewardsEarned: 0
            },
            settings: {
                language: 'en',
                notifications: true,
                theme: 'light'
            },
            analytics: {
                totalSessions: 1,
                averageSessionDuration: 0,
                lastSessionDate: new Date().toISOString()
            }
        };

        await setDoc(userRef, userData);
        return userData;
    }

    static async getUserData(uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() : null;
    }

    static async updateUserData(uid, data) {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data);
    }

    static generateReferralCode() {
        return 'IZZY' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    static async resetDailyPrompts(uid) {
        const userData = await this.getUserData(uid);
        if (!userData) return;

        const lastReset = new Date(userData.promptsUsed.lastResetDate);
        const now = new Date();
        
        if (lastReset.getDate() !== now.getDate()) {
            await this.updateUserData(uid, {
                'promptsUsed.daily': 0,
                'promptsUsed.lastResetDate': now.toISOString()
            });
        }
    }

    static async canUsePrompt(uid) {
        const userData = await this.getUserData(uid);
        if (!userData) return false;

        await this.resetDailyPrompts(uid);
        
        const limits = PROMPT_LIMITS[userData.role.toUpperCase()];
        return userData.promptsUsed.daily < limits.daily && 
               userData.promptsUsed.total < limits.total;
    }
}

// Authentication Service
class AuthService {
    static async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const userData = await UserService.getUserData(user.uid);
            if (!userData) {
                await UserService.initializeNewUser(user);
            }
            
            return { success: true, user };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    static async sendMagicLink(email) {
        try {
            const actionCodeSettings = {
                url: window.location.href,
                handleCodeInApp: true
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            return { success: true };
        } catch (error) {
            console.error('Magic link error:', error);
            return { success: false, error: error.message };
        }
    }

    static async signOut() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }
}

export { UserService, AuthService }; 