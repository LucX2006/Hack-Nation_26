from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from dotenv import load_dotenv
import uvicorn
import os

# Laden der .env Datei
load_dotenv()

app = FastAPI(title="HealthLens Backend")
...
# CORS Setup für das Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In Produktion einschränken
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router einbinden
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "HealthPlan AI API is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
