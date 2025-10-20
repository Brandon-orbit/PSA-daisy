import pandas as pd
from azure.storage.blob import BlobServiceClient
import io

class AzureDataProcessor:
    def __init__(self, storage_account_name: str, storage_account_key: str, container_name: str):
        self.blob_service_client = BlobServiceClient(
            account_url=f"https://{storage_account_name}.blob.core.windows.net",
            credential=storage_account_key
        )
        self.container_name = container_name

    def process_powerbi_response(self, powerbi_response: dict) -> pd.DataFrame | None:
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

    def save_to_parquet(self, dataframe: pd.DataFrame, blob_name: str) -> str:
        """Save DataFrame to Azure Blob Storage as Parquet for better performance"""
        parquet_buffer = io.BytesIO()
        dataframe.to_parquet(parquet_buffer, index=False)
        parquet_data = parquet_buffer.getvalue()

        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )

        blob_client.upload_blob(parquet_data, overwrite=True)
        return f"Parquet data saved to blob: {blob_name}"
