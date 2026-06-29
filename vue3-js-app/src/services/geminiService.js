import { mockKeywordAnalysis } from './mockData'

const getApiKey = () =>
  import.meta.env?.VITE_GEMINI_API_KEY ||
  import.meta.env?.VITE_API_KEY ||
  globalThis.process?.env?.GEMINI_API_KEY ||
  globalThis.process?.env?.API_KEY ||
  ''

const extractResponseText = (payload) =>
  payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim() || ''

export const analyzeMaterials = async (materials = []) => {
  const apiKey = getApiKey()
  if (!apiKey) return mockKeywordAnalysis

  const goodMaterials = materials
    .filter((material) => material.isGood)
    .map((material) => `- ${material.name}: ${material.description} [Tags: ${(material.tags || []).join(', ')}]`)
    .join('\n')
  const badMaterials = materials
    .filter((material) => !material.isGood)
    .map((material) => `- ${material.name}: ${material.description} [Tags: ${(material.tags || []).join(', ')}]`)
    .join('\n')

  const prompt = `
    Analyze the following advertising materials to extract performance insights.

    Top Performing Materials (Positive):
    ${goodMaterials}

    Underperforming Materials (Negative):
    ${badMaterials}

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
  `

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    )
    if (!response.ok) return mockKeywordAnalysis

    const text = extractResponseText(await response.json())
    if (!text) return mockKeywordAnalysis

    return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
  } catch {
    return mockKeywordAnalysis
  }
}
