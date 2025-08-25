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
            
            // Só faz request ao servidor se necessário (opcional)
            // Para melhor performance, removemos a validação automática
          } catch (parseError) {
            console.error('Erro ao fazer parse dos dados do usuário:', parseError);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Só remove token em caso de erro crítico
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
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
