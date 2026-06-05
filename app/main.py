from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .config import BASE_DIR, settings

app = FastAPI(
    title="SeekATS CV Analyzer",
    description="Standalone AI CV Analyzer",
    version="0.3.0",
)

@app.get("/healthz", include_in_schema=False)
async def health_check():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory=str(settings.upload_dir)), name="media")

from cv_analyzer_api.router import router as cv_analyzer_router
app.include_router(cv_analyzer_router)

# Serve React SPA as the primary frontend.
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIST.exists():
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_app(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        
        # If it's a request for an asset that doesn't exist, return 404 instead of index.html
        if full_path.startswith("assets/") or full_path.startswith("static/"):
            raise HTTPException(status_code=404, detail="Asset not found")

        return FileResponse(str(FRONTEND_DIST / "index.html"))
else:
    @app.get("/", include_in_schema=False)
    async def root():
        return HTMLResponse(
            "<h1 style='font-family:monospace'>SeekATS CV Analyzer API running</h1>"
            "<p>Build the frontend first:<br>"
            "<code>cd frontend && npm install && npm run build</code></p>"
            "<p><a href='/docs'>API Docs →</a></p>"
        )
