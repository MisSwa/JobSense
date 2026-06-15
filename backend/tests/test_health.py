from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_ok_status():
    response = client.get("/health")
    assert response.json()["status"] == "ok"


def test_health_returns_version():
    response = client.get("/health")
    assert "version" in response.json()


def test_health_cors_header_for_frontend_origin():
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:5173"}
    )
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
