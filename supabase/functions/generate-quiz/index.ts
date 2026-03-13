import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_INPUT_BYTES = {
  image: 2 * 1024 * 1024, // 2MB
  pdf: 1 * 1024 * 1024, // 1MB
  text: 600 * 1024, // 600KB
};

const MAX_TEXT_CHARS = 12000;

const estimateBase64Bytes = (base64: string) => {
  const sanitized = base64.replace(/\s/g, "");
  const padding = sanitized.endsWith("==") ? 2 : sanitized.endsWith("=") ? 1 : 0;
  return Math.floor((sanitized.length * 3) / 4) - padding;
};

const decodeBase64Preview = (base64: string, maxBytes: number) => {
  const maxChars = Math.floor((maxBytes * 4) / 3);
  const safeChars = maxChars - (maxChars % 4);
  return atob(base64.slice(0, safeChars));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileBase64, fileName, fileType, numQuestions, quizType, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!fileBase64 || !fileName) {
      return new Response(
        JSON.stringify({ error: "File data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const questionCount = Math.min(Math.max(numQuestions || 10, 5), 20);
    const type = quizType || "mcq";
    const lang = language === "hi" ? "Hindi" : "English";

    // Build the prompt based on quiz type
    let quizTypeInstruction = "";
    if (type === "mcq") {
      quizTypeInstruction = `Generate exactly ${questionCount} Multiple Choice Questions (MCQs). Each question must have exactly 4 options (A, B, C, D) with one correct answer.`;
    } else if (type === "short") {
      quizTypeInstruction = `Generate exactly ${questionCount} Short Answer Questions. Each question should have a brief correct answer (1-2 sentences).`;
    } else {
      const mcqCount = Math.ceil(questionCount / 2);
      const shortCount = questionCount - mcqCount;
      quizTypeInstruction = `Generate a mixed quiz: ${mcqCount} MCQs (with 4 options each) and ${shortCount} Short Answer Questions.`;
    }

    const systemPrompt = `You are an expert quiz generator for Indian competitive exam preparation. You will receive study material (text or image) and must generate a high-quality quiz from it.

${quizTypeInstruction}

IMPORTANT RULES:
- Questions should test understanding, not just recall
- Cover different parts of the material evenly
- For MCQs, make distractors plausible but clearly wrong
- Include a brief solution/explanation for each question
- Respond in ${lang}

You MUST respond using the generate_quiz tool.`;

    // Determine if file is an image or text-based
    const isImage = fileType?.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif)$/i.test(fileName);
    const isPdf = fileType === "application/pdf" || /\.pdf$/i.test(fileName);

    let messages: any[];

    if (isImage) {
      // Send image directly to Gemini for vision processing
      const mimeType = fileType || "image/jpeg";
      messages = [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${fileBase64}` },
            },
            {
              type: "text",
              text: `Extract all text and content from this image, then generate a quiz based on it. File: ${fileName}`,
            },
          ],
        },
      ];
    } else if (isPdf) {
      // For PDFs, decode base64 to text (basic extraction)
      let textContent: string;
      try {
        textContent = atob(fileBase64);
        // Clean up binary PDF artifacts, keep readable text
        textContent = textContent.replace(/[^\\x20-\\x7E\\n\\r\\t]/g, " ").replace(/\s{3,}/g, " ").trim();
        if (textContent.length < 50) {
          // If text extraction is poor, send as image to Gemini
          messages = [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:application/pdf;base64,${fileBase64}` },
                },
                {
                  type: "text",
                  text: `Extract all text from this PDF and generate a quiz. File: ${fileName}`,
                },
              ],
            },
          ];
        } else {
          messages = [
            {
              role: "user",
              content: `Here is the study material from "${fileName}":\n\n${textContent.slice(0, 15000)}\n\nGenerate a quiz based on this content.`,
            },
          ];
        }
      } catch {
        // Binary PDF - send to Gemini vision
        messages = [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${fileBase64}` },
              },
              {
                type: "text",
                text: `Extract all text from this PDF and generate a quiz. File: ${fileName}`,
              },
            ],
          },
        ];
      }
    } else {
      // Plain text / notes
      let textContent: string;
      try {
        textContent = atob(fileBase64);
      } catch {
        textContent = fileBase64;
      }
      messages = [
        {
          role: "user",
          content: `Here is the study material from "${fileName}":\n\n${textContent.slice(0, 15000)}\n\nGenerate a quiz based on this content.`,
        },
      ];
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_quiz",
          description: "Generate a structured quiz from study material",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "A short descriptive title for the quiz based on the content",
              },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: ["mcq", "short"],
                      description: "Question type",
                    },
                    question: { type: "string", description: "The question text" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      description: "4 options for MCQ questions. Empty array for short answer.",
                    },
                    correctAnswer: {
                      type: "string",
                      description: "The correct answer text (must match one of the options for MCQ)",
                    },
                    solution: {
                      type: "string",
                      description: "Brief explanation of the answer",
                    },
                  },
                  required: ["type", "question", "correctAnswer", "solution"],
                  additionalProperties: false,
                },
              },
            },
            required: ["title", "questions"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_quiz" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please wait and try again." }),
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

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "Failed to generate quiz. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const quiz = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(quiz), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

