"use client";

import { useEffect, useCallback } from "react";
import { User } from "@/types/auth";
import { useAuthStore } from "@/store/authStore";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const { 
    user, 
    isLoading, 
    error, 
    setError, 
    login: storeLogin,
    loginWithGoogle: storeLoginWithGoogle,
    loginWithGitHub: storeLoginWithGitHub,
    register: storeRegister,
    logout: storeLogout,
    updateProfile: storeUpdateProfile,
    resetPassword: storeResetPassword,
    initializeAuth
  } = useAuthStore();

  const isAuthenticated = user !== null;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    await storeLogin(credentials.email, credentials.password);
  }, [storeLogin]);

  const loginWithGoogle = useCallback(async () => {
    await storeLoginWithGoogle();
  }, [storeLoginWithGoogle]);

  const loginWithGitHub = useCallback(async () => {
    await storeLoginWithGitHub();
  }, [storeLoginWithGitHub]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    await storeRegister(credentials.email, credentials.password, credentials.displayName);
  }, [storeRegister]);

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    await storeUpdateProfile(updates);
  }, [storeUpdateProfile]);

  const resetPassword = useCallback(async (email: string) => {
    await storeResetPassword(email);
  }, [storeResetPassword]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    loginWithGitHub,
    register,
    logout,
    updateProfile,
    resetPassword,
    clearError,
  };
}

// Hook for checking authentication status without triggering re-renders
export function useAuthStatus() {
  const { user, isLoading } = useAuthStore();
  return {
    isAuthenticated: user !== null,
    isLoading,
    user,
  };
}

// Hook for requiring authentication (redirects if not authenticated)
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  return {
    user,
    isLoading,
    shouldRedirect: !isLoading && !user,
  };
}
