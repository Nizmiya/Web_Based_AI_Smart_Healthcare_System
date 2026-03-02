@echo off
REM Use D: for pip and npm caches so C: doesn't fill up during training
if not exist D:\pip_cache mkdir D:\pip_cache
if not exist D:\npm_cache mkdir D:\npm_cache
set PIP_CACHE_DIR=D:\pip_cache
set NPM_CONFIG_CACHE=D:\npm_cache
echo PIP_CACHE_DIR=%PIP_CACHE_DIR%
echo NPM_CONFIG_CACHE=%NPM_CONFIG_CACHE%
echo.
echo Now run: pip install -r backend\requirements.txt
echo Then: python backend\scripts\retrain_heart_model.py
cmd /k
