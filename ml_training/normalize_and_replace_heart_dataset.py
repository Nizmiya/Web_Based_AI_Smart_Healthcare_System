"""
One-time: Read heart_disease_150k.csv, normalize columns, convert 'Heart Disease' to binary target (0/1),
save as heart_disease.csv (replaces old 6L file), then remove heart_disease_150k.csv.
Run from ml_training: python normalize_and_replace_heart_dataset.py
"""
import os
import pandas as pd

ML_TRAINING_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_150K = os.path.join(ML_TRAINING_DIR, "heart_disease_150k.csv")
OUTPUT_MAIN = os.path.join(ML_TRAINING_DIR, "heart_disease.csv")

# Actual CSV columns -> standard names (after lower + replace spaces: chest_pain_type, bp, heart_disease, etc.)
COLUMN_MAP = {
    "age": "age",
    "sex": "sex",
    "chest_pain_type": "cp",
    "bp": "trestbps",
    "cholesterol": "chol",
    "fbs_over_120": "fbs",
    "ekg_results": "restecg",
    "max_hr": "thalach",
    "exercise_angina": "exang",
    "st_depression": "oldpeak",
    "slope_of_st": "slope",
    "number_of_vessels_fluro": "ca",
    "thallium": "thal",
    "heart_disease": "target",
}

def main():
    if not os.path.isfile(INPUT_150K):
        print(f"ERROR: {INPUT_150K} not found.")
        return

    print(f"Loading {INPUT_150K} ...")
    df = pd.read_csv(INPUT_150K)

    # Normalize column names: strip, lower, spaces -> underscores
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]

    # Drop id if present
    if "id" in df.columns:
        df = df.drop(columns=["id"])

    # Map to standard names
    rename = {}
    for old, new in COLUMN_MAP.items():
        if old in df.columns and old != new:
            rename[old] = new
    df = df.rename(columns=rename)

    # Convert "Heart Disease" (now "target") to binary: Absence=0, Presence=1
    if "target" in df.columns:
        col = df["target"]
        if col.dtype == object or col.dtype.name == "string":
            df["target"] = (col.astype(str).str.strip().str.lower() == "presence").astype(int)
        else:
            df["target"] = (df["target"] > 0).astype(int)
        print("Target (binary):", df["target"].value_counts().to_dict())

    df.to_csv(OUTPUT_MAIN, index=False)
    print(f"Saved {len(df)} rows to {OUTPUT_MAIN}")

    os.remove(INPUT_150K)
    print(f"Removed {INPUT_150K} (no more '150k' in filename).")
    print("Done. Use heart_disease.csv in the notebook.")

if __name__ == "__main__":
    main()
