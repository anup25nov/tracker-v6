import { motion } from "framer-motion";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase";
import { useTranslation } from "@/hooks/useTranslation";
import SSCLogo from "@/components/SSCLogo";
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError(null); // User cancelled, no error
      } else {
        setError(t("loginError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      {/* Decorative background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.07]"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: "hsl(var(--accent))" }}
        />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center w-full max-w-sm space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo & Branding */}
        <motion.div
          className="flex flex-col items-center space-y-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
            }}
          >
            <SSCLogo size={44} />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            SSC Exam Sathi
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {t("loginSubtitle")}
          </p>
        </motion.div>

        {/* Features highlights */}
        <motion.div
          className="w-full space-y-2.5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {[
            { emoji: "📊", text: t("loginFeature1") },
            { emoji: "🎯", text: t("loginFeature2") },
            { emoji: "🏆", text: t("loginFeature3") },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border"
            >
              <span className="text-lg">{item.emoji}</span>
              <span className="text-xs sm:text-sm text-foreground font-medium">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Login Button */}
        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-60 bg-card border border-border shadow-sm hover:shadow-md"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            ) : (
              <GoogleIcon />
            )}
            <span className="text-foreground">
              {loading ? t("loggingIn") : t("loginWithGoogle")}
            </span>
          </button>

          {error && (
            <motion.p
              className="text-xs text-center text-destructive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={onLoginSuccess}
            className="w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            {language === "hi" ? "अभी के लिए छोड़ें" : "Skip for now"}
          </button>
        </motion.div>

        {/* Terms note */}
        <motion.p
          className="text-[10px] text-muted-foreground text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          {t("loginTerms") || "By signing in, you agree to our Terms of Service and Privacy Policy."}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
