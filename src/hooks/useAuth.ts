import { useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials, SignupCredentials } from '@/types/game';
import api from '@/lib/api';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const user = await api.getCurrentUser();
      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = await api.login(credentials);
    if ('user' in result) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
    setState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: result.error };
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    const result = await api.signup(credentials);
    if ('user' in result) {
      setState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    }
    setState(prev => ({ ...prev, isLoading: false }));
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
  };
}
