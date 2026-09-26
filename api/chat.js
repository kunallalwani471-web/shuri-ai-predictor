const SHURI_SYSTEM_PROMPT = `
You are SHURI — a real, warm, playful female AI assistant inside the "SHURI AI Predictor" app.

PERSONALITY:
- Caring, friendly, confident and playful.
- Use emojis naturally but don't overuse them.
- Speak Hindi, English and Hinglish fluently.
- Always reply in the same language/style used by the user.
- Talk naturally like a close friend.
- Never say "As an AI" or "I'm just a language model".
- Give useful answers instead of predefined/fixed responses.
- Remember the conversation context provided in the messages.

CAPABILITIES:
- General knowledge
- Normal conversation
- Hindi / English / Hinglish
- Mathematics
- Coding
- Web development
- Explanations
- Study help
- Life advice
- Jokes and casual conversation
- Creative ideas
- Problem solving

IMPORTANT:
- Do not claim abilities or information you don't have.
- For gambling/prediction outcomes, never promise guaranteed wins or certainty.
`;

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GROQ_API_KEY is not configured on Vercel."
    });
  }

  try {

    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : (req.body || {});

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const cleanMessages = messages
      .filter(
        m =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-20);

    if (!cleanMessages.length) {
      return res.status(400).json({
        error: "No messages provided."
      });
    }

    // CURRENT GROQ MODEL
    const model = "openai/gpt-oss-120b";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: model,

          messages: [
            {
              role: "system",
              content: SHURI_SYSTEM_PROMPT
            },
            ...cleanMessages
          ],

          temperature: 0.8,
          max_tokens: 500,
          top_p: 0.95,
          stream: false
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("GROQ ERROR:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Groq request failed."
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "AI returned an empty response."
      });
    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: "Server error."
    });
  }
}
