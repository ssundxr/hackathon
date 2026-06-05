# AI CV Analyzer & ATS Scoring Engine

A standalone, lightweight tool to analyze resumes (PDF, DOCX) against a target job title and target regions. Powered by Gemini AI, it calculates an ATS score, identifies keyword gaps, detects career red flags, recommends upskilling courses, and generates interview preparation questions.

## Project Structure

```text
├── cv_analyzer_api/         # Standalone CV Analyzer logic (Service & Router)
│   ├── __init__.py
│   ├── router.py            # Upload file parsing & API routes
│   └── service.py           # Gemini content generation prompts & scoring
├── frontend/                # React (Vite) Single Page Application UI
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/                 # App and CVAnalyzer page
├── main.py                  # FastAPI server entry point
├── requirements.txt         # Minimal python dependencies
├── .env.example             # Env variables template
└── README.md                # This manual
```

---

## Getting Started

### 1. Configure Secrets

Copy `.env.example` to a new `.env` file at the root:
```bash
cp .env.example .env
```
Open `.env` and add your **Gemini API Key**:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
```
*(You can obtain a free API key at [Google AI Studio](https://aistudio.google.com/))*

---

### 2. Run the Backend

Create a Python virtual environment, activate it, and install dependencies:

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the FastAPI local server:
```bash
uvicorn main:app --reload
```
The backend will run on **http://localhost:8000** (API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)).

---

### 3. Run the Frontend

In a separate terminal, navigate to the `frontend` folder, install npm dependencies, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:5173**. Open this URL in your browser to access the CV Analyzer dashboard.

---

## Features included
- **ATS Score Profiler**: Accurate weight-based ATS scoring breakdown (0.3 Keywords, 0.2 Skills, 0.2 Experience, 0.1 Education, 0.1 Format, 0.1 Achievements).
- **Keyword & Skills Audit**: Highlights missing technical/professional competencies.
- **Red Flag Detector**: Flags employment gaps, missing quantifications, or layout structural anomalies.
- **Suggested Upskilling**: Provides real links to recommended online courses.
- **AI Interview Prep**: Personalized behavioral and technical questions mapped directly to CV gaps.
