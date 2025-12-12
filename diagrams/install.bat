@echo off
echo Installing diagrams library and dependencies...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo Python found!
echo.

REM Install diagrams
echo Installing diagrams library...
pip install diagrams

REM Install graphviz (Python package)
echo Installing graphviz Python package...
pip install graphviz

echo.
echo ========================================
echo Installation complete!
echo.
echo IMPORTANT: You also need to install Graphviz system package:
echo.
echo For Windows:
echo   1. Download from: https://graphviz.org/download/
echo   2. Or use Chocolatey: choco install graphviz
echo   3. Or use Winget: winget install Graphviz.Graphviz -i
echo.
echo After installing Graphviz, add it to your PATH or restart your terminal.
echo ========================================
echo.
pause

