@echo off
:: Terra Agents — Setup y Run del Scraper
:: Ejecutar con doble-click desde Windows
:: ─────────────────────────────────────────

echo.
echo ╔══════════════════════════════════════════╗
echo ║  Terra Agents — Scraper Setup            ║
echo ╚══════════════════════════════════════════╝
echo.

:: Verificar Python
python --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no encontrado.
    echo Descarga Python 3.11+ desde https://python.org
    pause
    exit /b 1
)

:: Instalar dependencias
echo [1/3] Instalando dependencias...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR al instalar requirements.txt
    pause
    exit /b 1
)

:: Instalar Chromium para Playwright
echo [2/3] Instalando Chromium (Playwright)...
playwright install chromium
if errorlevel 1 (
    echo ERROR al instalar Chromium
    pause
    exit /b 1
)

:: Ejecutar scraper
echo [3/3] Iniciando scraper...
echo.
echo Opciones disponibles:
echo   python scraper.py           (ejecucion normal)
echo   python scraper.py --enrich  (+ click-to-reveal phones, mas lento)
echo   python scraper.py --fresh   (borra CSV anterior y empieza de cero)
echo.
set /p OPTS="Opciones adicionales (Enter para ninguna): "

python scraper.py %OPTS%

echo.
echo ─────────────────────────────────────────
echo Scraper finalizado. Revisa prospectos-raw.csv
echo ─────────────────────────────────────────
pause
