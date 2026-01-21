export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  let body = req.body || {};
  const message = typeof body.message === "string" ? body.message : "";

  return res.status(200).json({
    response: message
      ? `Recibí tu mensaje: "${message}". La conexión con el servidor SÍ funciona ✅`
      : "No recibí mensaje, pero la conexión con el servidor SÍ funciona ✅",
  });
}
