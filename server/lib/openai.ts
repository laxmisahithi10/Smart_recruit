import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { extractTextFromPDF } from './pdf-parser';
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env");
  throw new Error("GEMINI_API_KEY is required");
}

console.log("✅ GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// ================== CHATBOT ==================
export async function chatWithAI(
  messages: { role: string; content: string }[]
): Promise<string> {
  try {
    const systemPrompt = "You are a professional AI recruitment assistant. Answer clearly and help recruiters with hiring, scheduling, candidate evaluation, bias checking and interview support.";
    const conversation = messages.map(m => m.content).join("\n");
    const prompt = `${systemPrompt}\n\n${conversation}`;

    const result = await model.generateContent(prompt);
    return result.response.text() || "No response";
  } catch (err: any) {
    console.error("Gemini Chat Error:", err?.message || err);
    return `Error: ${err?.message || 'Unknown error'}. Check console for details.`;
  }
}



// ================== BIAS ANALYSIS ==================
export async function analyzeBias(jobDescription: string | Buffer) {
  let textContent: string;
  
  if (Buffer.isBuffer(jobDescription)) {
    try {
      textContent = await extractTextFromPDF(jobDescription);
    } catch (error) {
      textContent = 'Could not extract PDF content';
    }
  } else {
    textContent = jobDescription;
  }
  try {
    const prompt = `You are a bias analysis expert. Analyze the following job description for bias.
Return ONLY JSON strictly in this format:

{
 "fairnessScore": number,
 "biasIndicators": string[],
 "suggestions": string[]
}

Job Description:
${textContent}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text() || "{}";
    return JSON.parse(text);
  } catch (err) {
    console.error("Bias Error:", err);
    return {
      fairnessScore: 70,
      biasIndicators: ["AI could not analyze. Check Gemini API key."],
      suggestions: ["Ensure Gemini API is configured properly"],
    };
  }
}



// ================== INTERVIEW QUESTIONS ==================
export async function generateInterviewQuestions(
  candidateName: string,
  position: string,
  skills: string[],
  previousResponses?: string[]
) {
  try {
    const prompt = `You are an expert interviewer. Generate 3 interview questions.

Return JSON ONLY:

{
 "questions": string[]
}

Candidate: ${candidateName}
Position: ${position}
Skills: ${skills.join(", ")}
Earlier Responses: ${previousResponses || "None"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text() || '{"questions": []}';
    return JSON.parse(text).questions;
  } catch (err) {
    console.error("Question Error:", err);
    return [
      "Tell me about yourself.",
      "What interests you about this position?",
      "Explain one technical challenge you solved."
    ];
  }
}



// ================== INTERVIEW PERFORMANCE ==================
export async function analyzeInterviewPerformance(
  candidateName: string,
  position: string,
  responses: string[]
) {
  try {
    const prompt = `You are an expert interviewer. Analyze interview performance.

Return ONLY JSON:

{
 "confidenceScore": number,
 "communicationScore": number,
 "technicalScore": number,
 "problemSolvingScore": number,
 "overallScore": number,
 "pros": string[],
 "cons": string[],
 "aiRecommendation": string
}

Candidate: ${candidateName}
Position: ${position}
Responses: ${responses.join(" | ")}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text() || "{}";
    return JSON.parse(text);
  } catch (err) {
    console.error("Performance Error:", err);
    return {
      confidenceScore: 75,
      communicationScore: 75,
      technicalScore: 70,
      problemSolvingScore: 75,
      overallScore: 73,
      pros: ["Could not fully analyze"],
      cons: ["Check Gemini API"],
      aiRecommendation: "Manual review recommended."
    };
  }
}



// ================== SENTIMENT ==================
export async function analyzeSentiment(text: string) {
  try {
    const prompt = `You are a sentiment analysis expert. Analyze emotion of text.
Return ONLY JSON:

{
 "emotion": string,
 "confidence": number
}

Text:
${text}`;

    const result = await model.generateContent(prompt);
    const respText = result.response.text() || '{"emotion": "neutral", "confidence": 0.5}';
    return JSON.parse(respText);
  } catch (err) {
    console.error("Sentiment Error:", err);
    return { emotion: "neutral", confidence: 0.5 };
  }
}
