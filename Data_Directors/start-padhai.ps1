# PadhAI Startup Script
Write-Host "🚀 Starting PadhAI Services..." -ForegroundColor Cyan

# Start Ollama (if not running)
$ollamaProcess = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if (!$ollamaProcess) {
    Write-Host "Starting Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

# Start Python Backend
Write-Host "Starting Python Backend (port 5000)..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "backend.py" -WindowStyle Normal

# Start Graph Visualization Server
Write-Host "Starting Graph Server (port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "main.py --serve" -WindowStyle Normal

# Start Next.js Frontend
Write-Host "Starting Next.js App (port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ PadhAI is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend:       http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API:    http://localhost:5000" -ForegroundColor Cyan
Write-Host "📊 Graph Viz:      http://localhost:8000" -ForegroundColor Cyan
Write-Host "🤖 Ollama:         http://localhost:11434" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Keep script running
Wait-Event
