import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "@/types/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthCookieManager } from "@/lib/auth-utils";

// Helper function to convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || "",
  displayName: firebaseUser.displayName || "",
  photoURL: firebaseUser.photoURL || undefined,
  emailVerified: firebaseUser.emailVerified,
  createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
  lastLoginAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now()),
  preferences: {
    theme: "dark",
    currency: "USD",
    language: "en",
    notifications: {
      email: true,
      push: true,
      priceAlerts: true,
      portfolioUpdates: true,
      newsUpdates: false,
      marketUpdates: true,
    },
    privacy: {
      showPortfolio: false,
      showHoldings: false,
      analyticsOptIn: true,
    },
    display: {
      showTestnetData: false,
      compactMode: false,
      autoRefresh: true,
      refreshInterval: 30,
    },
  },
});

// Initialize auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isLoading: false,
        error: null,

        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),

        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });
            const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
            const user = convertFirebaseUser(userCredential.user);

            // Get Firebase ID token for middleware
            const idToken = await userCredential.user.getIdToken();

            // Set auth cookies for middleware
            AuthCookieManager.setAuthCookies(user, idToken);

            set({ user, isLoading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Login failed";
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        loginWithGoogle: async () => {
          try {
            set({ isLoading: true, error: null });
            const userCredential = await signInWithPopup(auth, googleProvider);
            const user = convertFirebaseUser(userCredential.user);

            // Get Firebase ID token for middleware
            const idToken = await userCredential.user.getIdToken();

            // Set auth cookies for middleware
            AuthCookieManager.setAuthCookies(user, idToken);

            set({ user, isLoading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Google login failed";
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        loginWithGitHub: async () => {
          try {
            set({ isLoading: true, error: null });
            const userCredential = await signInWithPopup(auth, githubProvider);
            const user = convertFirebaseUser(userCredential.user);

            // Get Firebase ID token for middleware
            const idToken = await userCredential.user.getIdToken();

            // Set auth cookies for middleware
            AuthCookieManager.setAuthCookies(user, idToken);

            set({ user, isLoading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "GitHub login failed";
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        logout: async () => {
          try {
            set({ isLoading: true });
            await signOut(auth);

            // Clear auth cookies
            AuthCookieManager.clearAuthCookies();

            set({ user: null, isLoading: false, error: null });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Logout failed",
              isLoading: false,
            });
            throw error;
          }
        },

        register: async (
          email: string,
          password: string,
          displayName: string
        ) => {
          try {
            set({ isLoading: true, error: null });
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

            // Update the user's display name
            await firebaseUpdateProfile(userCredential.user, { displayName });

            const user = convertFirebaseUser(userCredential.user);

            // Get Firebase ID token for middleware
            const idToken = await userCredential.user.getIdToken();

            // Set auth cookies for middleware
            AuthCookieManager.setAuthCookies(user, idToken);

            set({ user, isLoading: false });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Registration failed";
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        updateProfile: async (updates: Partial<User>) => {
          try {
            set({ isLoading: true, error: null });
            const { user } = get();
            if (!user) throw new Error("No user logged in");

            // Update Firebase profile if display name or photo URL changed
            if (auth.currentUser && (updates.displayName || updates.photoURL)) {
              await firebaseUpdateProfile(auth.currentUser, {
                displayName:
                  updates.displayName || auth.currentUser.displayName,
                photoURL: updates.photoURL || auth.currentUser.photoURL,
              });
            }

            // Update local user state
            const updatedUser = { ...user, ...updates };
            set({ user: updatedUser, isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Profile update failed",
              isLoading: false,
            });
            throw error;
          }
        },

        resetPassword: async (email: string) => {
          try {
            set({ isLoading: true, error: null });
            await sendPasswordResetEmail(auth, email);
            set({ isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Password reset failed",
              isLoading: false,
            });
            throw error;
          }
        },

        initializeAuth: async () => {
          return new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
              if (firebaseUser) {
                const user = convertFirebaseUser(firebaseUser);
                set({ user, isLoading: false });
              } else {
                set({ user: null, isLoading: false });
              }
              unsubscribe();
              resolve();
            });
          });
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: "auth-store" }
  )
);
