from fastapi import APIRouter, HTTPException, Depends
from ...pipeline import PowerBIToRAGPipeline
from ..models import DAXQueryRequest, PipelineResponse
from ...core.config import Settings, settings as default_settings

router = APIRouter()

def get_settings():
    return default_settings

@router.post("/extract-and-index", response_model=PipelineResponse)
async def extract_and_index_data(request: DAXQueryRequest, settings: Settings = Depends(get_settings)):
    """Extract data from Power BI using DAX queries and index for RAG"""
    try:
        pipeline = PowerBIToRAGPipeline(settings)
        result = pipeline.run_pipeline(request.dataset_id, request.dax_queries)

        total_records = sum(len(df) for df in result["processed_dataframes"].values())
        total_documents = len(result["processed_dataframes"])

        return PipelineResponse(
            status=result["pipeline_status"],
            message="Data successfully extracted and indexed for RAG",
            extracted_records=total_records,
            indexed_documents=total_documents
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Power BI RAG Extraction API"}
