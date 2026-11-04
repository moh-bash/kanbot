import { createContext } from "react";
import type { User } from "../../types/api";

export interface AuthContextValue {
  isLoading: boolean;
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
