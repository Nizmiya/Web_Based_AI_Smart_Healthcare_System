"""
Retrain heart disease model with current NumPy/sklearn so saved .pkl loads in this environment.
Run from project root: python backend/scripts/retrain_heart_model.py
Or from backend: python scripts/retrain_heart_model.py
"""
import os
import sys
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Paths: support run from D:\\DP or D:\\DP\\backend
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

def find_heart_csv():
    candidates = [
        os.path.join(PROJECT_ROOT, "ml_training", "heart_disease.csv"),
        os.path.join(PROJECT_ROOT, "ml_training", "heart.csv"),
        os.path.join(BACKEND_DIR, "heart_disease.csv"),
        os.path.join(BACKEND_DIR, "heart.csv"),
        os.path.join(PROJECT_ROOT, "heart.csv"),
        "heart_disease.csv",
        "heart.csv",
    ]
    for p in candidates:
        if os.path.isfile(p):
            return p
    return None

REQUIRED_COLS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal", "target",
]
ALIAS_MAP = {
    "chest_pain_type": "cp", "resting_bp": "trestbps", "serum_cholesterol": "chol",
    "fasting_blood_sugar": "fbs", "resting_ecg": "restecg", "max_heart_rate": "thalach",
    "exercise_induced_angina": "exang", "st_depression": "oldpeak",
    "num_major_vessels": "ca", "thalassemia": "thal",
}
FEATURE_ORDER = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]

def main():
    csv_path = find_heart_csv()
    if not csv_path:
        print("ERROR: heart_disease.csv not found. Place heart_disease.csv in ml_training/.")
        print("Tried:", [os.path.abspath(p) for p in [
            os.path.join(PROJECT_ROOT, "ml_training", "heart.csv"),
            os.path.join(BACKEND_DIR, "heart.csv"),
        ]])
        sys.exit(1)

    print("Using dataset:", os.path.abspath(csv_path))
    df = pd.read_csv(csv_path)

    # Normalize column names
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]
    for src, dst in ALIAS_MAP.items():
        if src in df.columns and dst not in df.columns:
            df = df.rename(columns={src: dst})

    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        print("ERROR: Missing columns:", missing)
        sys.exit(1)

    raw = df[REQUIRED_COLS].copy()
    for col in REQUIRED_COLS:
        raw[col] = pd.to_numeric(raw[col], errors="coerce")
    raw.fillna(raw.median(numeric_only=True), inplace=True)
    raw["target"] = (raw["target"] > 0).astype(int)

    X = raw[FEATURE_ORDER]
    y = raw["target"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = GradientBoostingClassifier(random_state=42)
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print("Test accuracy:", round(acc, 4), f"({acc*100:.2f}%)")
    print(classification_report(y_test, y_pred))

    out_dir = os.path.join(BACKEND_DIR, "ml_models")
    os.makedirs(out_dir, exist_ok=True)
    model_path = os.path.join(out_dir, "heart_disease_model.pkl")
    scaler_path = os.path.join(out_dir, "heart_disease_scaler.pkl")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print("Saved:", model_path, scaler_path)
    print("Restart the backend and try Heart Disease Prediction again.")

if __name__ == "__main__":
    main()
