import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'employee';
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  selectedDepartmentId: number | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setSelectedDepartment: (departmentId: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      selectedDepartmentId: null,
      isAuthenticated: false,
      login: (token: string, user: User) =>
        set({ token, user, isAuthenticated: true }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false, selectedDepartmentId: null }),
      setSelectedDepartment: (departmentId: number) =>
        set({ selectedDepartmentId: departmentId }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};
