"""HTTP client for Bedolaga Bot API."""
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


class BedolagaClient:
    """Client for Bedolaga Bot REST API."""

    def __init__(self):
        self._base_url: Optional[str] = None
        self._api_token: Optional[str] = None
        self._client: Optional[httpx.AsyncClient] = None

    def configure(self, base_url: str, api_token: str):
        """Configure the client with URL and token."""
        self._base_url = base_url.rstrip("/")
        self._api_token = api_token
        # Recreate client with new settings
        if self._client:
            pass  # will be recreated on next request
        self._client = None

    @property
    def is_configured(self) -> bool:
        return bool(self._base_url and self._api_token)

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self._base_url,
                headers={"X-API-Key": self._api_token},
                timeout=httpx.Timeout(15.0),
            )
        return self._client

    async def _get(self, path: str, params: dict = None) -> dict:
        """Make a GET request to the Bedolaga API."""
        client = self._get_client()
        response = await client.get(path, params=params)
        response.raise_for_status()
        return response.json()

    async def get_overview(self) -> dict:
        return await self._get("/stats/overview")

    async def get_full_stats(self) -> dict:
        return await self._get("/stats/full")

    async def get_health(self) -> dict:
        return await self._get("/health")

    async def get_transactions(self, limit: int = 20, offset: int = 0, **filters) -> dict:
        params = {"limit": limit, "offset": offset, **filters}
        return await self._get("/transactions", params=params)

    async def get_subscriptions(self, limit: int = 20, offset: int = 0, **filters) -> dict:
        params = {"limit": limit, "offset": offset, **filters}
        return await self._get("/subscriptions", params=params)


bedolaga_client = BedolagaClient()
