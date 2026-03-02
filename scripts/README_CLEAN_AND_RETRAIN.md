# C: Drive Clean Up & Retrain

## 1. Clean C: drive (free space)

From project root (**D:\DP**):

```powershell
cd D:\DP
python scripts/clean_c_drive.py
```

This removes:
- **Pip cache** (often 500 MB – 2 GB)
- **Npm cache**
- **pip cache purge**
- Project `__pycache__`, `.pytest_cache`, `.mypy_cache`

## 2. Use D: for caches (so C: doesn’t fill again)

**Option A – This terminal only**

```powershell
$env:PIP_CACHE_DIR = "D:\pip_cache"
$env:NPM_CONFIG_CACHE = "D:\npm_cache"
```

**Option B – New terminal with D: caches**

Double‑click or run:

```
scripts\use_d_drive_for_caches.bat
```

Then in that same window:

```powershell
cd D:\DP
pip install -r backend\requirements.txt
python backend\scripts\retrain_heart_model.py
```

## 3. Retrain heart model

Ensure **heart.csv** is in `ml_training/`, then:

```powershell
cd D:\DP
python backend/scripts/retrain_heart_model.py
```

Restart backend and try Heart Disease Prediction again.
