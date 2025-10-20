from .services.powerbi import PowerBIDataExtractor
from .services.azure_storage import AzureDataProcessor
from .services.azure_search import AzureAIFoundryRAG
from .core.config import Settings
import time
from typing import Dict

class PowerBIToRAGPipeline:
    def __init__(self, settings: Settings):
        self.pbi_extractor = PowerBIDataExtractor(
            settings.CLIENT_ID,
            settings.CLIENT_SECRET,
            settings.TENANT_ID,
            settings.WORKSPACE_ID
        )

        self.azure_processor = AzureDataProcessor(
            settings.STORAGE_ACCOUNT_NAME,
            settings.STORAGE_ACCOUNT_KEY,
            settings.STORAGE_CONTAINER
        )

        self.rag_system = AzureAIFoundryRAG(
            settings.SEARCH_SERVICE_NAME,
            settings.SEARCH_ADMIN_KEY,
            settings.SEARCH_INDEX_NAME
        )

    def run_pipeline(self, dataset_id: str, dax_queries: Dict[str, str]):
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
