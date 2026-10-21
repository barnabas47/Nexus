import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.api.dashboard import router as dashboard_router
from backend.api.webhooks import router as webhooks_router
from backend.api.auth import router as auth_router
from backend.api.roster import router as roster_router
from backend.api.playbooks import router as playbooks_router
from backend.api.demo import JudgeDemoOrchestrator

app = FastAPI(
    title="NexusAI — Multi-Agent Omnichannel Enterprise Communication Platform",
    description="AWS Bedrock AgentCore + AWS CDS (RCS, SMS, WhatsApp, SES) with Unified Memory",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(webhooks_router)
app.include_router(auth_router)
app.include_router(roster_router)
app.include_router(playbooks_router)

@app.on_event("startup")
def startup_event():
    # Preload demo data so UI is never empty on cold start
    JudgeDemoOrchestrator.run_full_scenario()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "NexusAI Omnichannel Platform Engine",
        "version": "1.0.0",
        "docs": "/docs",
        "demo_api": "/api/demo/run"
    }

# Production SPA Static Files Mount (Render / Docker unified deployment)
dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "dist")
if os.path.isdir(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        # Allow API routes to be handled by routers
        if full_path.startswith("api/") or full_path == "docs" or full_path == "openapi.json":
            return {"error": "API route not found"}
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "NexusAI Omnichannel Platform Engine is running.",
            "docs": "/docs",
            "demo_api": "/api/demo/run"
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.api.main:app", host="0.0.0.0", port=port, reload=True)

