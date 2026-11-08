import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/auth/useAuth";
import type { ProfileProps } from "@/types/profile";

export default function useProfile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(
    async (signal?: AbortSignal) => {
      if (!user) {
        setProfile(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .abortSignal(signal ?? new AbortController().signal)
          .single();

        if (error) throw error;

        setProfile(data);
      } catch (error) {
        // Ignore aborted requests
        if (signal?.aborted) return;

        console.error("Fetch profile failed:", error);
        setProfile(null);
        setError(t("account.profileError"));
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [user, t]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchProfile(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}
