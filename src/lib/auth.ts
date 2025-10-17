// Authentication utilities
import { User } from './api';

const USER_KEY = 'healthsaas_user';

export const authStorage = {
  getUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },
  
  isAuthenticated: (): boolean => {
    return authStorage.getUser() !== null;
  },
};
