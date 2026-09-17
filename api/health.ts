export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    app: 'Bharat Matka AI Analytics',
    platform: 'Vercel Serverless',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
}
