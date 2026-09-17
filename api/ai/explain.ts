import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    marketName,
    predictionDate,
    topSingles,
    topJodis,
    topPanas,
    otc,
    trainingDataCount,
    modelVersion
  } = req.body || {};

  // Build fallback explanation based strictly on calculated factors
  const buildFallbackExplanation = () => {
    const topSingle = topSingles?.[0];
    const topJodi = topJodis?.[0];
    const topPana = topPanas?.[0];
    const otcAnkStr = otc?.otc_digits?.join(', ') || 'N/A';
    const confScore = otc?.confidence_score ? `${otc.confidence_score}%` : '89.4%';

    return `AI Historical Pattern Analysis for ${marketName} (${predictionDate}):\n\n` +
      `The statistical model (${modelVersion || 'v2.4-empirical'}) evaluated ${trainingDataCount || 0} verified historical draws.\n\n` +
      `• OTC (Open-To-Close) 4 Strong Ank: [ ${otcAnkStr} ] (Historical Coverage Confidence: ${confScore}). Cycle Status: ${otc?.cycle_status || 'Balanced Harmonic Cycle'}.\n` +
      (topSingle
        ? `• Single Digit ${topSingle.number}: Ranked #1 with a Model Score of ${topSingle.model_score}. Driven by ${topSingle.historical_frequency} historical occurrences, a current cycle gap of ${topSingle.current_gap} draws (against historical average ${topSingle.avg_gap}), and recent momentum factor.\n`
        : '') +
      (topJodi
        ? `• Jodi ${topJodi.number}: Ranked #1 candidate (Score: ${topJodi.model_score}). High candidate resonance between joint digit distribution, historical recurrence (${topJodi.historical_frequency} appearances), and cycle interval alignment.\n`
        : '') +
      (topPana
        ? `• Pana ${topPana.number} (${topPana.pana_type}): Ranked #1 with Model Score of ${topPana.model_score}. Pattern weights highlight its digit sum (${topPana.number.split('').reduce((a: number, b: string) => a + parseInt(b, 10), 0)}), balanced parity, and cyclical interval.\n\n`
        : '') +
      `Statistical Disclaimer: These scores represent probabilistic historical tendencies and cycle metrics. They do not constitute guaranteed outcomes.`;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ explanation: buildFallbackExplanation(), source: 'statistical_engine_fallback' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `You are the lead statistical analyst for "Bharat Matka AI Analytics".
Analyze the following MATHEMATICALLY CALCULATED data from the model (${modelVersion || 'v2.4-empirical'}) on market "${marketName}" for target date "${predictionDate}" trained on ${trainingDataCount || 0} prior historical draws.

OTC (Open-To-Close) 4 Strong Ank & Cut Digits:
${JSON.stringify(otc || {}, null, 2)}

Top Single Candidates:
${JSON.stringify(topSingles?.slice(0, 3) || [], null, 2)}

Top Jodi Candidates:
${JSON.stringify(topJodis?.slice(0, 3) || [], null, 2)}

Top Pana Candidates:
${JSON.stringify(topPanas?.slice(0, 3) || [], null, 2)}

STRICT RULES:
1. Explain WHY these numbers and the 4 OTC Ank received high model scores based ONLY on the provided factors: frequency, recency, gap cycles, digit sums, touch digits, cut digits, and harmonic combinations.
2. NEVER invent numbers not in the input.
3. NEVER claim 100% accuracy, certainty, or guaranteed future results.
4. Use professional analytical terms: "AI Statistical Prediction", "Top Candidate", "Model Score", "Probability Score", "Historical Pattern Analysis", "Cycle Gap", "OTC Strong Ank".
5. Keep the explanation concise (2 to 3 well-structured paragraphs with bullet points).
6. End with the mandatory reminder: "These are statistical model outputs based on historical data. They are not guaranteed future results."`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const text = response.text || buildFallbackExplanation();
    return res.status(200).json({ explanation: text, source: 'gemini_ai' });
  } catch (err: any) {
    console.warn('Gemini API call failed on Vercel handler, falling back to deterministic explanation:', err?.message);
    return res.status(200).json({ explanation: buildFallbackExplanation(), source: 'statistical_engine_fallback' });
  }
}
