# SD_Roadwatch 🛣️
### Civic Road Hazard & Infrastructure Intelligence Platform

SD_Roadwatch is a real-time civic infrastructure platform connecting commuters, municipal inspectors, and public works dispatchers to report, verify, and remediate potholes and road hazards.

[![Deploy to GitHub Pages](https://github.com/VaradKolhe26/SD_Roadwatch/actions/workflows/deploy.yml/badge.svg)](https://github.com/VaradKolhe26/SD_Roadwatch/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- 📍 **Interactive GIS Hazard Mapping**: Live interactive map of reported potholes, depth telemetry, severity classification, and active repair zones.
- 📸 **AI-Powered Hazard Detection**: Optical depth calibration, severity scoring, and volumetric asphalt patch calculations powered by Google Gemini AI.
- 🗳️ **Citizen Ground Verification**: Community corroboration and voting ("Still Dangerous" vs "Fixed") to eliminate duplicate municipal tickets.
- 👷 **Municipal Operations Dashboard**: Real-time SLA breach countdowns, contractor dispatch work orders, ward telemetry, and repair lifecycle management.
- ⚡ **Dual Architecture**: Works seamlessly as a full-stack Express + Supabase app, or as a standalone client-side SPA on GitHub Pages / Vercel.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/VaradKolhe26/SD_Roadwatch.git
cd SD_Roadwatch
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in your API keys (Google Maps Platform, Gemini API, and optional Supabase credentials).

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Scripts

- `npm run dev`: Starts the full-stack server (Express backend + Vite HMR frontend).
- `npm run build`: Builds the production-ready client bundle to `dist/`.
- `npm run preview`: Previews the built production assets locally.
- `npm run lint`: Runs TypeScript validation (`tsc --noEmit`).
- `npm run clean`: Cleans generated build artifacts (`dist/`).

---

## 🌐 Deploying to GitHub Pages

This repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`).

To enable automated deployment:
1. In your GitHub repository, navigate to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. Push to `main` branch:
   ```bash
   git push origin main
   ```
4. GitHub Actions will automatically build and publish the live site at `https://<username>.github.io/SD_Roadwatch/`.

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_GOOGLE_MAPS_API_KEY` | Client-side Google Maps API key | Optional (embed fallback active) |
| `GOOGLE_MAPS_API_KEY` | Server-side Geocoding & Places API key | Optional |
| `GEMINI_API_KEY` | Gemini AI key for pothole depth & severity analysis | Optional |
| `SUPABASE_URL` | Supabase project URL | Optional (in-memory mode if unset) |
| `SUPABASE_ANON_KEY` | Supabase public anon key | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Optional |
| `PORT` | Express server port (default: 3000) | Optional |

---

## 📄 License

MIT © [Varad Kolhe](https://github.com/VaradKolhe26)
