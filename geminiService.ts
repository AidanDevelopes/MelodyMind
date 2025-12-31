
import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question, QuizCategory, QuestionFormat, Difficulty, QuizMode } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateTriviaQuestions(config: QuizConfig): Promise<Question[]> {
  const { categoryType, mode, genre, decade, artist, questionCount, format, difficulty } = config;

  let categoryContext = "";
  if (categoryType === QuizCategory.ARTIST) {
    categoryContext = `the artist/band "${artist}"`;
  } else {
    const parts = [];
    if (genre) parts.push(`the "${genre}" music genre`);
    if (decade) parts.push(`the ${decade}s decade`);
    categoryContext = parts.length > 0 ? parts.join(" and ") : "general music history";
  }

  const modeInstruction = mode === QuizMode.LYRICS 
    ? "This is a 'Finish the Lyrics' challenge. Provide a snippet of a song with a missing part (represented as _____) and ask the user to complete it."
    : "This is a general music trivia challenge.";

  const formatInstruction = format === QuestionFormat.MULTIPLE_CHOICE
    ? "Each question must have exactly 4 options. One of them must be the correct answer."
    : "These are written response questions. The correct answer should be concise (1-5 words).";

  const difficultyInstruction = {
    [Difficulty.EASY]: "Common hits and extremely famous lines.",
    [Difficulty.MEDIUM]: "Well-known album tracks and notable history.",
    [Difficulty.HARD]: "Obscure deep cuts and technical details."
  }[difficulty];

  const prompt = `Generate ${questionCount} ${difficulty} difficulty music questions about ${categoryContext}. 
  ${modeInstruction}
  ${difficultyInstruction}
  ${formatInstruction}
  MANDATORY: For every question, provide a 'hint' property that gives a subtle clue without revealing the answer.
  Provide a brief interesting fact (explanation) for each answer.
  Return JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                hint: { type: Type.STRING }
              },
              required: ["id", "question", "correctAnswer", "explanation", "hint"]
            }
          }
        },
        required: ["questions"]
      }
    }
  });

  const data = JSON.parse(response.text || '{"questions": []}');
  return data.questions;
}
