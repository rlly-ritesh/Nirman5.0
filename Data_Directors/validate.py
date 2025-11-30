#!/usr/bin/env python3
"""
Validation script for PadhAI Backend Integration
Checks all prerequisites and system status
"""

import sys
import subprocess
import json
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: requests package required. Install with: pip install requests")
    sys.exit(1)


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def check(condition, message):
    """Print check result"""
    if condition:
        print(f"{Colors.GREEN}✓{Colors.RESET} {message}")
        return True
    else:
        print(f"{Colors.RED}✗{Colors.RESET} {message}")
        return False


def print_header(text):
    """Print section header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print("─" * 60)


def check_command(cmd, name):
    """Check if command is available"""
    try:
        subprocess.run([cmd, "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def check_port(port):
    """Check if port is accessible"""
    try:
        response = requests.get(f"http://localhost:{port}/", timeout=2)
        return True
    except:
        return False


def check_ollama_models():
    """Check available Ollama models"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get("models", [])
            return [m.get("name") for m in models]
    except:
        pass
    return None


def main():
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔════════════════════════════════════════════════════════╗")
    print("║    PadhAI Backend Integration - Validation Script      ║")
    print("╚════════════════════════════════════════════════════════╝")
    print(Colors.RESET)

    all_ok = True

    # 1. Python Prerequisites
    print_header("1. Python Prerequisites")

    all_ok &= check(check_command("python", "Python"), "Python 3 installed")
    all_ok &= check(check_command("pip", "pip"), "pip installed")

    try:
        import requests
        all_ok &= check(True, "requests package installed")
    except ImportError:
        all_ok &= check(False, "requests package installed")

    # 2. Node.js Prerequisites
    print_header("2. Node.js Prerequisites")

    all_ok &= check(check_command("node", "Node"), "Node.js installed")
    all_ok &= check(check_command("npm", "npm"), "npm installed")

    # 3. Project Files
    print_header("3. Project Files")

    files = [
        ("backend.py", "Backend server"),
        ("main.py", "CLI application"),
        ("start-dev.ps1", "Windows starter"),
        ("start-dev.sh", "Unix starter"),
        ("graph-viz-fixed.html", "Graph visualization"),
        ("package.json", "NPM configuration"),
    ]

    for filename, description in files:
        filepath = Path(filename)
        all_ok &= check(filepath.exists(), f"{description} ({filename})")

    # 4. API Routes
    print_header("4. API Routes")

    routes = [
        ("app/api/chat/route.ts", "Chat endpoint"),
        ("app/api/notes/generate/route.ts", "Notes generation"),
        ("app/api/notes/list/route.ts", "List notes"),
        ("app/api/notes/load/route.ts", "Load notes"),
        ("app/api/conversation/reset/route.ts", "Reset conversation"),
    ]

    for filepath, description in routes:
        all_ok &= check(Path(filepath).exists(), f"{description} ({filepath})")

    # 5. Components
    print_header("5. React Components")

    components = [
        ("components/chatbot.tsx", "Chatbot component"),
        ("app/dashboard/ai-integration/page.tsx", "Integration demo page"),
    ]

    for filepath, description in components:
        all_ok &= check(Path(filepath).exists(), f"{description} ({filepath})")

    # 6. Documentation
    print_header("6. Documentation")

    docs = [
        ("BACKEND_INTEGRATION.md", "Backend integration guide"),
        ("SETUP_GUIDE.md", "Setup instructions"),
        ("INTEGRATION_SUMMARY.md", "Integration summary"),
    ]

    for filepath, description in docs:
        all_ok &= check(Path(filepath).exists(), f"{description} ({filepath})")

    # 7. Port Availability
    print_header("7. Port Availability")

    ports = {
        3000: "Frontend (Next.js)",
        5000: "Backend (Python)",
        11434: "Ollama"
    }

    port_ok = True
    for port, service in ports.items():
        try:
            requests.get(f"http://localhost:{port}/", timeout=1)
            print(f"⚠  {service} - port {port} in use (should stop before starting)")
            port_ok = False
        except:
            check(True, f"{service} - port {port} available")

    all_ok &= port_ok

    # 8. Ollama Status
    print_header("8. Ollama Status")

    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            models = check_ollama_models()
            if models:
                print(f"{Colors.GREEN}✓{Colors.RESET} Ollama is running")
                print(f"  Available models: {', '.join(models)}")

                if any("mistral" in m for m in models):
                    all_ok &= check(True, "Mistral model available")
                else:
                    all_ok &= check(False, "Mistral model available")
            else:
                print(f"{Colors.RED}✗{Colors.RESET} No models available")
                all_ok = False
        else:
            all_ok &= check(False, "Ollama is running")
    except:
        all_ok &= check(False, "Ollama is running")

    # 9. Summary
    print_header("Summary")

    if all_ok:
        print(f"{Colors.GREEN}{Colors.BOLD}✓ All checks passed!{Colors.RESET}")
        print("\nYou can now start the application:")
        print(f"  Windows:  {Colors.BLUE}.\start-dev.ps1{Colors.RESET}")
        print(f"  Unix:     {Colors.BLUE}bash start-dev.sh{Colors.RESET}")
        return 0
    else:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠ Some checks failed{Colors.RESET}")
        print("\nPlease fix the issues above before starting the application.")
        print("\nNext steps:")
        print(f"  1. Ensure Python 3 is installed: {Colors.BLUE}python --version{Colors.RESET}")
        print(f"  2. Install requests: {Colors.BLUE}pip install requests{Colors.RESET}")
        print(f"  3. Ensure Node.js is installed: {Colors.BLUE}node --version{Colors.RESET}")
        print(f"  4. Start Ollama: {Colors.BLUE}ollama serve{Colors.RESET}")
        print(f"  5. Pull Mistral: {Colors.BLUE}ollama pull mistral{Colors.RESET}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
