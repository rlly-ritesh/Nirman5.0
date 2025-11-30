# Ollama Setup Instructions

The PadhAI Chat feature uses Ollama with the Mistral AI model to provide intelligent responses.

## Installation

### Windows

1. Download Ollama from: https://ollama.com/download
2. Run the installer
3. Open Command Prompt or PowerShell

### macOS

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Linux

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

## Setup Mistral Model

After installing Ollama, pull the Mistral model:

```bash
ollama pull mistral
```

## Running Ollama

Start Ollama with the Mistral model:

```bash
ollama run mistral
```

This will:
1. Start the Ollama server on `http://localhost:11434`
2. Load the Mistral model
3. Keep it ready for chat requests

## Using PadhAI Chat

1. Make sure Ollama is running with Mistral
2. Navigate to the "PadhAI Chat" section in the dashboard
3. Start chatting with your AI learning assistant!

## Troubleshooting

### Connection Error
If you see "I'm having trouble connecting right now", make sure:
- Ollama is installed
- Ollama is running (`ollama run mistral`)
- Port 11434 is not blocked by your firewall

### Model Not Found
If Ollama can't find the Mistral model:
```bash
ollama pull mistral
ollama run mistral
```

## Alternative Models

You can use other Ollama models by editing `/app/api/chat/route.ts` and changing the model name:

```typescript
model: "mistral",  // Change to: "llama2", "codellama", "phi", etc.
```

Available models: https://ollama.com/library
