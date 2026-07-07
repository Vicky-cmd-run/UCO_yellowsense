import { create } from 'zustand';

export type UserRole = 
  | 'ZRT_OFFICER'
  | 'RM'
  | 'VRM'
  | 'BRANCH_MANAGER'
  | 'REGIONAL_MANAGER'
  | 'HEAD_OFFICE'
  | 'ADMIN';

export interface DemoUser {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  role: UserRole;
  branch_id: string | null;
  region_id: string | null;
  status: string;
}

interface DemoState {
  activeUser: DemoUser | null;
  networkStatus: 'Online' | 'Slow' | 'Offline';
  pendingSyncCount: number;
  accessToken: string | null;
  
  setActiveUser: (user: DemoUser | null) => void;
  setNetworkStatus: (status: 'Online' | 'Slow' | 'Offline') => void;
  setPendingSyncCount: (count: number) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useDemoStore = create<DemoState>((set) => ({
  activeUser: null,
  networkStatus: 'Online',
  pendingSyncCount: 0,
  accessToken: null,
  
  setActiveUser: (user) => set({ activeUser: user }),
  setNetworkStatus: (status) => set({ networkStatus: status }),
  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ activeUser: null, accessToken: null })
}));
