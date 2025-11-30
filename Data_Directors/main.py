#!/usr/bin/env python3
"""
main.py - Integrated Ollama Mistral Note Management System

This is a unified application combining:
1. Interactive Chatbot (chat_interactive)
2. Note Generator (generate_notes)
3. Graph Visualization Server (serve_graph)

All-in-one solution for:
- Interactive conversations with Mistral
- Generate structured notes with tags
- Visualize note relationships in an interactive D3 graph
- Save and manage generated content

Usage:
    python main.py                          # Run interactive chatbot
    python main.py --generate "Topic"       # Generate notes directly
    python main.py --serve                  # Start graph visualization server
    python main.py --help                   # Show all options
"""

import argparse
import json
import os
import sys
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import requests
except ImportError:
    print("Error: 'requests' package not found. Install with: pip install requests")
    sys.exit(1)


# ============================================================================
# CORE API CLIENT
# ============================================================================

class MistralAPI:
    """Low-level Mistral API client."""

    def __init__(self, timeout_sec: int = 60, verbose: bool = False):
        self.timeout_sec = timeout_sec
        self.verbose = verbose

    def log(self, msg: str) -> None:
        """Print debug message."""
        if self.verbose:
            print(f"[DEBUG] {msg}", file=sys.stderr)

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "mistral",
        temperature: float = 0.7,
    ) -> Optional[str]:
        """Send a chat request."""
        body = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }

        try:
            self.log(f"Calling chat API: http://localhost:11434/api/chat")
            resp = requests.post(
                "http://localhost:11434/api/chat",
                json=body,
                timeout=self.timeout_sec,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()

            response_data = resp.json()
            if "message" in response_data and "content" in response_data["message"]:
                return response_data["message"]["content"]
            return None

        except requests.ConnectionError:
            print(
                "✗ Connection error: Ollama not reachable at http://localhost:11434",
                file=sys.stderr,
            )
            return None
        except requests.Timeout:
            print(f"✗ Request timed out after {self.timeout_sec}s", file=sys.stderr)
            return None
        except requests.RequestException as e:
            print(f"✗ API error: {e}", file=sys.stderr)
            return None

    def generate(
        self,
        prompt: str,
        model: str = "mistral",
        temperature: float = 0.7,
    ) -> Optional[str]:
        """Send a generate request."""
        body = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": temperature},
        }

        try:
            self.log(f"Calling generate API: http://localhost:11434/api/generate")
            resp = requests.post(
                "http://localhost:11434/api/generate",
                json=body,
                timeout=self.timeout_sec,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()

            response_data = resp.json()
            return response_data.get("response", "")

        except requests.ConnectionError:
            print(
                "✗ Connection error: Ollama not reachable at http://localhost:11434",
                file=sys.stderr,
            )
            return None
        except requests.Timeout:
            print(f"✗ Request timed out after {self.timeout_sec}s", file=sys.stderr)
            return None
        except requests.RequestException as e:
            print(f"✗ API error: {e}", file=sys.stderr)
            return None


# ============================================================================
# NOTE MANAGEMENT
# ============================================================================

class NotesManager:
    """Handles note generation and storage."""

    def __init__(self, api: MistralAPI, output_dir: str = "./output", model: str = "mistral"):
        self.api = api
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.model = model

    def generate(self, topic: str, count: int = 5) -> Optional[List[Dict[str, Any]]]:
        """Generate notes on a topic."""
        prompt = f"""You are a note generator. Based on this main topic, generate {count} related sub-topics as notes with interconnected tags.

Main Topic: {topic}

Generate notes in this exact JSON format (array only, no extra text):
[
  {{"id": "Sub-topic 1", "tags": ["main-category", "sub-category", "related-concept"]}},
  {{"id": "Sub-topic 2", "tags": ["main-category", "different-aspect", "related-concept"]}}
]

Requirements:
- Generate exactly {count} notes
- "id" should be specific sub-topics or concepts RELATED to the main topic
- "tags" should include main category tag (common to all), specific sub-category tags, and linking tags
- Use tags to create connections between notes (common tags = related notes)
- All tags lowercase with hyphens
- Output ONLY valid JSON array, no markdown or commentary"""

        raw_response = self.api.generate(prompt, self.model)
        if not raw_response:
            return None

        # Parse JSON
        notes = self._parse_json(raw_response)
        if not notes:
            return None

        # Validate
        if not isinstance(notes, list):
            print("✗ Response is not a list", file=sys.stderr)
            return None

        for note in notes:
            if not isinstance(note, dict) or "id" not in note or "tags" not in note:
                print("✗ Invalid note format", file=sys.stderr)
                return None
            if not isinstance(note["tags"], list) or not note["tags"]:
                print("✗ Tags must be non-empty list", file=sys.stderr)
                return None

        return notes

    def save(self, notes: List[Dict[str, Any]]) -> Optional[Path]:
        """Save notes to file."""
        if not notes:
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = self.output_dir / f"notes_{timestamp}.json"

        try:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(notes, f, indent=2, ensure_ascii=False)
            print(f"✓ Saved {len(notes)} note(s) to: {filename}")
            return filename
        except IOError as e:
            print(f"✗ Failed to save notes: {e}", file=sys.stderr)
            return None

    def list_saved(self) -> List[Path]:
        """List all saved note files."""
        if not self.output_dir.exists():
            return []
        return sorted(
            self.output_dir.glob("notes_*.json"),
            reverse=True
        )

    def _parse_json(self, raw_response: str) -> Optional[List[Dict[str, Any]]]:
        """Extract JSON from response."""
        try:
            return json.loads(raw_response)
        except json.JSONDecodeError:
            # Try markdown code blocks
            if "```json" in raw_response:
                start = raw_response.find("```json") + len("```json")
                end = raw_response.find("```", start)
                if end > start:
                    try:
                        return json.loads(raw_response[start:end].strip())
                    except json.JSONDecodeError:
                        pass
            elif "```" in raw_response:
                start = raw_response.find("```") + len("```")
                end = raw_response.find("```", start)
                if end > start:
                    try:
                        return json.loads(raw_response[start:end].strip())
                    except json.JSONDecodeError:
                        pass

        print("✗ Could not parse JSON from response", file=sys.stderr)
        return None


# ============================================================================
# INTERACTIVE CHATBOT
# ============================================================================

class InteractiveChatbot:
    """Interactive chatbot with note generation."""

    def __init__(
        self,
        api: MistralAPI,
        notes_manager: NotesManager,
        model: str = "mistral",
        system_prompt: Optional[str] = None,
    ):
        self.api = api
        self.notes_manager = notes_manager
        self.model = model
        self.system_prompt = (
            system_prompt
            or "You are a helpful and friendly instructional assistant. "
            "Provide clear, concise, and accurate information to help users learn."
        )
        self.conversation_history: List[Dict[str, str]] = []

    def run(self) -> None:
        """Main interactive loop."""
        print("\n" + "=" * 70)
        print("Mistral Chatbot")
        print("=" * 70)
        print("Chat normally with the bot.")
        print("Type '/notes' to generate and save notes.")
        print("Type 'exit' or 'quit' to end.\n")

        while True:
            try:
                user_input = input("You: ").strip()

                if not user_input:
                    continue

                # Commands
                if user_input.lower() == "/notes":
                    self._generate_notes()
                    continue

                if user_input.lower() in ("exit", "quit"):
                    print("\nGoodbye!")
                    break

                # Chat
                messages = [
                    {"role": "system", "content": self.system_prompt},
                    *self.conversation_history,
                    {"role": "user", "content": user_input},
                ]

                response = self.api.chat(messages, self.model)

                if response is None:
                    print("(No response - try again)\n")
                    continue

                print(f"\nAssistant: {response}\n")

                # Save to history
                self.conversation_history.append({"role": "user", "content": user_input})
                self.conversation_history.append({"role": "assistant", "content": response})

            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                break
            except Exception as e:
                print(f"✗ Error: {e}\n", file=sys.stderr)

    def _generate_notes(self) -> None:
        """Handle note generation."""
        print("\n--- Generate and Save Notes ---")

        topic = input("What topic should the notes be about? ").strip()
        if not topic:
            print("✗ Topic cannot be empty.")
            return

        try:
            count_input = input("How many notes to generate? (default: 5): ").strip()
            count = int(count_input) if count_input else 5
            if count < 1 or count > 20:
                print("✗ Please enter a number between 1 and 20.")
                return
        except ValueError:
            print("✗ Invalid number.")
            return

        print(f"\n[Generating {count} notes about '{topic}'...]")
        notes = self.notes_manager.generate(topic, count)

        if not notes:
            print("✗ Failed to generate notes.")
            return

        print(f"\nGenerated {len(notes)} note(s):")
        print(json.dumps(notes, indent=2))

        save_choice = input("\nSave these notes? (y/n): ").strip().lower()
        if save_choice == "y":
            self.notes_manager.save(notes)
        else:
            print("Notes not saved.")

        print()


# ============================================================================
# GRAPH VISUALIZATION SERVER
# ============================================================================

class GraphVizHandler(SimpleHTTPRequestHandler):
    """HTTP handler for graph visualization."""

    def do_GET(self):
        # API endpoint: list notes
        if self.path == '/api/list-notes':
            output_dir = Path('output')
            if output_dir.exists():
                notes_files = sorted(
                    [f'output/{f.name}' for f in output_dir.glob('notes_*.json')],
                    reverse=True
                )
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(notes_files).encode())
            else:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps([]).encode())
            return

        # Default: serve graph HTML
        if self.path == '/':
            self.path = '/graph-viz-fixed.html'

        return SimpleHTTPRequestHandler.do_GET(self)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-type')
        super().end_headers()

    def log_message(self, format, *args):
        print(f'[{self.log_date_time_string()}] {format % args}')


class GraphServer:
    """Graph visualization HTTP server."""

    def __init__(self, port: int = 8000):
        self.port = port

    def run(self) -> None:
        """Start the server."""
        os.chdir(Path(__file__).parent)
        server = HTTPServer(('localhost', self.port), GraphVizHandler)

        print(f"""
╔════════════════════════════════════════════════════════════╗
║           📊 Graph Visualization Server                    ║
╚════════════════════════════════════════════════════════════╝

✓ Server running at: http://localhost:{self.port}
✓ Open in browser to view interactive graph

Features:
  • Dropdown to select from generated note files
  • Interactive D3 force-directed graph
  • Tag-based filtering and search
  • Physics simulation and zoom/pan controls

Press Ctrl+C to stop the server.
""")

        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\n✓ Server stopped.')
            server.server_close()


# ============================================================================
# CLI AND MAIN
# ============================================================================

def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Integrated Ollama Mistral Note Management System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                          Run interactive chatbot
  python main.py --generate "Physics"     Generate notes directly
  python main.py --serve                  Start graph visualization server
  python main.py --list                   List saved note files
  python main.py --generate "Laws" --count 10  Generate 10 notes
        """,
    )

    parser.add_argument(
        "--mode",
        choices=["chat", "generate", "serve"],
        help="Mode: 'chat' (interactive), 'generate' (notes), 'serve' (graph server)",
    )
    parser.add_argument(
        "--generate",
        metavar="TOPIC",
        help="Generate notes on a topic (shortcut for --mode generate)",
    )
    parser.add_argument(
        "--serve",
        action="store_true",
        help="Start graph server (shortcut for --mode serve)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all saved note files",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=5,
        help="Number of notes to generate (default: 5)",
    )
    parser.add_argument(
        "--model",
        default="mistral",
        help="Model name (default: mistral)",
    )
    parser.add_argument(
        "--output-dir",
        default="./output",
        help="Directory to save notes (default: ./output)",
    )
    parser.add_argument(
        "--system-prompt",
        help="Custom system prompt for chatbot",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="HTTP timeout in seconds (default: 60)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Server port (default: 8000)",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Enable verbose debug output",
    )

    args = parser.parse_args()

    # Determine mode
    mode = args.mode

    if args.serve:
        mode = "serve"
    elif args.generate:
        mode = "generate"
    elif args.list:
        mode = "list"

    # Default to chat if no mode specified
    if not mode:
        mode = "chat"

    # Initialize components
    api = MistralAPI(timeout_sec=args.timeout, verbose=args.verbose)
    notes_manager = NotesManager(api, args.output_dir, args.model)

    # Execute mode
    if mode == "chat":
        chatbot = InteractiveChatbot(api, notes_manager, args.model, args.system_prompt)
        chatbot.run()

    elif mode == "generate":
        topic = args.generate or input("What topic? ").strip()
        if not topic:
            print("✗ Topic required")
            return 1

        print(f"[Generating {args.count} notes about '{topic}'...]")
        notes = notes_manager.generate(topic, args.count)

        if not notes:
            print("✗ Failed to generate notes")
            return 1

        print(f"\nGenerated {len(notes)} note(s):")
        print(json.dumps(notes, indent=2))

        filename = notes_manager.save(notes)
        return 0 if filename else 1

    elif mode == "serve":
        server = GraphServer(args.port)
        server.run()

    elif mode == "list":
        files = notes_manager.list_saved()
        if not files:
            print("No saved notes found.")
        else:
            print(f"\nSaved notes ({len(files)} total):\n")
            for i, f in enumerate(files, 1):
                print(f"  {i}. {f.name}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
