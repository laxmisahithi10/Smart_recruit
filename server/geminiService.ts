import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function evaluateCandidate(summary: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    Evaluate this candidate based on their summary and provide a JSON response with the following structure:
    {
      "overallScore": number (0-100),
      "strengths": string[],
      "weaknesses": string[],
      "recommendation": "hire" | "reject" | "interview",
      "reasoning": string
    }
    
    Candidate Summary: ${summary}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to evaluate candidate with Gemini API");
  }
}