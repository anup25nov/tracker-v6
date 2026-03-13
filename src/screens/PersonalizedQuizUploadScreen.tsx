import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, FileText, Image, StickyNote, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { savePersonalizedQuiz, getRemainingUploads, type PersonalizedQuizQuestion } from "@/lib/personalizedQuiz";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onQuizGenerated: () => void;
}

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`;

const PersonalizedQuizUploadScreen = ({ onBack, onQuizGenerated }: Props) => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [textNotes, setTextNotes] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [numQuestions, setNumQuestions] = useState(10);
  const [quizType, setQuizType] = useState<"mcq" | "short" | "mixed">("mcq");
  const [generating, setGenerating] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isHi = language === "hi";

  // Load remaining uploads
  useState(() => {
    if (user?.uid) {
      getRemainingUploads(user.uid).then(setRemaining);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain"];
    if (!validTypes.includes(f.type) && !f.name.match(/\.(pdf|png|jpg|jpeg|webp|txt|md)$/i)) {
      setError(isHi ? "कृपया PDF, इमेज या टेक्स्ट फ़ाइल चुनें" : "Please select a PDF, image, or text file");
      return;
    }

    // Max 5MB
    if (f.size > 15 * 1024 * 1024) {
      setError(isHi ? "फ़ाइल 5MB से छोटी होनी चाहिए" : "File must be under 5MB");
      return;
    }

    setFile(f);
    setError(null);
  };

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  };

  const handleGenerate = async () => {
    if (!user?.uid) {
      toast.error(isHi ? "कृपया पहले लॉगिन करें" : "Please login first");
      return;
    }

    if (remaining !== null && remaining <= 0) {
      setError(isHi ? "अपलोड सीमा पूरी हो गई (5 max)। पुराना क्विज़ डिलीट करें।" : "Upload limit reached (5 max). Delete an old quiz.");
      return;
    }

    if (inputMode === "file" && !file) {
      setError(isHi ? "कृपया एक फ़ाइल चुनें" : "Please select a file");
      return;
    }

    if (inputMode === "text" && textNotes.trim().length < 50) {
      setError(isHi ? "कम से कम 50 अक्षर लिखें" : "Please enter at least 50 characters");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      let fileBase64: string;
      let fileName: string;
      let fileType: string;

      if (inputMode === "file" && file) {
        fileBase64 = await fileToBase64(file);
        fileName = file.name;
        fileType = file.type;
      } else {
        fileBase64 = btoa(unescape(encodeURIComponent(textNotes)));
        fileName = "notes.txt";
        fileType = "text/plain";
      }

      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          fileBase64,
          fileName,
          fileType,
          numQuestions,
          quizType,
          language,
        }),
      });

      if (!resp.ok) {
        const contentType = resp.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const errData = await resp.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${resp.status}`);
        }
        throw new Error(
          resp.status === 404
            ? (isHi ? "Quiz API उपलब्ध नहीं है। कृपया बाद में प्रयास करें।" : "Quiz API not available. Please ensure the edge function is deployed.")
            : `Server error ${resp.status}`
        );
      }

      const quizData = await resp.json();

      // Save to Firestore
      await savePersonalizedQuiz(
        user.uid,
        quizData.title || fileName.replace(/\.[^.]+$/, ""),
        fileName,
        quizType,
        quizData.questions as PersonalizedQuizQuestion[]
      );

      toast.success(isHi ? "क्विज़ बन गई! 🎉" : "Quiz generated! 🎉");
      onQuizGenerated();
    } catch (e: any) {
      let msg: string;
      if (e?.message === "Failed to fetch" || e?.name === "TypeError") {
        msg = isHi
          ? "सर्वर से कनेक्ट नहीं हो पाया। कृपया इंटरनेट कनेक्शन जांचें या बाद में प्रयास करें।"
          : "Could not connect to the server. Please check your internet connection or try again later.";
      } else {
        msg = e?.message || (isHi ? "क्विज़ बनाने में त्रुटि" : "Failed to generate quiz");
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const questionOptions = [5, 10, 15, 20];
  const typeOptions: { value: "mcq" | "short" | "mixed"; label: string; labelHi: string }[] = [
    { value: "mcq", label: "MCQ", labelHi: "MCQ" },
    { value: "short", label: "Short Answer", labelHi: "लघु उत्तर" },
    { value: "mixed", label: "Mixed", labelHi: "मिश्रित" },
  ];

  const getFileIcon = () => {
    if (!file) return <Upload size={28} className="text-muted-foreground" />;
    if (file.type.startsWith("image/")) return <Image size={28} className="text-primary" />;
    return <FileText size={28} className="text-primary" />;
  };

  return (
    <div className="min-h-screen px-3 sm:px-4 pt-6 sm:pt-8 pb-8 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary active:scale-90 transition-transform">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-foreground">
            {isHi ? "पर्सनलाइज़्ड क्विज़ बनाएं" : "Create Personalized Quiz"}
          </h1>
          <p className="text-[10px] text-muted-foreground">
            {remaining !== null
              ? (isHi ? `${remaining}/5 अपलोड शेष` : `${remaining}/5 uploads remaining`)
              : ""}
          </p>
        </div>
        <Sparkles size={20} className="text-primary" />
      </motion.div>

      {/* Input Mode Toggle */}
      <motion.div
        className="flex gap-2 p-1 rounded-xl bg-secondary"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <button
          onClick={() => setInputMode("file")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            inputMode === "file"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          📄 {isHi ? "फ़ाइल अपलोड" : "Upload File"}
        </button>
        <button
          onClick={() => setInputMode("text")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
            inputMode === "text"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          ✍️ {isHi ? "नोट्स लिखें" : "Type Notes"}
        </button>
      </motion.div>

      {/* File Upload / Text Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {inputMode === "file" ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 p-8 flex flex-col items-center gap-3 transition-colors bg-card active:scale-[0.98]"
          >
            {getFileIcon()}
            {file ? (
              <>
                <p className="text-sm font-semibold text-foreground truncate max-w-full">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(file.size / 1024).toFixed(0)} KB • {isHi ? "बदलने के लिए टैप करें" : "Tap to change"}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  {isHi ? "PDF, इमेज या टेक्स्ट फ़ाइल चुनें" : "Select PDF, Image or Text file"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isHi ? "अधिकतम 5MB" : "Max 5MB"}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,application/pdf,image/*,text/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={textNotes}
              onChange={(e) => setTextNotes(e.target.value)}
              placeholder={isHi ? "अपने स्टडी नोट्स यहाँ पेस्ट या टाइप करें..." : "Paste or type your study notes here..."}
              className="w-full h-40 rounded-2xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {textNotes.length} {isHi ? "अक्षर" : "chars"} {textNotes.length < 50 && `(${isHi ? "न्यूनतम 50" : "min 50"})`}
            </p>
          </div>
        )}
      </motion.div>

      {/* Quiz Options */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Number of questions */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            {isHi ? "प्रश्नों की संख्या" : "Number of Questions"}
          </label>
          <div className="flex gap-2">
            {questionOptions.map((n) => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  numQuestions === n
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            {isHi ? "क्विज़ का प्रकार" : "Quiz Type"}
          </label>
          <div className="flex gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuizType(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  quizType === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {isHi ? opt.labelHi : opt.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={generating || (inputMode === "file" ? !file : textNotes.trim().length < 50)}
        className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {generating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {isHi ? "AI क्विज़ बना रही है..." : "AI is generating quiz..."}
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {isHi ? "क्विज़ बनाएं" : "Generate Quiz"}
          </>
        )}
      </motion.button>

      {/* Info */}
      <motion.div
        className="p-3 rounded-xl bg-primary/5 border border-primary/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          💡 {isHi
            ? "AI आपकी स्टडी मटीरियल पढ़कर पर्सनलाइज़्ड क्विज़ बनाएगी। प्रत्येक यूज़र अधिकतम 5 क्विज़ बना सकता है।"
            : "AI will read your study material and generate a personalized quiz. Each user can create up to 5 quizzes."}
        </p>
      </motion.div>
    </div>
  );
};

export default PersonalizedQuizUploadScreen;
