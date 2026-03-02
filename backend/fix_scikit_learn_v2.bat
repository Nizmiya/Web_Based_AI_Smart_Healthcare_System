@echo off
echo ========================================
echo Fixing Scikit-Learn Version (Python 3.13 Compatible)
echo ========================================
echo.
echo Python 3.13 requires newer scikit-learn with pre-built wheels.
echo.
echo Option 1: Install compatible newer version (Recommended)
echo Option 2: Retrain models with current version
echo.
echo Trying Option 1: Installing scikit-learn 1.5.0+ (has Python 3.13 wheels)
echo.
pip uninstall scikit-learn -y
echo.
echo Installing scikit-learn 1.5.0 (compatible with Python 3.13)...
pip install scikit-learn==1.5.0
echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Installed scikit-learn 1.5.0
    echo ========================================
    echo.
    echo NOTE: You may need to retrain models with this version.
    echo If models still don't work, retrain them.
    echo.
) else (
    echo.
    echo ========================================
    echo Installation failed. Trying alternative...
    echo ========================================
    echo.
    echo Installing latest scikit-learn...
    pip install scikit-learn
    echo.
    echo ========================================
    echo Installed latest scikit-learn
    echo You MUST retrain models now!
    echo ========================================
)
echo.
pause















