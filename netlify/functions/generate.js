// Netlify Function to proxy /api/generate -> Google Generative Language API
// Reads GEMINI_API_KEY from Netlify environment variables

exports.handler = async function (event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const payload = event.body ? JSON.parse(event.body) : {};
    const messages = payload.messages ?? [];
    const mood = payload.mood ?? null;

    const contents = [];

    // Persona: respond as a human, non-judgmental mental therapist.
    contents.push({ role: 'user', parts: [{ text: `You are a human, non-judgmental mental therapist. When responding, be empathetic, prioritize safety, avoid providing medical diagnoses, and encourage users to seek professional human help when appropriate. If the user expresses intent to harm themselves or others, provide crisis resource suggestions and advise immediate contact with emergency services. Keep responses supportive, evidence-informed, and within the scope of general mental health guidance.` }] });

    // Formatting guidance: numbered, concise, actionable steps. Preambles allowed.
    contents.push({ role: 'user', parts: [{ text: 'Format: Respond as a numbered list of concise, actionable steps using 1., 2., 3. Order steps logically and keep each step clear. Preambles are allowed.' }] });

    // Few-shot example demonstrating target format
    contents.push({ role: 'user', parts: [{ text: 'Example question: How can I improve my sleep routine?' }] });
    contents.push({ role: 'model', parts: [{ text: '1. Set a consistent bedtime and wake time.\n2. Limit screens 60 minutes before bed.\n3. Avoid caffeine after mid-afternoon.\n4. Keep your room dark, cool, and quiet.\n5. Use a brief wind-down like reading or breathwork.' }] });

    if (mood) {
      contents.push({ role: 'user', parts: [{ text: `My current mood is: ${mood}.` }] });
    }

    // Append user/model conversation history
    messages.forEach((m) => {
      contents.push({ role: m.isUser ? 'user' : 'model', parts: [{ text: String(m.content ?? '') }] });
    });

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not set on server' }) };
    }

    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      key
    )}`;

    const genResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.3, topP: 0.8, topK: 40, maxOutputTokens: 512 },
      }),
    });

    const json = await genResponse.json();
    const firstCandidate = json?.candidates?.[0] ?? null;
    const parts = firstCandidate?.content?.parts ?? [];
    const textReply = Array.isArray(parts)
      ? parts.map((p) => p?.text).filter(Boolean).join('\n')
      : '';

    const reply = textReply && textReply.trim().length > 0 ? textReply : null;

    if (!reply) {
      return { statusCode: 500, body: JSON.stringify({ error: 'No reply from model', raw: json }) };
    }

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
