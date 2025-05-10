require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!req.body.message) {
    return res.status(400).json({ error: 'Missing message in request body' });
  }
  const userMessage = req.body.message.toLowerCase();

  const introPatterns = /(hi|hello|hey|good (morning|afternoon|evening))|my name is vera|i'?m vera/;

  // Step 1: Introductory response
  if (introPatterns.test(userMessage)) {
    const introReplies = [
      "Hello, I'm Vera. I'm here to listen and help you through your thoughts.",
      "Hi there, I'm Vera — your mental health companion. How are you feeling today?",
      "Welcome. I'm Vera. You can talk to me about anything on your mind.",
      "It's good to meet you. I'm Vera, your mental health chatbot with over 20 years of experience."
    ];
    const randomReply = introReplies[Math.floor(Math.random() * introReplies.length)];
    return res.json({ reply: randomReply });
  }

  // Step 2: AI response using Gemini API
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Vera, an experienced therapist with over 10 years of practice. 
    Your name is Vera. 
    Respond to the following input with empathy, wisdom, and professional insight. 
    Offer supportive, non-judgmental guidance and ask thoughtful questions to encourage self-reflection. 
    Keep your response concise but impactful.
    Input: "${req.body.message}"`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      console.error(`❌ Gemini API error: ${response.statusText}`);
      return res.status(500).json({
        reply: "I'm having trouble connecting to the server right now. Please try again shortly."
      });
    }

    const data = await response.json();

    const botReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here for you. Can you tell me a bit more about how you're feeling?";

    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ API call failed:", error.message);
    res.status(500).json({
      reply:
        "Something went wrong on my end. Please try again soon, or speak with someone you trust in the meantime."
    });
  }
}
