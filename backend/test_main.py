from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["framework"] == "FastAPI"
