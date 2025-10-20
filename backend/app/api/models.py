from pydantic import BaseModel
from typing import Dict

class DAXQueryRequest(BaseModel):
    dataset_id: str
    dax_queries: Dict[str, str]

class PipelineResponse(BaseModel):
    status: str
    message: str
    extracted_records: int
    indexed_documents: int
