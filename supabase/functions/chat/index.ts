import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a rich system prompt with user's actual progress data
    const systemPrompt = buildSystemPrompt(userContext);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface SubjectProgress {
  name: string;
  percent: number;
  completed: number;
  total: number;
  incompletTopics: string[];
}

interface UserContext {
  userName?: string;
  examName?: string;
  overallPercent?: number;
  subjects?: SubjectProgress[];
  language?: string;
}

function buildSystemPrompt(ctx?: UserContext): string {
  const lang = ctx?.language === "hi" ? "Hindi" : "English";

  let progressBlock = "";
  if (ctx?.subjects && ctx.subjects.length > 0) {
    const weakest = [...ctx.subjects].sort((a, b) => a.percent - b.percent);
    const strongest = [...ctx.subjects].sort((a, b) => b.percent - a.percent);

    progressBlock = `
## User's Current Progress
- **Exam**: ${ctx.examName || "Unknown"}
- **Overall**: ${ctx.overallPercent ?? 0}% complete
- **Weakest subjects**: ${weakest.slice(0, 3).map((s) => `${s.name} (${s.percent}%)`).join(", ")}
- **Strongest subjects**: ${strongest.slice(0, 2).map((s) => `${s.name} (${s.percent}%)`).join(", ")}

### Subject Details:
${ctx.subjects.map((s) => `- **${s.name}**: ${s.completed}/${s.total} topics done (${s.percent}%)${s.incompletTopics.length > 0 ? `\n  Incomplete: ${s.incompletTopics.slice(0, 8).join(", ")}${s.incompletTopics.length > 8 ? "..." : ""}` : " ✅ All done!"}`).join("\n")}
`;
  }

  return `You are **StudyBuddy**, a friendly and encouraging AI study assistant for Indian competitive exam preparation (SSC, Railway, Bank exams).

## Your Personality
- Warm, motivating, and supportive like a helpful senior/mentor
- Use simple language, occasional emojis for encouragement
- Be concise but thorough
- Respond in ${lang}

${progressBlock}

## Your Capabilities
1. **Study Advice**: Analyze the user's progress and recommend what to study next. Prioritize weak subjects.
2. **Weak Area Analysis**: Identify and explain which topics need more attention based on completion data.
3. **Strong Area Recognition**: Celebrate completed topics and motivate the user.
4. **Quiz Generation**: When asked for a quiz, generate 5 MCQ questions on the requested topic. Format each question as:
   
   **Q1.** Question text
   - A) Option A
   - B) Option B  
   - C) Option C
   - D) Option D
   
   After all questions, provide **Answers** with brief explanations.

5. **Study Tips**: Share exam-specific strategies, time management tips, and revision techniques.
6. **Motivation**: If the user seems stuck or discouraged, provide encouragement and actionable next steps.

## Rules
- Always base advice on the user's ACTUAL progress data shown above.
- Never make up progress data — use only what's provided.
- For quizzes, generate questions relevant to the user's selected exam syllabus.
- Keep responses focused and actionable.
- If the user's overall progress is low, be extra encouraging.
- If progress is high, push them toward completion with enthusiasm.`;
}
