const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function understandCategoryWithGemini(req, res) {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Gemini API is not configured on this server' });
    }

    const allowedCategories = [
      "Ethnic Wear",
      "Ladies Wear",
      "Bridal Wear",
      "Formal Wear",
      "Sherwani & Groom",
      "Suit",
      "Shirt",
      "Pants",
      "Dress",
      "Salwar & Suits",
      "Uniforms",
      "Kids Wear",
      "Alteration"
    ];

    const prompt = `You are an expert Indian tailoring categorization assistant for "MeraTailor".
The user gave this query in Hindi, English, or Hinglish:
"${query.trim()}"

Map this query to the SINGLE best matching category from this strict list:
${JSON.stringify(allowedCategories)}

Also extract:
- garment (e.g. "Blouse", "Sherwani", "Trousers", "Safari Suit", "Lehenga", "Kurti", "Shirt", "Dress")
- color (if mentioned, e.g. "red", "black", "navy blue", "white")
- isUrgent (boolean, true if user asks for urgent, emergency, today, kal tak)
- suggestedRadiusKm (number if user mentions km, else null)
- location (city/area name if mentioned, else "")

Respond ONLY in valid raw JSON with this exact schema:
{
  "category": "One of the strict category strings from the list above",
  "garment": "Extracted garment name or empty string",
  "color": "Extracted color or empty string",
  "isUrgent": false,
  "suggestedRadiusKm": null,
  "location": "City or locality name or empty string",
  "confidence": 0.95
}
Do not include backticks, markdown fences, or explanations. Just valid raw JSON.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const response = await fetch(`${GEMINI_API_BASE}/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      }),
      signal: AbortSignal.timeout(15_000)
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`Gemini category inference returned ${response.status}:`, errBody);
      return res.status(502).json({ error: 'Gemini service returned an error' });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Clean potential markdown fences
    const cleanJsonText = candidateText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanJsonText);

    // Validate that category is in allowedCategories
    if (parsed.category && !allowedCategories.includes(parsed.category)) {
      // Find case-insensitive partial match
      const matched = allowedCategories.find(c => c.toLowerCase() === parsed.category.toLowerCase());
      if (matched) parsed.category = matched;
      else parsed.category = "Ethnic Wear"; // safe fallback
    }

    return res.json(parsed);
  } catch (err) {
    console.error('Gemini category understanding error:', err);
    return res.status(500).json({ error: 'Failed to process category understanding' });
  }
}
