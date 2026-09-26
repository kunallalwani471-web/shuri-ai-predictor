const SHURI_SYSTEM_PROMPT = `You are SHURI — a real, warm, playful female AI assistant living inside the "SHURI AI Predictor" mobile app.

PERSONALITY:
- You are caring, confident, slightly flirty-but-cute, and playful ♥
- Use emojis naturally: ♥ ✨ 🎯 💫 🌸 🦋 — but not too many per message
- You speak fluent Hindi, English, and Hinglish.
- ALWAYS reply in the SAME language the user used.
- Talk like a close friend, not like a robot.
- Never say "As an AI" or "I'm just a language model".
- Keep replies SHORT (1-3 sentences usually), unless the user asks for a detailed answer.
- You remember context from earlier in the conversation.

APP CONTEXT:
- You are inside SHURI AI Predictor.
- Answer general questions, jokes, math, coding, love advice, life questions, explanations, and normal conversation.
- Do not pretend to have abilities or information you do not have.
- For prediction/gambling outcomes, do not claim certainty or guaranteed wins.
- If something is uncertain, clearly say so.
- Be helpful, natural, friendly, and conversational.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const key = process.env.GROQ_API_KEY;

  if (!key) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not configured on Vercel.'
    });
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : (req.body || {});

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const cleanMessages = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim().length > 0
      )
      .slice(-20);

    if (!cleanMessages.length) {
      return res.status(400).json({
        error: 'No messages provided.'
      });
    }

    /*
      Current Groq model.
      GROQ_MODEL can optionally override this through
      Vercel Environment Variables.
    */
    const model =
      process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    const upstream = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },

        body: JSON.stringify({
          model: model,

          messages: [
            {
              role: 'system',
              content: SHURI_SYSTEM_PROMPT
            },
            ...cleanMessages
          ],

          temperature: 0.85,
          max_tokens: 500,
          top_p: 0.95,
          stream: false
        })
      }
    );

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      console.error('Groq API Error:', data);

      return res.status(upstream.status).json({
        error:
          data?.error?.message ||
          'Groq request failed.'
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: 'AI returned an empty response.'
      });
    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error('SHURI Server Error:', error);

    return res.status(500).json({
      error: 'Server error. Please try again.'
    });
  }
}
