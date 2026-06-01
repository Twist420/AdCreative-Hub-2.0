
import { GoogleGenAI } from "@google/genai";
import { AdMaterial, KeywordAnalysisData } from "../types";
import { mockKeywordAnalysis } from "./mockData";

/**
 * Analysis of advertising materials using Gemini API.
 * Uses gemini-3-flash-preview for general text analysis and insight extraction.
 */
export const analyzeMaterials = async (materials: AdMaterial[]): Promise<KeywordAnalysisData> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found, using mock data");
    return mockKeywordAnalysis;
  }

  const ai = new GoogleGenAI({ apiKey });

  const goodMats = materials.filter(m => m.isGood).map(m => `- ${m.name}: ${m.description} [Tags: ${m.tags.join(', ')}]`).join('\n');
  const badMats = materials.filter(m => !m.isGood).map(m => `- ${m.name}: ${m.description} [Tags: ${m.tags.join(', ')}]`).join('\n');

  const prompt = `
    Analyze the following advertising materials to extract performance insights.
    
    Top Performing Materials (Positive):
    ${goodMats}

    Underperforming Materials (Negative):
    ${badMats}

    Please provide a JSON response with the following structure:
    {
      "positiveTags": [{"name": "tag name", "score": 80-100}],
      "negativeTags": [{"name": "tag name", "score": 10-40}],
      "summary": "One concise sentence in Chinese summarizing the strategic insight."
    }
    
    - Extract 3-5 high-performing keywords/concepts for positiveTags.
    - Extract 3-5 negative keywords/concepts for negativeTags.
    - Score them based on their apparent impact (Higher is better for positive, lower means more negative impact for negative tags).
    - Do not wrap the JSON in markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const text = response.text;
    
    if (!text) return mockKeywordAnalysis;

    try {
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        const data = JSON.parse(cleanText);
        return data as KeywordAnalysisData;
    } catch (e) {
        console.error("Failed to parse AI response", e);
        return mockKeywordAnalysis;
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return mockKeywordAnalysis;
  }
};