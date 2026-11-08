import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./AuthContext";
import type { User } from "@supabase/supabase-js";
import type { ProfileProps } from "@/types/profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [loading, setLoading] = useState(true);

  // Track Auth events to prevent stale initialization results.
  const authEventRef = useRef(0);

  // Initialize Auth and listen for changes.
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      const eventVersion = authEventRef.current;

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

      setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      authEventRef.current += 1;

      setUser(session?.user ?? null);
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load profile whenever the authenticated user changes.
  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setProfile(null);

      const currentUserId = user.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .single();

      if (!mounted) return;

      // Prevent stale profile data from being displayed.
      if (error) {
        console.error("Failed to load profile:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setLoading(false);
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
      value={{ user, profile, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
