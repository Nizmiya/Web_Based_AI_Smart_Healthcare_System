"""
Test Prediction API with Sample Data
Tests all 3 diseases with 3 test cases each (Low, Medium, High Risk)
"""
import requests
import json
from datetime import datetime

# Backend API URL
BASE_URL = "http://localhost:8000"

# Test data
TEST_DATA = {
    "diabetes": {
        "test_case_1_low_risk": {
            "pregnancies": 0,
            "glucose": 85.0,
            "blood_pressure": 70.0,
            "skin_thickness": 20.0,
            "insulin": 80.0,
            "bmi": 22.5,
            "diabetes_pedigree_function": 0.3,
            "age": 25
        },
        "test_case_2_medium_risk": {
            "pregnancies": 2,
            "glucose": 140.0,
            "blood_pressure": 85.0,
            "skin_thickness": 30.0,
            "insulin": 150.0,
            "bmi": 28.0,
            "diabetes_pedigree_function": 0.5,
            "age": 40
        },
        "test_case_3_high_risk": {
            "pregnancies": 5,
            "glucose": 180.0,
            "blood_pressure": 95.0,
            "skin_thickness": 40.0,
            "insulin": 250.0,
            "bmi": 35.0,
            "diabetes_pedigree_function": 0.8,
            "age": 55
        }
    },
    "heart_disease": {
        "test_case_1_low_risk": {
            "age": 35,
            "sex": 1,
            "chest_pain_type": 0,
            "resting_bp": 120.0,
            "serum_cholesterol": 180.0,
            "fasting_blood_sugar": 0,
            "resting_ecg": 0,
            "max_heart_rate": 180.0,
            "exercise_induced_angina": 0,
            "st_depression": 0.0,
            "slope": 2,
            "num_major_vessels": 0,
            "thalassemia": 3
        },
        "test_case_2_medium_risk": {
            "age": 50,
            "sex": 1,
            "chest_pain_type": 1,
            "resting_bp": 140.0,
            "serum_cholesterol": 240.0,
            "fasting_blood_sugar": 1,
            "resting_ecg": 1,
            "max_heart_rate": 150.0,
            "exercise_induced_angina": 0,
            "st_depression": 1.0,
            "slope": 1,
            "num_major_vessels": 1,
            "thalassemia": 2
        },
        "test_case_3_high_risk": {
            "age": 65,
            "sex": 1,
            "chest_pain_type": 2,
            "resting_bp": 160.0,
            "serum_cholesterol": 280.0,
            "fasting_blood_sugar": 1,
            "resting_ecg": 2,
            "max_heart_rate": 120.0,
            "exercise_induced_angina": 1,
            "st_depression": 2.5,
            "slope": 0,
            "num_major_vessels": 3,
            "thalassemia": 1
        }
    },
    "kidney_disease": {
        "test_case_1_low_risk": {
            "age": 30,
            "blood_pressure": 80.0,
            "specific_gravity": 1.020,
            "albumin": 0.0,
            "sugar": 0.0,
            "red_blood_cells": 0,
            "pus_cell": 0,
            "pus_cell_clumps": 0,
            "bacteria": 0,
            "blood_glucose_random": 90.0,
            "blood_urea": 25.0,
            "serum_creatinine": 0.8,
            "sodium": 140.0,
            "potassium": 4.0,
            "hemoglobin": 15.0,
            "packed_cell_volume": 45.0,
            "white_blood_cell_count": 7000.0,
            "red_blood_cell_count": 5.0,
            "hypertension": 0,
            "diabetes_mellitus": 0,
            "coronary_artery_disease": 0,
            "appetite": 0,
            "pedal_edema": 0,
            "anemia": 0
        },
        "test_case_2_medium_risk": {
            "age": 50,
            "blood_pressure": 140.0,
            "specific_gravity": 1.010,
            "albumin": 1.0,
            "sugar": 1.0,
            "red_blood_cells": 1,
            "pus_cell": 1,
            "pus_cell_clumps": 0,
            "bacteria": 0,
            "blood_glucose_random": 140.0,
            "blood_urea": 50.0,
            "serum_creatinine": 1.5,
            "sodium": 135.0,
            "potassium": 4.5,
            "hemoglobin": 12.0,
            "packed_cell_volume": 38.0,
            "white_blood_cell_count": 9000.0,
            "red_blood_cell_count": 4.5,
            "hypertension": 1,
            "diabetes_mellitus": 1,
            "coronary_artery_disease": 0,
            "appetite": 0,
            "pedal_edema": 0,
            "anemia": 1
        },
        "test_case_3_high_risk": {
            "age": 65,
            "blood_pressure": 180.0,
            "specific_gravity": 1.005,
            "albumin": 4.0,
            "sugar": 4.0,
            "red_blood_cells": 1,
            "pus_cell": 2,
            "pus_cell_clumps": 1,
            "bacteria": 1,
            "blood_glucose_random": 200.0,
            "blood_urea": 150.0,
            "serum_creatinine": 5.0,
            "sodium": 130.0,
            "potassium": 5.5,
            "hemoglobin": 8.0,
            "packed_cell_volume": 25.0,
            "white_blood_cell_count": 12000.0,
            "red_blood_cell_count": 3.0,
            "hypertension": 1,
            "diabetes_mellitus": 1,
            "coronary_artery_disease": 1,
            "appetite": 1,
            "pedal_edema": 1,
            "anemia": 1
        }
    }
}

def test_prediction(disease_type: str, test_case: str, data: dict, token: str):
    """Test a prediction endpoint"""
    endpoint = f"{BASE_URL}/api/v1/predictions/{disease_type}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    print(f"\n{'='*70}")
    print(f"Testing {disease_type.upper()} - {test_case}")
    print(f"{'='*70}")
    print(f"Input Data:")
    for key, value in data.items():
        print(f"  {key}: {value}")
    
    try:
        response = requests.post(endpoint, json=data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Prediction Result:")
            print(f"  Prediction: {result.get('prediction', 'N/A')}")
            print(f"  Risk Percentage: {result.get('risk_percentage', 'N/A')}%")
            print(f"  Risk Level: {result.get('risk_level', 'N/A')}")
            print(f"  Confidence: {result.get('confidence', 'N/A')}%")
            return True
        else:
            print(f"\n❌ Error: {response.status_code}")
            print(f"  {response.text}")
            return False
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        return False

def main():
    """Main test function"""
    print("="*70)
    print("PREDICTION API TEST SUITE")
    print("="*70)
    print(f"Backend URL: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get authentication token
    # You need to login first or use an existing token
    print("\n⚠️  Note: You need to be logged in to test predictions.")
    print("    Option 1: Use existing token from localStorage")
    print("    Option 2: Login first using /api/v1/auth/login")
    
    token = input("\nEnter your auth token (or press Enter to skip): ").strip()
    
    if not token:
        print("\n❌ Token required. Please login first and get token.")
        print("   You can test via frontend forms instead.")
        return
    
    # Test all diseases
    results = {}
    
    for disease_type in ["diabetes", "heart-disease", "kidney-disease"]:
        disease_key = disease_type.replace("-", "_")
        if disease_key not in TEST_DATA:
            continue
            
        results[disease_type] = {}
        
        for test_case, data in TEST_DATA[disease_key].items():
            success = test_prediction(disease_type, test_case, data, token)
            results[disease_type][test_case] = success
    
    # Summary
    print(f"\n{'='*70}")
    print("TEST SUMMARY")
    print(f"{'='*70}")
    
    total_tests = 0
    passed_tests = 0
    
    for disease_type, test_results in results.items():
        print(f"\n{disease_type.upper()}:")
        for test_case, success in test_results.items():
            total_tests += 1
            if success:
                passed_tests += 1
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"  {test_case}: {status}")
    
    print(f"\n{'='*70}")
    print(f"Total: {passed_tests}/{total_tests} tests passed")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()















