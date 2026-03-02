@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
cd /d %~dp0
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8080
pause

