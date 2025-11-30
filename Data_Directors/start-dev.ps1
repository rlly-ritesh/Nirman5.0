# PadhAI Development Server Starter (Windows)
# Starts both Python backend and Next.js frontend

param(
    [switch]$BackendOnly = $false,
    [switch]$FrontendOnly = $false
)

$ErrorActionPreference = "Stop"

# Colors
$RESET = "`e[0m"
$RED = "`e[31m"
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"

function Write-Title {
    Write-Host ""
    Write-Host "$BLUE╔════════════════════════════════════════════════════════╗$RESET" -ForegroundColor Blue
    Write-Host "$BLUE║        PadhAI - Integrated Backend & Frontend          ║$RESET" -ForegroundColor Blue
    Write-Host "$BLUE╚════════════════════════════════════════════════════════╝$RESET" -ForegroundColor Blue
    Write-Host ""
}

function Check-Command {
    param([string]$Command, [string]$Name)
    
    try {
        if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
            Write-Host "$RED✗ $Name not found. Please install it.${RESET}" -ForegroundColor Red
            return $false
        }
        return $true
    }
    catch {
        Write-Host "$RED✗ $Name not found. Please install it.${RESET}" -ForegroundColor Red
        return $false
    }
}

function Check-Ollama {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Banner
Write-Title

# Check prerequisites
Write-Host "$YELLOW Checking prerequisites...${RESET}" -ForegroundColor Yellow

$checks = @(
    @{ Command = "python"; Name = "Python 3" },
    @{ Command = "node"; Name = "Node.js" },
    @{ Command = "npm"; Name = "npm" }
)

$allChecked = $true
foreach ($check in $checks) {
    if (Check-Command $check.Command $check.Name) {
        Write-Host "$GREEN✓ $($check.Name) found$RESET" -ForegroundColor Green
    }
    else {
        $allChecked = $false
    }
}

if (-not $allChecked) {
    Write-Host ""
    Write-Host "$RED✗ Missing required tools$RESET" -ForegroundColor Red
    exit 1
}

# Check Ollama
Write-Host ""
Write-Host "$YELLOW Checking Ollama...${RESET}" -ForegroundColor Yellow
if (Check-Ollama) {
    Write-Host "$GREEN✓ Ollama is running$RESET" -ForegroundColor Green
}
else {
    Write-Host "$YELLOW⚠ Ollama is not running$RESET" -ForegroundColor Yellow
    Write-Host "$YELLOW  Please start Ollama separately:$RESET" -ForegroundColor Yellow
    Write-Host "$YELLOW  ollama serve$RESET" -ForegroundColor Yellow
}

Write-Host ""

# Function to cleanup on exit
$childProcesses = @()

function Cleanup-Processes {
    Write-Host ""
    Write-Host "$YELLOW Shutting down...${RESET}" -ForegroundColor Yellow
    foreach ($proc in $childProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "$GREEN✓ Stopped process $($proc.Id)$RESET" -ForegroundColor Green
        }
        catch {
            # Process already stopped
        }
    }
}

$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup-Processes }

# Start Backend (unless FrontendOnly)
if (-not $FrontendOnly) {
    Write-Host "$BLUE Starting Python backend...${RESET}" -ForegroundColor Blue
    
    $backendProcess = Start-Process -FilePath "python" -ArgumentList "backend.py --port 5000" -PassThru -NoNewWindow
    $childProcesses += $backendProcess
    
    Write-Host "$GREEN✓ Backend started (PID: $($backendProcess.Id))$RESET" -ForegroundColor Green
    
    # Wait for backend to start
    Start-Sleep -Seconds 2
}

# Start Frontend (unless BackendOnly)
if (-not $BackendOnly) {
    Write-Host ""
    Write-Host "$BLUE Starting Next.js frontend...${RESET}" -ForegroundColor Blue
    
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -PassThru -NoNewWindow
    $childProcesses += $frontendProcess
    
    Write-Host "$GREEN✓ Frontend started (PID: $($frontendProcess.Id))$RESET" -ForegroundColor Green
}

# Display info
Write-Host ""
Write-Host "$GREEN╔════════════════════════════════════════════════════════╗$RESET" -ForegroundColor Green
Write-Host "$GREEN║            Both servers are running!                   ║$RESET" -ForegroundColor Green
Write-Host "$GREEN╠════════════════════════════════════════════════════════╣$RESET" -ForegroundColor Green

if (-not $FrontendOnly) {
    Write-Host "$GREEN║ Backend:  http://localhost:5000                        ║$RESET" -ForegroundColor Green
}

if (-not $BackendOnly) {
    Write-Host "$GREEN║ Frontend: http://localhost:3000                        ║$RESET" -ForegroundColor Green
}

Write-Host "$GREEN║                                                        ║$RESET" -ForegroundColor Green
Write-Host "$GREEN║ Press Ctrl+C to stop all servers                       ║$RESET" -ForegroundColor Green
Write-Host "$GREEN╚════════════════════════════════════════════════════════╝$RESET" -ForegroundColor Green
Write-Host ""

# Wait for processes to finish
foreach ($proc in $childProcesses) {
    $proc.WaitForExit()
}

Write-Host "$YELLOW Exited.$RESET" -ForegroundColor Yellow
