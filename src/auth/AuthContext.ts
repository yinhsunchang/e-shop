import { createContext } from "react";
import type { User, AuthError } from "@supabase/supabase-js";
import type { ProfileProps } from "@/types/profile";

export interface AuthResult {
  error: AuthError | null;
}

export interface AuthContext {
  user: User | null;
  profile: ProfileProps | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContext | undefined>(undefined);
