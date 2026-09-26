function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_CHAT_ID;
  if (!token || !chatId) return res.status(500).json({ error: 'Telegram environment variables are not configured.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const name = String(body.name || 'Anonymous').trim().slice(0, 100);
    const message = String(body.message || '').trim().slice(0, 4000);
    if (message.length < 3) return res.status(400).json({ error: 'Message is too short.' });
    const timeStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' });
    const telegramText = `👑 <b>NEW MESSAGE FROM SHURI APP</b>\n━━━━━━━━━━━━━━━━━━\n👤 <b>From:</b> ${escapeHtml(name)}\n🕒 <b>Time:</b> ${escapeHtml(timeStr)}\n━━━━━━━━━━━━━━━━━━\n\n💬 ${escapeHtml(message)}\n\n━━━━━━━━━━━━━━━━━━\n⚡ Sent via SHURI AI Predictor`;
    const upstream = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ chat_id:chatId, text:telegramText, parse_mode:'HTML' }) });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok || !data.ok) return res.status(502).json({ error: data.description || 'Telegram request failed.' });
    return res.status(200).json({ ok: true });
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Server error.' }); }
}
