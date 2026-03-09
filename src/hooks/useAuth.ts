import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthChange, handleRedirectResult } from "@/lib/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result first (for iframe sign-in)
    handleRedirectResult().catch(console.error);

    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};
