SHURI AI Predictor — Vercel deployment

1. Upload this project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add these Environment Variables in Project Settings > Environment Variables:
   GROQ_API_KEY = your NEW Groq API key
   GROQ_MODEL = llama-3.3-70b-versatile
   TELEGRAM_BOT_TOKEN = your NEW Telegram bot token
   ADMIN_CHAT_ID = your Telegram admin chat ID
4. Redeploy after saving variables.
5. Open the Vercel URL.

Never put API keys in index.html. Rotate any credentials previously exposed in the old HTML.
