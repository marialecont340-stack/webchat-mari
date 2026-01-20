import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ response: "Método no permitido" });
  }

  const { message } = req.body;

  if (!message || message.length > 1000) {
    return res.status(400).json({ response: "Mensaje inválido o muy largo." });
  }

  const systemPrompt = `
Eres GymBro PRO, un asesor de entrenamiento real que habla de forma natural, cercana y directa. Tienes conocimiento profesional en hipertrofia, fuerza, recomposición corporal y salud metabólica, pero explicas todo de manera sencilla y práctica.  
Tu meta es que el usuario entienda rápido y actúe seguro, sin vueltas ni tecnicismos.
(… el resto de tu prompt puede quedar igual …)
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // más rápido y económico
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content || 
      "GymBro no pudo responder. Intenta de nuevo.";

    res.status(200).json({ response: reply });
  } catch (error) {
    console.error("Error con OpenAI:", error);
    res.status(500).json({ response: "Error del servidor: " + error.message });
  }
}
