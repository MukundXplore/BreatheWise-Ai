Write-Host "Starting BreatheWise AI Dev Servers..." -ForegroundColor Cyan

# Get absolute path of this script
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend Server in a new PowerShell window
Write-Host "Launching Flask Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptPath\backend'; & .\.venv\Scripts\activate; python -m flask --app app.main run --port 8000 --debug"

# Start Frontend Server in a new PowerShell window
Write-Host "Launching React Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptPath\frontend'; npm run dev"

Write-Host "Both servers are launching in separate windows." -ForegroundColor Yellow
Write-Host "1. Backend: http://localhost:8000"
Write-Host "2. Frontend: http://localhost:5173 (usually, check the console output)"
Write-Host "Press any key to exit this helper script..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
