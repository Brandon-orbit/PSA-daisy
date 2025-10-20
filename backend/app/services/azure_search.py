import requests
import json
import time
import pandas as pd
from typing import Dict

class AzureAIFoundryRAG:
    def __init__(self, search_service_name: str, search_admin_key: str, search_index_name: str):
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
                "profiles": [{"name": "vector-profile", "algorithm": "hnsw-algorithm"}],
                "algorithms": [{"name": "hnsw-algorithm", "kind": "hnsw"}]
            }
        }

        headers = {"Content-Type": "application/json", "api-key": self.search_admin_key}
        url = f"{self.search_endpoint}/indexes/{self.search_index_name}?api-version=2023-11-01"
        response = requests.put(url, headers=headers, json=index_definition)
        response.raise_for_status()
        return True

    def index_powerbi_data(self, dataframes_dict: Dict[str, pd.DataFrame]):
        """Index Power BI data for RAG retrieval"""
        documents = []

        for query_name, df in dataframes_dict.items():
            content = df.to_string(index=False)

            doc = {
                "@search.action": "upload",
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

        headers = {"Content-Type": "application/json", "api-key": self.search_admin_key}
        upload_payload = {"value": documents}

        url = f"{self.search_endpoint}/indexes/{self.search_index_name}/docs/index?api-version=2023-11-01"
        response = requests.post(url, headers=headers, json=upload_payload)
        response.raise_for_status()
        return True
