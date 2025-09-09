import { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          try {
            // Primeiro tenta usar os dados salvos
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            
            // Depois tenta validar com a API (opcional)
            try {
              const validatedUserData = await getUserProfile();
              if (validatedUserData.data && validatedUserData.data.success) {
                setUser(validatedUserData.data.user);
              }
            } catch (apiError) {
              // Se falhar na validação da API, mantém os dados locais
              console.warn('API validation failed, using cached user data:', apiError);
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    // Redirecionar para login
    window.location.href = '/login';
  };

  const value = {
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
