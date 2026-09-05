import { createContext, useState } from 'react';
import type { ReactNode, FC } from 'react';


interface User {
  username: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  signIn: (token: string, username: string) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('@Estoque:user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('@Estoque:token') || null;
  });

  const signIn = (newToken: string, username: string) => {
    localStorage.setItem('@Estoque:token', newToken);
    localStorage.setItem('@Estoque:user', JSON.stringify({ username }));
    setToken(newToken);
    setUser({ username });
  };

  const signOut = () => {
    localStorage.removeItem('@Estoque:token');
    localStorage.removeItem('@Estoque:user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
