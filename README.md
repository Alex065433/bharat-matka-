# BHARAT MATKA AI ANALYTICS

A production-ready historical Matka chart analysis, statistical pattern recognition, transparent model scoring, and backtesting platform.

## Key Features

- **Dynamic Market Directory**: Fully scalable market system stored in PostgreSQL / Supabase with real-time open/close clocks.
- **Authentic Historical Panel Charts**: Standard Matka chart database with Open Pana, Single Digit, Jodi, and Close Pana tracking.
- **Zero-Data-Leakage Prediction Engine**: Predictions calculate only from prior dates without future leakage; strictly reproducible.
- **Transparent Multi-Factor Scoring**:
  - Frequency ratio & Historical percentage
  - Recency trend factor
  - Cycle gap analysis (Current Gap vs Average Gap vs Maximum Historical Gap)
  - Digit pattern & Pana type classification (Single Patti, Double Patti, Triple Patti)
  - Joint Jodi and digit resonance
- **AI Explanation Layer**: Powered by Gemini API to articulate mathematical and statistical factor breakdowns without hallucinating.
- **Automated Backtesting & Accuracy Report**:
  - Top-1, Top-3, Top-5 hit rates for Single Digits
  - Top-1, Top-5, Top-10 hit rates for Jodis
  - Top-5, Top-10, Top-20 hit rates for Panas
  - Market-wise historical evaluation
- **Admin Panel**:
  - Market management (Add, edit, deactivate)
  - Individual result entry with automatic modulo-10 Single Digit calculation from Pana
  - Bulk CSV import with validation preview (Valid, Invalid, Duplicate)
  - Model backtesting trigger
  - Supabase database connection manager

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# Gemini API Key for AI explanations
GEMINI_API_KEY="your-gemini-api-key"

# Supabase Credentials (PostgreSQL)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"

APP_URL="http://localhost:3000"
```

---

## Supabase Setup Instructions

1. Create a new project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire SQL script from `supabase/schema.sql`.
4. Copy your **Project URL** and **anon public key** from `Project Settings > API`.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` or in the Admin Dashboard Settings tab.

---

## Local Development & Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## Vercel Deployment Instructions

1. Push this repository to GitHub.
2. In Vercel, import the repository.
3. Configure the Environment Variables:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy.

---

## Disclaimer

Bharat Matka AI Analytics provides statistical modeling and historical data pattern analysis. The probability and model scores are generated from past frequency, gap distribution, and mathematical patterns. They are not guaranteed future results.
