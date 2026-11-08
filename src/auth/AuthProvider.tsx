import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./AuthContext";
import type { User } from "@supabase/supabase-js";
import type { ProfileProps } from "@/types/profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileProps | null>(null);

  // Auth initialization and profile loading are independent.
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const authEventRef = useRef(0);

  // Initialize Supabase Auth.
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const eventVersion = authEventRef.current;

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!mounted) return;

        // Ignore stale initialization results.
        if (eventVersion !== authEventRef.current) return;

        if (error) {
          console.error("Failed to get user:", error);
          setUser(null);
        } else {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);

        if (mounted && eventVersion === authEventRef.current) {
          setUser(null);
        }
      } finally {
        if (mounted && eventVersion === authEventRef.current) {
          setAuthLoading(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      authEventRef.current += 1;

      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load profile independently from Auth initialization.
  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      setProfile(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!mounted) return;

        if (error) {
          console.error("Failed to load profile:", error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error("Profile loading failed:", error);

        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    return { error };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return { error };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    return { error };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,

        // loading now means Auth initialization only.
        loading: authLoading,

        profileLoading,

        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
