export default async function handler(req, res) {
  // Solo permitimos POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido. Usa POST."
    });
  }

  // Leemos el mensaje enviado desde el frontend / APK
  const { message } = req.body || {};

  // Respuesta simulada (mock)
  return res.status(200).json({
    ok: true,
    received: message || null,
    reply: "Hola 👋 Conexión exitosa entre la app y el backend en Vercel."
  });
}


