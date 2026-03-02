@echo off
echo ========================================
echo Fixing Scikit-Learn Version Mismatch
echo ========================================
echo.
echo Current version: 1.7.2
echo Required version: 1.3.2
echo.
echo Uninstalling current version...
pip uninstall scikit-learn -y
echo.
echo Installing required version...
pip install scikit-learn==1.3.2
echo.
echo ========================================
echo Done! Please restart backend.
echo ========================================
pause















