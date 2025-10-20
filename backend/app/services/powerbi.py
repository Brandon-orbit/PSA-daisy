import requests
from azure.identity import ClientSecretCredential

class PowerBIDataExtractor:
    def __init__(self, client_id: str, client_secret: str, tenant_id: str, workspace_id: str):
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
        response.raise_for_status()
        return response.json()

    def execute_dax_query(self, dataset_id: str, dax_query: str):
        """Execute DAX query against Power BI dataset"""
        if not self.access_token:
            self.get_access_token()

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

        url = f"https://api.powerbi.com/v1.0/myorg/groups/{self.workspace_id}/datasets/{dataset_id}/executeQueries"

        payload = {
            "queries": [{"query": dax_query}],
            "serializerSettings": {"includeNulls": True}
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
