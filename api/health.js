
// Exemple d'API Vercel simple pour vérifier l'état de santé
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.VITE_ENVIRONMENT || 'production',
    version: process.env.VITE_LOVABLE_VERSION || '2.0.0'
  });
}
