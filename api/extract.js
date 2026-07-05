/**
 * Fonction serverless Vercel : proxy sécurisé vers l'API Anthropic.
 * La clé API reste côté serveur (variable d'environnement ANTHROPIC_API_KEY),
 * jamais exposée au navigateur.
 *
 * Configuration requise sur Vercel :
 *   Project Settings → Environment Variables → ANTHROPIC_API_KEY = sk-ant-...
 *   (clé obtenue sur https://console.anthropic.com/settings/keys)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY n'est pas configurée sur le serveur Vercel. Ajoute-la dans Project Settings → Environment Variables, puis redéploie.",
    });
  }

  try {
    const { base64, mediaType } = req.body || {};
    if (!base64 || !mediaType) {
      return res.status(400).json({ error: "Image manquante." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              {
                type: "text",
                text:
                  "Cette image est une capture d'écran d'une page produit d'un site vendant des livres de Rabbi Nahman de Breslev. " +
                  "Extrais le titre du livre, la langue (Français, Anglais, Hébreu ou Autre) et le prix affiché (nombre seul, sans devise). " +
                  "Réponds UNIQUEMENT avec un JSON strict, sans aucun texte autour, sans balises markdown, au format exact: " +
                  '{"titre":"...","langue":"FR|EN|HE|AUTRE","prix":0}. Si une info est introuvable, mets une chaîne vide ou 0.',
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || "Erreur API Anthropic" });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Erreur serveur" });
  }
}
