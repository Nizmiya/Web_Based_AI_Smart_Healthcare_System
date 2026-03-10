## Risk‑level test data for three diseases

Below are **example test inputs taken from the project datasets** for all three diseases.  
Each disease has **4 sample records** covering **Low, Medium, High, Critical** risk scenarios (conceptual – actual risk level is determined by the trained model and threshold).

---

## 1. Diabetes – example API test bodies

Source: `ml_training/diabetes.csv`

### 1.1 Diabetes – Low risk (clear negative)

CSV row: `L3` (`Outcome = 0`)

```json
{
  "pregnancies": 1,
  "glucose": 85.0,
  "blood_pressure": 66.0,
  "skin_thickness": 29.0,
  "insulin": 0.0,
  "bmi": 26.6,
  "diabetes_pedigree_function": 0.351,
  "age": 31
}
```

### 1.2 Diabetes – Medium risk (borderline negative)

CSV row: `L23` (`Outcome = 0`, glucose and BMI slightly higher)

```json
{
  "pregnancies": 8,
  "glucose": 99.0,
  "blood_pressure": 84.0,
  "skin_thickness": 0.0,
  "insulin": 0.0,
  "bmi": 35.4,
  "diabetes_pedigree_function": 0.388,
  "age": 50
}
```

### 1.3 Diabetes – High risk (positive with moderately high glucose)

CSV row: `L33` (`Outcome = 1`)

```json
{
  "pregnancies": 3,
  "glucose": 158.0,
  "blood_pressure": 76.0,
  "skin_thickness": 36.0,
  "insulin": 245.0,
  "bmi": 31.6,
  "diabetes_pedigree_function": 0.851,
  "age": 28
}
```

### 1.4 Diabetes – Critical risk (very high glucose & insulin)

CSV row: `L10` (`Outcome = 1`)

```json
{
  "pregnancies": 2,
  "glucose": 197.0,
  "blood_pressure": 70.0,
  "skin_thickness": 45.0,
  "insulin": 543.0,
  "bmi": 30.5,
  "diabetes_pedigree_function": 0.158,
  "age": 53
}
```

---

## 2. Heart disease – example API test bodies

Source: `ml_training/heart_disease.csv`  
API field mapping:  
`age, sex, cp -> chest_pain_type, trestbps -> resting_bp, chol -> serum_cholesterol, fbs -> fasting_blood_sugar, restecg -> resting_ecg, thalach -> max_heart_rate, exang -> exercise_induced_angina, oldpeak -> st_depression, slope, ca -> num_major_vessels, thal -> thalassemia`

### 2.1 Heart – Low risk (negative)

CSV row: `L2` (`target = 0`)

```json
{
  "age": 57,
  "sex": 1,
  "chest_pain_type": 2,
  "resting_bp": 120,
  "serum_cholesterol": 177,
  "fasting_blood_sugar": 0,
  "resting_ecg": 0,
  "max_heart_rate": 132,
  "exercise_induced_angina": 0,
  "st_depression": 1.2,
  "slope": 2,
  "num_major_vessels": 0,
  "thalassemia": 3
}
```

### 2.2 Heart – Medium risk (borderline)

CSV row: `L30` (`target = 0`, but higher cholesterol)

```json
{
  "age": 52,
  "sex": 0,
  "chest_pain_type": 3,
  "resting_bp": 150,
  "serum_cholesterol": 226,
  "fasting_blood_sugar": 0,
  "resting_ecg": 2,
  "max_heart_rate": 162,
  "exercise_induced_angina": 0,
  "st_depression": 0.9,
  "slope": 1,
  "num_major_vessels": 0,
  "thalassemia": 3
}
```

### 2.3 Heart – High risk (positive)

CSV row: `L29` (`target = 1`)

```json
{
  "age": 60,
  "sex": 1,
  "chest_pain_type": 4,
  "resting_bp": 110,
  "serum_cholesterol": 197,
  "fasting_blood_sugar": 0,
  "resting_ecg": 2,
  "max_heart_rate": 158,
  "exercise_induced_angina": 1,
  "st_depression": 2.0,
  "slope": 2,
  "num_major_vessels": 3,
  "thalassemia": 7
}
```

### 2.4 Heart – Critical risk (very abnormal values)

CSV row: `L35` (`target = 1`, low max HR, high cholesterol and symptoms)

```json
{
  "age": 65,
  "sex": 1,
  "chest_pain_type": 4,
  "resting_bp": 140,
  "serum_cholesterol": 277,
  "fasting_blood_sugar": 0,
  "resting_ecg": 0,
  "max_heart_rate": 105,
  "exercise_induced_angina": 1,
  "st_depression": 1.8,
  "slope": 2,
  "num_major_vessels": 1,
  "thalassemia": 7
}
```

---

## 3. Kidney disease – example API test bodies

Source: `ml_training/kidney_disease.csv`  
API field mapping: dataset columns → model fields (age, bp, sg, al, su, rbc, pc, pcc, ba, bgr, bu, sc, sod, pot, hemo, pcv, wc, rc, htn, dm, cad, appet, pe, ane).

### 3.1 Kidney – Low risk (notckd)

CSV row: `L43` (`classification = notckd`)

```json
{
  "age": 45,
  "blood_pressure": 70.0,
  "specific_gravity": 1.01,
  "albumin": 0.0,
  "sugar": 0.0,
  "red_blood_cells": "",
  "pus_cell": "normal",
  "pus_cell_clumps": "notpresent",
  "bacteria": "notpresent",
  "blood_glucose_random": null,
  "blood_urea": 20.0,
  "serum_creatinine": 0.7,
  "sodium": null,
  "potassium": null,
  "hemoglobin": 15.0,
  "packed_cell_volume": 45,
  "white_blood_cell_count": 8600,
  "red_blood_cell_count": null,
  "hypertension": "no",
  "diabetes_mellitus": "no",
  "coronary_artery_disease": "no",
  "appetite": "good",
  "pedal_edema": "no",
  "anemia": "no"
}
```

> Note: `null` can be sent as `0` or a reasonable default if your frontend doesn’t allow nulls.

### 3.2 Kidney – Medium risk (borderline notckd/ckd)

CSV row: `L48` (`classification = ckd`, but mild values)

```json
{
  "age": 48,
  "blood_pressure": 70.0,
  "specific_gravity": 1.015,
  "albumin": 0.0,
  "sugar": 0.0,
  "red_blood_cells": "",
  "pus_cell": "normal",
  "pus_cell_clumps": "notpresent",
  "bacteria": "notpresent",
  "blood_glucose_random": 124.0,
  "blood_urea": 24.0,
  "serum_creatinine": 1.2,
  "sodium": 142.0,
  "potassium": 4.2,
  "hemoglobin": 12.4,
  "packed_cell_volume": 37,
  "white_blood_cell_count": 6400,
  "red_blood_cell_count": 4.7,
  "hypertension": "no",
  "diabetes_mellitus": "yes",
  "coronary_artery_disease": "no",
  "appetite": "good",
  "pedal_edema": "no",
  "anemia": "no"
}
```

### 3.3 Kidney – High risk (ckd)

CSV row: `L22` (`classification = ckd`, clearly abnormal labs)

```json
{
  "age": 61,
  "blood_pressure": 80.0,
  "specific_gravity": 1.015,
  "albumin": 2.0,
  "sugar": 0.0,
  "red_blood_cells": "abnormal",
  "pus_cell": "abnormal",
  "pus_cell_clumps": "notpresent",
  "bacteria": "notpresent",
  "blood_glucose_random": 173.0,
  "blood_urea": 148.0,
  "serum_creatinine": 3.9,
  "sodium": 135.0,
  "potassium": 5.2,
  "hemoglobin": 7.7,
  "packed_cell_volume": 24,
  "white_blood_cell_count": 9200,
  "red_blood_cell_count": 3.2,
  "hypertension": "yes",
  "diabetes_mellitus": "yes",
  "coronary_artery_disease": "yes",
  "appetite": "poor",
  "pedal_edema": "yes",
  "anemia": "yes"
}
```

### 3.4 Kidney – Critical risk (severely abnormal)

CSV row: `L58` (`classification = ckd`, very high urea/creatinine)

```json
{
  "age": 76,
  "blood_pressure": 70.0,
  "specific_gravity": 1.015,
  "albumin": 3.0,
  "sugar": 4.0,
  "red_blood_cells": "normal",
  "pus_cell": "abnormal",
  "pus_cell_clumps": "present",
  "bacteria": "notpresent",
  "blood_glucose_random": null,
  "blood_urea": 164.0,
  "serum_creatinine": 9.7,
  "sodium": 131.0,
  "potassium": 4.4,
  "hemoglobin": 10.2,
  "packed_cell_volume": 30,
  "white_blood_cell_count": 11300,
  "red_blood_cell_count": 3.4,
  "hypertension": "yes",
  "diabetes_mellitus": "yes",
  "coronary_artery_disease": "yes",
  "appetite": "poor",
  "pedal_edema": "yes",
  "anemia": "no"
}
```

---

These 12 bodies can be used in Postman or your frontend forms to **demonstrate all three diseases and all four conceptual risk levels (Low, Medium, High, Critical)** during your viva and screen‑recording. 

