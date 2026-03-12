import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Trash2,
  StopCircle,
  BookOpen,
  Brain,
  HelpCircle,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChatStream, ChatMessage, getRemainingChats } from "@/hooks/useChatStream";
import { useAppStore } from "@/store/useAppStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";

interface ChatScreenProps {
  onBack: () => void;
}

// Quick action chips
const quickActions = [
  { icon: Brain, label: "What are my weak areas?", labelHi: "मेरे कमज़ोर विषय कौन से हैं?" },
  { icon: BookOpen, label: "What should I study next?", labelHi: "मुझे आगे क्या पढ़ना चाहिए?" },
  { icon: HelpCircle, label: "Give me a quiz", labelHi: "मुझे एक क्विज़ दो" },
  { icon: Zap, label: "Study tips for my exam", labelHi: "मेरी परीक्षा के लिए टिप्स" },
];

/**
 * Extract suggested questions from AI response and return cleaned content + suggestions.
 * Looks for the pattern: 💡 **You can ask:** followed by numbered questions.
 */
function extractSuggestions(content: string): { cleanContent: string; suggestions: string[] } {
  const suggestions: string[] = [];
  
  // Match the suggestions block at the end
  const suggestionsRegex = /💡\s*\*{0,2}You can ask:?\*{0,2}[\s\S]*?(?:\n\s*\d+\.\s*.+)+/gi;
  const suggestionsRegexHi = /💡\s*\*{0,2}आप पूछ सकते हैं:?\*{0,2}[\s\S]*?(?:\n\s*\d+\.\s*.+)+/gi;
  
  let cleanContent = content;
  
  const match = content.match(suggestionsRegex) || content.match(suggestionsRegexHi);
  if (match) {
    const block = match[match.length - 1]; // Take last match
    cleanContent = content.replace(block, "").trim();
    
    // Extract individual questions
    const questionRegex = /\d+\.\s*(.+)/g;
    let qMatch;
    while ((qMatch = questionRegex.exec(block)) !== null) {
      const q = qMatch[1].trim().replace(/^\*+|\*+$/g, "").replace(/^[""]|[""]$/g, "").trim();
      if (q.length > 5) suggestions.push(q);
    }
  }
  
  return { cleanContent, suggestions };
}

// Memoized message bubble
const MessageBubble = memo(({ message, isLast, onSuggestionClick }: { 
  message: ChatMessage; 
  isLast: boolean;
  onSuggestionClick: (text: string) => void;
}) => {
  const isUser = message.role === "user";
  const { cleanContent, suggestions } = useMemo(
    () => isUser ? { cleanContent: message.content, suggestions: [] } : extractSuggestions(message.content),
    [message.content, isUser]
  );

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center mr-2 mt-1 shrink-0">
            <Sparkles size={14} className="text-primary" />
          </div>
        )}
        <div
          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : cleanContent ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-foreground">
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex gap-1 py-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Suggested questions as clickable chips - only on last assistant message */}
      {!isUser && isLast && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-1.5 ml-9"
        >
          {suggestions.map((q, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              onClick={() => onSuggestionClick(q)}
              className="text-left text-xs px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-foreground hover:bg-primary/20 active:scale-[0.98] transition-all max-w-[85%]"
            >
              <span className="text-primary mr-1">💡</span> {q}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

const ChatScreen = ({ onBack }: ChatScreenProps) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const syllabus = useAppStore((s) => s.syllabus);
  const selectedExamId = useAppStore((s) => s.selectedExamId);
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress);
  const getSubjectUnits = useAppStore((s) => s.getSubjectUnits);
  const getOverallProgress = useAppStore((s) => s.getOverallProgress);

  const { messages, isStreaming, error, sendMessage, clearChat, stopStreaming } = useChatStream();
  const remaining = getRemainingChats();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Build user context from store
  const buildContext = useCallback(() => {
    const overall = getOverallProgress();
    const subjects = syllabus.map((s) => {
      const units = getSubjectUnits(s.id);
      const percent = getSubjectProgress(s.id);
      const incompletTopics: string[] = [];
      for (const topic of s.topics) {
        if (topic.subtopics?.length) {
          if (topic.subtopics.some((st) => !st.completed)) {
            incompletTopics.push(language === "hi" ? topic.nameHi : topic.name);
          }
        } else if (!topic.completed) {
          incompletTopics.push(language === "hi" ? topic.nameHi : topic.name);
        }
      }
      return {
        name: language === "hi" ? s.nameHi : s.name,
        percent,
        completed: units.completed,
        total: units.total,
        incompletTopics,
      };
    });

    return {
      userName: user?.displayName || "Student",
      examName: selectedExamId || "Unknown",
      overallPercent: overall.percent,
      subjects,
      language,
    };
  }, [syllabus, selectedExamId, getSubjectProgress, getSubjectUnits, getOverallProgress, language, user]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed, buildContext());
  }, [input, isStreaming, sendMessage, buildContext]);

  const handleSuggestionClick = useCallback(
    (text: string) => {
      if (isStreaming) return;
      sendMessage(text, buildContext());
    },
    [isStreaming, sendMessage, buildContext]
  );

  const handleQuickAction = useCallback(
    (action: (typeof quickActions)[0]) => {
      const text = language === "hi" ? action.labelHi : action.label;
      sendMessage(text, buildContext());
    },
    [language, sendMessage, buildContext]
  );

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-background max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">StudyBuddy AI</h1>
            <p className="text-[10px] text-muted-foreground">
              {isStreaming ? (language === "hi" ? "टाइप कर रहा है..." : "Typing...") : `${remaining} ${language === "hi" ? "चैट बाकी" : "chats left today"}`}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-5"
          >
            {/* Hero */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Sparkles size={36} className="text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center">
                <Zap size={12} className="text-success-foreground" />
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-bold text-foreground">
                {language === "hi" ? "नमस्ते! 👋" : "Hey there! 👋"}
              </h2>
              <p className="text-xs text-muted-foreground max-w-[250px]">
                {language === "hi"
                  ? "मैं आपका AI स्टडी पार्टनर हूँ। पूछिए कुछ भी!"
                  : "I'm your AI study partner. Ask me anything about your preparation!"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm px-2">
              {quickActions.map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-left active:scale-[0.97] transition-transform"
                >
                  <action.icon size={16} className="text-primary shrink-0" />
                  <span className="text-[11px] font-medium text-foreground leading-tight">
                    {language === "hi" ? action.labelHi : action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={idx === messages.length - 1 && !isStreaming}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
          </AnimatePresence>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-[80%] text-center text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
          >
            {error}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-border bg-card/50 backdrop-blur-sm safe-bottom">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={language === "hi" ? "कुछ पूछें..." : "Ask anything..."}
            className="flex-1 h-10 px-4 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center active:scale-95 transition-transform"
            >
              <StopCircle size={20} className="text-destructive" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
            >
              <Send size={18} className="text-primary-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
