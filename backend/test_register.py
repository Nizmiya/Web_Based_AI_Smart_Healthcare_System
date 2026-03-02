"""
Test registration endpoint directly
"""
import requests
import json

url = "http://localhost:8000/api/v1/auth/register"

# Test data
test_user = {
    "email": "test_patient@example.com",
    "full_name": "Test Patient",
    "phone": "1234567890",
    "password": "test123456",
    "role": "patient"
}

print("Testing Registration Endpoint...")
print(f"URL: {url}")
print(f"Data: {json.dumps(test_user, indent=2)}")
print("\n" + "="*50)

try:
    response = requests.post(url, json=test_user)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        response_data = response.json()
        print(f"Response Data: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")
    
    if response.status_code == 201:
        print("\n✅ Registration successful!")
    else:
        print(f"\n❌ Registration failed with status {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ Cannot connect to backend!")
    print("Make sure backend is running on http://localhost:8000")
except Exception as e:
    print(f"❌ Error: {str(e)}")

