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

    const promptParts = [];
    if (mood) promptParts.push(`User mood: ${mood}`);
    promptParts.push('Conversation:');
    messages.forEach((m) => {
      const role = m.isUser ? 'User' : 'Assistant';
      promptParts.push(`${role}: ${m.content}`);
    });
    promptParts.push('Assistant:');
    const prompt = promptParts.join('\n');

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not set on server' }) };
    }

    const model = process.env.GEMINI_MODEL || 'text-bison-001';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generate?key=${encodeURIComponent(
      key
    )}`;

    const genResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: { text: prompt }, temperature: 0.7, maxOutputTokens: 512 }),
    });

    const json = await genResponse.json();
    const reply = json?.candidates?.[0]?.content ?? json?.output?.[0]?.content ?? json?.candidates?.[0]?.output ?? null;

    if (!reply) {
      return { statusCode: 500, body: JSON.stringify({ error: 'No reply from model', raw: json }) };
    }

    return { statusCode: 200, body: JSON.stringify({ reply }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
