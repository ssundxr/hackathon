import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from cv_analyzer_api.router import router as cv_analyzer_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="CV Analyzer API",
    description="Standalone CV analysis API powered by Gemini AI",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for easy local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the CV analyzer router
app.include_router(cv_analyzer_router)

@app.get("/healthz", include_in_schema=False)
async def health_check():
    return {"status": "ok"}

# Serve frontend static assets if available (production/built mode)
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    # Serve assets folder if it exists
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_app(full_path: str):
        target_path = os.path.normpath(os.path.join(FRONTEND_DIST, full_path))
        if not target_path.startswith(FRONTEND_DIST):
            raise HTTPException(status_code=403, detail="Access denied")

        if os.path.exists(target_path) and os.path.isfile(target_path):
            return FileResponse(target_path)
        
        # Catch-all to support SPA routing (render index.html)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    async def root():
        return HTMLResponse(
            "<div style='font-family: sans-serif; text-align: center; padding: 50px;'>"
            "<h1>CV Analyzer API is running</h1>"
            "<p>API documentation is available at <a href='/docs'>/docs</a>.</p>"
            "<p>To run the frontend, start the Vite development server:</p>"
            "<code style='background: #f1f1f1; padding: 5px 10px; border-radius: 4px;'>cd frontend && npm run dev</code>"
            "</div>"
        )
