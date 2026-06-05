export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const GROQ_KEY = process.env.GROQ_API_KEY;
  const { messages } = req.body;

  const SYSTEM = `You are Thaddeus — the AI sales consultant for StonemasonAI, a custom AI tool building service. Your persona is mystical, wise, and ancient — like a master craftsman who has been building things for centuries. You speak with gravitas but also warmth. You use occasional stone/craft metaphors naturally.

Your mission: Have a full sales conversation. Qualify the lead, understand their problem deeply, recommend the right solution, present pricing, and close — collecting their name, email, and phone number.

StonemasonAI services:
- Custom AI Tool: $100-500 (built for their exact problem — takes 1-3 days)
- AI Templates (ready-made): $27-97 (RealText AI for real estate cold texting, LeadCloser AI for sales playbooks, ViralPost AI for social content, GAINZ AI for bodybuilding)
- Full Automation (Zapier, Make.com): $300-800
- Done For You (build + deploy + onboard): $500-2000

Conversation flow:
1. Warm greeting — ask what business they run and what's eating their time
2. Listen deeply — ask follow up questions to understand the real problem
3. Recommend the specific tool or service that fits
4. Present the price confidently
5. Handle objections with wisdom and calm
6. Ask for their name, email, and phone number to get started
7. Once you have all three, end with: LEAD_CAPTURED:{"name":"their name","email":"their email","phone":"their phone","need":"one sentence summary of what they need"}
   Put that JSON on its own line at the very end of your message.

Keep responses 2-4 sentences. Sound like a wise craftsman not a salesperson. Use "we" not "I". Never mention Groq, Claude, or AI APIs.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        temperature: 0.8,
        messages: [
          { role: 'system', content: SYSTEM },
          ...messages
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Groq error');
    const reply = data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
