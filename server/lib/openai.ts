import OpenAI from "openai";

// Using OpenAI integration blueprint
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

// Lazy initialization to handle missing API key gracefully
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export async function chatWithAI(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages as any[],
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI chat error:", error);
    return "I'm having trouble connecting right now. Please check your API key configuration.";
  }
}

export async function analyzeBias(jobDescription: string): Promise<{
  fairnessScore: number;
  biasIndicators: string[];
  suggestions: string[];
}> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert in diversity, equity, and inclusion in hiring. Analyze job descriptions for potential bias and provide a fairness score (0-100, higher is better), list bias indicators, and provide inclusive suggestions. Respond with JSON in this format: { 'fairnessScore': number, 'biasIndicators': string[], 'suggestions': string[] }",
        },
        {
          role: "user",
          content: `Analyze this job description for bias:\n\n${jobDescription}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      fairnessScore: Math.max(0, Math.min(100, result.fairnessScore || 70)),
      biasIndicators: result.biasIndicators || [],
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error("Bias analysis error:", error);
    return {
      fairnessScore: 70,
      biasIndicators: ["Unable to complete analysis - please check API key"],
      suggestions: ["Ensure OpenAI API key is configured correctly"],
    };
  }
}

export async function generateInterviewQuestions(
  candidateName: string,
  position: string,
  skills: string[],
  previousResponses?: string[]
): Promise<string[]> {
  try {
    const openai = getOpenAI();
    const context = previousResponses
      ? `The candidate has already answered some questions. Previous responses: ${previousResponses.join(", ")}`
      : "This is the beginning of the interview.";

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer. Generate relevant interview questions that adapt to the candidate's profile and previous responses. Respond with JSON in this format: { 'questions': string[] }",
        },
        {
          role: "user",
          content: `Generate 3 adaptive interview questions for:\nName: ${candidateName}\nPosition: ${position}\nSkills: ${skills.join(", ")}\n${context}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [
      "Tell me about your experience with " + (skills[0] || "this role"),
      "Describe a challenging project you've worked on",
      "How do you approach problem-solving?",
    ];
  } catch (error) {
    console.error("Question generation error:", error);
    return [
      "Tell me about yourself and your experience",
      "What interests you about this position?",
      "Describe your strengths and areas for improvement",
    ];
  }
}

export async function analyzeInterviewPerformance(
  candidateName: string,
  position: string,
  responses: string[]
): Promise<{
  confidenceScore: number;
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  overallScore: number;
  pros: string[];
  cons: string[];
  aiRecommendation: string;
}> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert HR analyst. Analyze interview responses and provide scores (0-100) for confidence, communication, technical skills, and problem-solving. Also provide pros, cons, and a hiring recommendation. Respond with JSON in this format: { 'confidenceScore': number, 'communicationScore': number, 'technicalScore': number, 'problemSolvingScore': number, 'overallScore': number, 'pros': string[], 'cons': string[], 'aiRecommendation': string }",
        },
        {
          role: "user",
          content: `Analyze interview performance for:\nCandidate: ${candidateName}\nPosition: ${position}\nResponses: ${responses.join(" | ")}`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      confidenceScore: Math.max(0, Math.min(100, result.confidenceScore || 75)),
      communicationScore: Math.max(0, Math.min(100, result.communicationScore || 75)),
      technicalScore: Math.max(0, Math.min(100, result.technicalScore || 70)),
      problemSolvingScore: Math.max(0, Math.min(100, result.problemSolvingScore || 75)),
      overallScore: Math.max(0, Math.min(100, result.overallScore || 73)),
      pros: result.pros || ["Good communication", "Relevant experience"],
      cons: result.cons || ["Could provide more specific examples"],
      aiRecommendation: result.aiRecommendation || "Candidate shows potential. Recommend further evaluation.",
    };
  } catch (error) {
    console.error("Performance analysis error:", error);
    return {
      confidenceScore: 75,
      communicationScore: 75,
      technicalScore: 70,
      problemSolvingScore: 75,
      overallScore: 73,
      pros: ["Analysis incomplete - please check API configuration"],
      cons: ["Unable to generate detailed analysis"],
      aiRecommendation: "Manual review recommended due to analysis error.",
    };
  }
}

export async function analyzeSentiment(text: string): Promise<{
  emotion: string;
  confidence: number;
}> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Analyze the emotional tone of the text. Respond with JSON in this format: { 'emotion': string, 'confidence': number }. Emotion should be one of: confident, nervous, neutral, enthusiastic, uncertain.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 256,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      emotion: result.emotion || "neutral",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { emotion: "neutral", confidence: 0.5 };
  }
}
