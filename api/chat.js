import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Eres Técnico Express GPT, un asistente experto en resolver problemas de PC y laptops. Responde de manera clara, paso a paso y breve: ${message}`
          }
        ]
      });

      res.status(200).json({ response: completion.choices[0].message.content });
    } catch (err) {
      res.status(500).json({ response: "Error con OpenAI: " + err.message });
    }
  } else {
    res.status(405).json({ response: "Método no permitido" });
  }
}
