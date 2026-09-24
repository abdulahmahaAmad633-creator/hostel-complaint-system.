import requests

BASE_URL = "http://127.0.0.1:5000"

def test_health_check():
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200
    print("Health check: PASS")

def test_valid_photo():
    with open("data/val/electrical/electrical_001.jpeg", "rb") as f:
        r = requests.post(f"{BASE_URL}/photo", files={"photo": f})
    assert r.status_code == 200
    assert "category" in r.json()
    print(f"Valid photo test: PASS - {r.json()}")

def test_no_file():
    r = requests.post(f"{BASE_URL}/photo")
    assert r.status_code == 400
    print("No file test: PASS")

if __name__ == "__main__":
    test_health_check()
    test_valid_photo()
    test_no_file()
    print("\nAll tests passed.")