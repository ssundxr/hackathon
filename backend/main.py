import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Hackathon AI API", version="1.0.0")

# Input schema for generation endpoint
class GenerateRequest(BaseModel):
    prompt: str

# Status schema
@app.get("/api/status")
async def get_status():
    return {
        "status": "online",
        "backend": f"Python {sys.version.split()[0]}",
        "framework": "FastAPI",
        "env": "Production (Docker)",
        "ec2_ip": "13.206.221.56",
        "loaded_models": ["gemini-2.5-flash", "gpt-4o-mini"]
    }

# AI Mock generator endpoint (Replace this with real model calls later)
@app.post("/api/generate")
async def generate(req: GenerateRequest):
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    # Simple mock response generation that echoes back with AI flair
    response_text = (
        f"This is a response to: '{prompt}'.\n\n"
        "Your FastAPI backend has successfully received your prompt. To make this run real AI inference: \n"
        "1. Install the appropriate SDK (e.g. google-genai or openai).\n"
        "2. Add your API keys to environmental variables.\n"
        "3. Replace this mock logic in backend/main.py with your model.generate_content() call!"
    )
    
    return {
        "response": response_text
    }

# ----------------- Serve Frontend Static Files -----------------
# We mount static files in production. During local development, 
# Vite runs its own hot-reloading dev server on port 5173.

FRONTEND_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST_DIR):
    # Mount assets folder first so static files match properly
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST_DIR, "assets")), name="assets")

    # Fallback to serve index.html for any other route (handles React routing client-side)
    @app.get("/{fallback_path:path}")
    async def serve_frontend(fallback_path: str):
        # Allow Swagger docs to work
        if fallback_path in ["docs", "openapi.json", "redoc"]:
            # Let FastAPI handle Swagger routes
            pass
        else:
            index_path = os.path.join(FRONTEND_DIST_DIR, "index.html")
            if os.path.exists(index_path):
                return FileResponse(index_path)
            
        raise HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
