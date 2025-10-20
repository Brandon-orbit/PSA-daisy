# Power BI to Azure AI Foundry RAG Pipeline
# Complete implementation for extracting data from Power BI using DAX queries
# and storing in Azure for RAG applications

import requests
import json
from azure.identity import ClientSecretCredential
from azure.storage.blob import BlobServiceClient
import pandas as pd
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List
import uvicorn

class PowerBIDataExtractor:
    def __init__(self, client_id, client_secret, tenant_id, workspace_id):
        self.client_id = client_id
        self.client_secret = client_secret
        self.tenant_id = tenant_id
        self.workspace_id = workspace_id
        self.access_token = None
        
    def get_access_token(self):
        """Get access token using service principal"""
        credential = ClientSecretCredential(
            tenant_id=self.tenant_id,
            client_id=self.client_id,
            client_secret=self.client_secret
        )
        
        token = credential.get_token("https://analysis.windows.net/powerbi/api/.default")
        self.access_token = token.token
        return token.token
        
    def get_datasets(self):
        """Retrieve all datasets in the workspace"""
        if not self.access_token:
            self.get_access_token()
            
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        url = f"https://api.powerbi.com/v1.0/myorg/groups/{self.workspace_id}/datasets"
        response = requests.get(url, headers=headers)
        return response.json()
    
    def execute_dax_query(self, dataset_id, dax_query):
        """Execute DAX query against Power BI dataset"""
        if not self.access_token:
            self.get_access_token()
            
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        url = f"https://api.powerbi.com/v1.0/myorg/groups/{self.workspace_id}/datasets/{dataset_id}/executeQueries"
        
        payload = {
            "queries": [
                {
                    "query": dax_query
                }
            ],
            "serializerSettings": {
                "includeNulls": True
            }
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
    
    def extract_all_tables_data(self, dataset_id):
        """Extract data from all tables in the dataset"""
        sample_queries = [
            "EVALUATE TOPN(1000, 'Sales')",
            "EVALUATE SUMMARIZECOLUMNS('Product'[Category], 'Sales'[Amount])", 
            "EVALUATE ADDCOLUMNS('Customer', 'TotalSales', CALCULATE(SUM('Sales'[Amount])))"
        ]
        
        extracted_data = {}
        for i, query in enumerate(sample_queries):
            result = self.execute_dax_query(dataset_id, query)
            if result:
                extracted_data[f"query_{i+1}"] = result
                
        return extracted_data

class AzureDataProcessor:
    def __init__(self, storage_account_name, storage_account_key, container_name):
        self.blob_service_client = BlobServiceClient(
            account_url=f"https://{storage_account_name}.blob.core.windows.net",
            credential=storage_account_key
        )
        self.container_name = container_name
    
    def process_powerbi_response(self, powerbi_response):
        """Convert Power BI API response to pandas DataFrame"""
        if not powerbi_response or 'results' not in powerbi_response:
            return None
            
        result = powerbi_response['results'][0]
        tables = result.get('tables', [])
        if not tables:
            return None
            
        table = tables[0]
        rows = table.get('rows', [])
        
        if not rows:
            return None
            
        df = pd.DataFrame(rows)
        return df
    
    def save_to_blob_storage(self, dataframe, blob_name):
        """Save DataFrame to Azure Blob Storage as CSV"""
        csv_data = dataframe.to_csv(index=False)
        
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name, 
            blob=blob_name
        )
        
        blob_client.upload_blob(csv_data, overwrite=True)
        return f"Data saved to blob: {blob_name}"
    
    def save_to_parquet(self, dataframe, blob_name):
        """Save DataFrame to Azure Blob Storage as Parquet for better performance"""
        import io
        
        parquet_buffer = io.BytesIO()
        dataframe.to_parquet(parquet_buffer, index=False)
        parquet_data = parquet_buffer.getvalue()
        
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name, 
            blob=blob_name
        )
        
        blob_client.upload_blob(parquet_data, overwrite=True)
        return f"Parquet data saved to blob: {blob_name}"

class AzureAIFoundryRAG:
    def __init__(self, search_service_name, search_admin_key, search_index_name):
        self.search_service_name = search_service_name
        self.search_admin_key = search_admin_key
        self.search_index_name = search_index_name
        self.search_endpoint = f"https://{search_service_name}.search.windows.net"
    
    def create_search_index(self):
        """Create Azure AI Search index for RAG"""        
        index_definition = {
            "name": self.search_index_name,
            "fields": [
                {"name": "id", "type": "Edm.String", "key": True, "searchable": False},
                {"name": "content", "type": "Edm.String", "searchable": True, "analyzer": "en.microsoft"},
                {"name": "title", "type": "Edm.String", "searchable": True, "filterable": True},
                {"name": "metadata", "type": "Edm.String", "searchable": False},
                {"name": "vector", "type": "Collection(Edm.Single)", "dimensions": 1536, "vectorSearchProfile": "vector-profile"}
            ],
            "vectorSearch": {
                "profiles": [
                    {
                        "name": "vector-profile",
                        "algorithm": "hnsw-algorithm"
                    }
                ],
                "algorithms": [
                    {
                        "name": "hnsw-algorithm",
                        "kind": "hnsw"
                    }
                ]
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "api-key": self.search_admin_key
        }
        
        url = f"{self.search_endpoint}/indexes?api-version=2023-11-01"
        response = requests.put(f"{url}/{self.search_index_name}", 
                               headers=headers, 
                               json=index_definition)
        
        return response.status_code == 201 or response.status_code == 200
    
    def index_powerbi_data(self, dataframes_dict):
        """Index Power BI data for RAG retrieval"""
        documents = []
        
        for query_name, df in dataframes_dict.items():
            content = df.to_string(index=False)
            
            doc = {
                "id": f"powerbi_{query_name}_{int(time.time())}",
                "content": content,
                "title": f"Power BI Data - {query_name}",
                "metadata": json.dumps({
                    "source": "PowerBI",
                    "query": query_name,
                    "timestamp": time.time(),
                    "row_count": len(df),
                    "columns": list(df.columns)
                })
            }
            documents.append(doc)
        
        headers = {
            "Content-Type": "application/json",
            "api-key": self.search_admin_key
        }
        
        upload_payload = {
            "value": documents
        }
        
        url = f"{self.search_endpoint}/indexes/{self.search_index_name}/docs/index?api-version=2023-11-01"
        response = requests.post(url, headers=headers, json=upload_payload)
        
        return response.status_code == 200

class PowerBIToRAGPipeline:
    def __init__(self, config):
        self.pbi_extractor = PowerBIDataExtractor(
            config['client_id'],
            config['client_secret'], 
            config['tenant_id'],
            config['workspace_id']
        )
        
        self.azure_processor = AzureDataProcessor(
            config['storage_account_name'],
            config['storage_account_key'],
            config['storage_container']
        )
        
        self.rag_system = AzureAIFoundryRAG(
            config['search_service_name'],
            config['search_admin_key'],
            config['search_index_name']
        )
        
    def run_pipeline(self, dataset_id, dax_queries):
        """Execute complete pipeline from Power BI to RAG system"""
        print("Starting Power BI to RAG Pipeline...")
        
        extracted_data = {}
        processed_dfs = {}
        
        for query_name, dax_query in dax_queries.items():
            print(f"   Executing query: {query_name}")
            result = self.pbi_extractor.execute_dax_query(dataset_id, dax_query)
            
            if result:
                df = self.azure_processor.process_powerbi_response(result)
                if df is not None:
                    extracted_data[query_name] = result
                    processed_dfs[query_name] = df
                    
                    blob_name = f"powerbi_data/{query_name}_{int(time.time())}.parquet"
                    self.azure_processor.save_to_parquet(df, blob_name)
                    print(f"   Saved {query_name} to blob storage")
        
        print("2. Indexing data for RAG system...")
        if processed_dfs:
            success = self.rag_system.index_powerbi_data(processed_dfs)
            if success:
                print("   Successfully indexed data in Azure AI Search")
            else:
                print("   Failed to index data")
        
        return {
            "extracted_data": extracted_data,
            "processed_dataframes": processed_dfs,
            "pipeline_status": "completed" if processed_dfs else "failed"
        }

# FastAPI Application
app = FastAPI(title="Power BI RAG Data Extraction API", version="1.0.0")

class DAXQueryRequest(BaseModel):
    dataset_id: str
    dax_queries: Dict[str, str]
    
class PipelineResponse(BaseModel):
    status: str
    message: str
    extracted_records: int
    indexed_documents: int

# Configuration - Replace with your actual values
CONFIG = {
    "client_id": "your_client_id_from_image",
    "client_secret": "your_client_secret", 
    "tenant_id": "your_tenant_id_from_image",
    "workspace_id": "your_workspace_id_from_image",
    "storage_account_name": "your_storage_account",
    "storage_account_key": "your_storage_key",
    "storage_container": "powerbi-rag-data",
    "search_service_name": "your_ai_search_service",
    "search_admin_key": "your_search_key",
    "search_index_name": "powerbi-rag-index"
}

pipeline = PowerBIToRAGPipeline(CONFIG)

@app.post("/extract-and-index", response_model=PipelineResponse)
async def extract_and_index_data(request: DAXQueryRequest):
    """Extract data from Power BI using DAX queries and index for RAG"""
    try:
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Power BI RAG Extraction API"}

@app.get("/datasets/{workspace_id}")
async def get_datasets(workspace_id: str):
    """Get available datasets in a workspace"""
    try:
        extractor = PowerBIDataExtractor(
            CONFIG['client_id'],
            CONFIG['client_secret'], 
            CONFIG['tenant_id'],
            workspace_id
        )
        
        datasets = extractor.get_datasets()
        return datasets
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)