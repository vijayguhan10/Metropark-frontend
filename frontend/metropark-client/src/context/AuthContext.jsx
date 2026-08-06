import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'activeSession';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // backendUserId: the userId string assigned by the server (from POST /api/users response)
  const login = ({ email, name, backendUserId }) => {
    const sessionData = {
      user_id: backendUserId || email,   // prefer server-assigned id
      name: name || email.split('@')[0],
      email,
      membership: 'Standard Member',
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
    return sessionData;
  };

  // Login with phone number - expects backend response with user_id, name, email
  const loginWithPhone = (userData) => {
    const sessionData = {
      user_id: userData.user_id,
      name: userData.name,
      email: userData.email,
      membership: 'Standard Member',
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
    return sessionData;
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, loginWithPhone, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
