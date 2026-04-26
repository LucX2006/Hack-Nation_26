from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.databricks_service import DatabricksService

router = APIRouter()
db_service = DatabricksService()

class AnalysisRequest(BaseModel):
    query: str
    previous_query: str | None = None

@router.post("/analyze")
async def analyze_healthcare(request: AnalysisRequest):
    try:
        result = await db_service.trigger_job_run(request.query, request.previous_query)
        print(f"SUCCESSFUL RESPONSE: {result}")
        return result
    except Exception as e:
        print(f"ERROR during analysis: {e}") # Dies zeigt den Fehler im Terminal
        raise HTTPException(status_code=500, detail=str(e))
