import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthChange, handleRedirectResult } from "@/lib/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      // Process redirect result first (required after Google redirect sign-in)
      try {
        await handleRedirectResult();
      } catch (e) {
        console.error("Redirect result error:", e);
      }
      if (cancelled) return;
      unsubscribe = onAuthChange((firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
    };

    init();
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { user, loading };
};
