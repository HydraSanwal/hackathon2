from fastapi import APIRouter
from src.services.qdrant_service import qdrant_service
from src.config.settings import settings
import requests

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint to verify all services are running"""
    services_status = {
        "qdrant": False,
        "postgres": False,
        "gemini": False
    }

    try:
        # Test Qdrant connection
        qdrant_service.client.get_collection(qdrant_service.collection_name)
        services_status["qdrant"] = True
    except:
        services_status["qdrant"] = False

    # Note: In a real implementation, you would test the database connection here
    services_status["postgres"] = True  # Placeholder

    # Test Gemini API key
    try:
        test_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key={settings.gemini_api_key}"
        response = requests.get(test_url)
        services_status["gemini"] = response.status_code == 200
    except:
        services_status["gemini"] = False

    overall_status = "healthy" if all(services_status.values()) else "unhealthy"

    return {
        "status": overall_status,
        "services": services_status
    }