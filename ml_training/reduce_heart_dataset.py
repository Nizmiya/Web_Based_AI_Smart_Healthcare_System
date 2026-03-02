"""
Reduce heart disease dataset from ~6 lakh rows to 1.5 lakh (150,000) rows.
Stratified by target; normalizes column names and converts 'Heart Disease' to binary target (0/1).
Saves as heart_disease.csv (no "150k" in filename). Old big file is replaced.
Run from ml_training: python reduce_heart_dataset.py
"""
import os
import pandas as pd

ML_TRAINING_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(ML_TRAINING_DIR, "heart_disease.csv")
OUTPUT_FILE = os.path.join(ML_TRAINING_DIR, "heart_disease.csv")
TARGET_SIZE = 150_000

COLUMN_MAP = {
    "age": "age", "sex": "sex", "chest_pain_type": "cp", "bp": "trestbps",
    "cholesterol": "chol", "fbs_over_120": "fbs", "ekg_results": "restecg",
    "max_hr": "thalach", "exercise_angina": "exang", "st_depression": "oldpeak",
    "slope_of_st": "slope", "number_of_vessels_fluro": "ca", "thallium": "thal",
    "heart_disease": "target",
}

def normalize(df):
    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_").replace("-", "_") for c in df.columns]
    if "id" in df.columns:
        df = df.drop(columns=["id"])
    rename = {k: v for k, v in COLUMN_MAP.items() if k in df.columns and k != v}
    df = df.rename(columns=rename)
    if "target" in df.columns:
        col = df["target"]
        if col.dtype == object or col.dtype.name == "string":
            df["target"] = (col.astype(str).str.strip().str.lower() == "presence").astype(int)
        else:
            df["target"] = (df["target"] > 0).astype(int)
    return df

def main():
    if not os.path.isfile(INPUT_FILE):
        print(f"ERROR: {INPUT_FILE} not found.")
        return

    print(f"Loading {INPUT_FILE} ...")
    df = pd.read_csv(INPUT_FILE)
    n_original = len(df)
    print(f"Original rows: {n_original}")

    df = normalize(df)
    target_col = "target" if "target" in df.columns else None

    if n_original <= TARGET_SIZE:
        print(f"Already <= {TARGET_SIZE} rows. Saving to {OUTPUT_FILE}")
        df.to_csv(OUTPUT_FILE, index=False)
        print("Done.")
        return

    if target_col is not None:
        frac = TARGET_SIZE / n_original
        sampled = df.groupby(target_col, group_keys=False).apply(
            lambda g: g.sample(frac=frac, random_state=42)
        ).reset_index(drop=True)
        if len(sampled) > TARGET_SIZE:
            sampled = sampled.sample(n=TARGET_SIZE, random_state=42)
        elif len(sampled) < TARGET_SIZE:
            need = TARGET_SIZE - len(sampled)
            extra = df.drop(sampled.index).sample(n=min(need, len(df) - len(sampled)), random_state=43)
            sampled = pd.concat([sampled, extra], ignore_index=True)
    else:
        sampled = df.sample(n=TARGET_SIZE, random_state=42)

    sampled.to_csv(OUTPUT_FILE, index=False)
    print(f"Saved {len(sampled)} rows to {OUTPUT_FILE} (old dataset replaced)")
    if target_col:
        print("Target distribution:", sampled[target_col].value_counts().to_dict())
    print("Done. Use heart_disease.csv in the training notebook.")

if __name__ == "__main__":
    main()
