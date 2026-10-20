@echo off
echo ==========================================
echo Starting ORBIT-Q Local Servers
echo ==========================================

echo [1/2] Launching Backend on http://localhost:8000 ...
start "ORBIT-Q Backend" cmd /k "cd /d "%~dp0backend" && (if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat) && python main.py"

echo [2/2] Launching Frontend on http://localhost:5173 ...
start "ORBIT-Q Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 >nul
start http://localhost:5173
echo ==========================================
echo ORBIT-Q is running! Check your browser.
echo ==========================================
