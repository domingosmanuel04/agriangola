import { create } from "zustand";
import { api, clearToken, getToken, setToken } from "../lib/api";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  intent: string;
  organizationId?: string;
};

type AuthState = {
  user: SessionUser | null;
  ready: boolean;
  setSession: (token: string, user: SessionUser) => void;
  hydrate: () => Promise<void>;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  setSession: (token, user) => {
    setToken(token);
    set({ user });
  },
  hydrate: async () => {
    const token = getToken();
    if (!token) {
      set({ ready: true, user: null });
      return;
    }
    try {
      const me = await api.get<{
        id: string;
        email: string;
        name: string;
        intent: string;
        memberships?: { organizationId: string }[];
      }>("/auth/me");
      set({
        user: {
          id: me.id,
          email: me.email,
          name: me.name,
          intent: me.intent,
          organizationId: me.memberships?.[0]?.organizationId,
        },
        ready: true,
      });
    } catch {
      clearToken();
      set({ user: null, ready: true });
    }
  },
  logout: () => {
    clearToken();
    set({ user: null });
  },
}));
