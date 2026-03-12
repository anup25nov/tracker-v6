import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth, handleRedirectResult } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 1. Set up auth state listener FIRST (recommended by Firebase)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (cancelled) return;
      setUser(firebaseUser);
      setLoading(false);
    });

    // 2. Process any pending redirect result (web only, no-op on native)
    handleRedirectResult().catch((e) => {
      console.error("Redirect result error:", e);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { user, loading };
};
