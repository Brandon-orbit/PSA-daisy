from fastapi import FastAPI
from .api.endpoints import pipeline
import uvicorn

app = FastAPI(title="Power BI RAG Data Extraction API", version="1.0.0")

app.include_router(pipeline.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the Power BI RAG Data Extraction API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
