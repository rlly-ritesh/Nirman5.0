#!/usr/bin/env python3
"""
Backend server for PadhAI chatbot and graph visualization.
Runs on port 5000 and provides REST API endpoints.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from http.server import HTTPServer
from urllib.parse import urlparse, parse_qs
from wsgiref.simple_server import make_server

try:
    import requests
except ImportError:
    print("Error: 'requests' package not found. Install with: pip install requests")
    sys.exit(1)


# ============================================================================
# MISTRAL API CLIENT
# ============================================================================

class MistralAPI:
    """Low-level Mistral API client for Ollama."""

    def __init__(self, timeout_sec: int = 60, verbose: bool = False):
        self.timeout_sec = timeout_sec
        self.verbose = verbose
        self.ollama_url = "http://localhost:11434"

    def log(self, msg: str) -> None:
        """Print debug message."""
        if self.verbose:
            print(f"[DEBUG] {msg}", file=sys.stderr)

    def is_available(self) -> bool:
        """Check if Ollama is running."""
        try:
            resp = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            return resp.status_code == 200
        except:
            return False

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
            self.log(f"Calling chat API: {self.ollama_url}/api/chat")
            resp = requests.post(
                f"{self.ollama_url}/api/chat",
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
        except Exception as e:
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
            self.log(f"Calling generate API: {self.ollama_url}/api/generate")
            resp = requests.post(
                f"{self.ollama_url}/api/generate",
                json=body,
                timeout=self.timeout_sec,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()

            response_data = resp.json()
            return response_data.get("response", "")

        except Exception as e:
            print(f"✗ API error: {e}", file=sys.stderr)
            return None


# ============================================================================
# NOTES MANAGER
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

        notes = self._parse_json(raw_response)
        if not notes:
            return None

        if not isinstance(notes, list):
            return None

        for note in notes:
            if not isinstance(note, dict) or "id" not in note or "tags" not in note:
                return None
            if not isinstance(note["tags"], list) or not note["tags"]:
                return None

        return notes

    def save(self, notes: List[Dict[str, Any]], topic: str = "notes") -> Optional[str]:
        """Save notes to file."""
        if not notes:
            return None

        # Sanitize topic name for filename
        import re
        safe_topic = re.sub(r'[^a-zA-Z0-9_-]', '', topic.replace(' ', '_'))
        safe_topic = safe_topic[:50]  # Limit filename length
        
        if not safe_topic:
            safe_topic = "notes"
        
        filename = self.output_dir / f"{safe_topic}.json"
        
        # If file already exists, append timestamp
        if filename.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = self.output_dir / f"{safe_topic}_{timestamp}.json"

        try:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(notes, f, indent=2, ensure_ascii=False)
            return str(filename)
        except IOError:
            return None

    def list_saved(self) -> List[str]:
        """List all saved note files."""
        if not self.output_dir.exists():
            return []
        files = sorted(
            self.output_dir.glob("*.json"),
            reverse=True,
            key=lambda f: f.stat().st_mtime  # Sort by modification time (newest first)
        )
        return [str(f) for f in files]

    def load(self, filepath: str) -> Optional[List[Dict[str, Any]]]:
        """Load notes from file."""
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return None

    def _parse_json(self, raw_response: str) -> Optional[List[Dict[str, Any]]]:
        """Extract JSON from response."""
        try:
            return json.loads(raw_response)
        except json.JSONDecodeError:
            if "```json" in raw_response:
                start = raw_response.find("```json") + len("```json")
                end = raw_response.find("```", start)
                if end > start:
                    try:
                        return json.loads(raw_response[start:end].strip())
                    except:
                        pass
            elif "```" in raw_response:
                start = raw_response.find("```") + len("```")
                end = raw_response.find("```", start)
                if end > start:
                    try:
                        return json.loads(raw_response[start:end].strip())
                    except:
                        pass
        return None


# ============================================================================
# FLASK-LIKE WSGI APPLICATION
# ============================================================================

class SimplePythonServer:
    """Minimal WSGI server for the chatbot backend."""

    def __init__(self, api: MistralAPI, notes_manager: NotesManager):
        self.api = api
        self.notes_manager = notes_manager
        self.conversation_history: Dict[str, List[Dict[str, str]]] = {}

    def __call__(self, environ, start_response):
        """WSGI application."""
        method = environ['REQUEST_METHOD']
        path = environ['PATH_INFO']
        
        # Parse query string
        query_string = environ.get('QUERY_STRING', '')
        
        # Read body
        try:
            content_length = int(environ.get('CONTENT_LENGTH', '') or 0)
        except (ValueError, TypeError):
            content_length = 0
        body = environ['wsgi.input'].read(content_length).decode('utf-8') if content_length > 0 else ''

        # Route handling
        if path == '/api/health' and method == 'GET':
            response = self.handle_health()
        elif path == '/api/chat' and method == 'POST':
            response = self.handle_chat(body)
        elif path == '/api/generate-notes' and method == 'POST':
            response = self.handle_generate_notes(body)
        elif path == '/api/notes/list' and method == 'GET':
            response = self.handle_list_notes()
        elif path == '/api/notes/load' and method == 'POST':
            response = self.handle_load_notes(body)
        elif path == '/api/conversation/reset' and method == 'POST':
            response = self.handle_reset_conversation(body)
        else:
            response = {
                'status': 'error',
                'message': 'Not found'
            }
            status = '404 Not Found'
            response_body = json.dumps(response).encode('utf-8')
            headers = [
                ('Content-Type', 'application/json'),
                ('Content-Length', str(len(response_body))),
                ('Access-Control-Allow-Origin', '*'),
            ]
            start_response(status, headers)
            return [response_body]

        status = '200 OK'
        response_body = json.dumps(response).encode('utf-8')
        headers = [
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(response_body))),
            ('Access-Control-Allow-Origin', '*'),
        ]
        start_response(status, headers)
        return [response_body]

    def handle_health(self) -> Dict[str, Any]:
        """Health check endpoint."""
        return {
            'status': 'ok',
            'ollama_available': self.api.is_available()
        }

    def handle_chat(self, body: str) -> Dict[str, Any]:
        """Chat endpoint."""
        try:
            data = json.loads(body)
            user_message = data.get('message', '')
            session_id = data.get('session_id', 'default')
            model = data.get('model', 'mistral')
            
            if not user_message:
                return {'status': 'error', 'message': 'Message required'}

            # Get or create conversation history
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []

            # Build messages for API
            messages = [
                {
                    'role': 'system',
                    'content': 'You are a helpful and friendly educational assistant. Provide clear, concise, and accurate information to help users learn.'
                },
                *self.conversation_history[session_id],
                {'role': 'user', 'content': user_message}
            ]

            # Get response from Mistral
            response = self.api.chat(messages, model)

            if response is None:
                return {
                    'status': 'error',
                    'message': 'Failed to get response from Ollama. Is it running?'
                }

            # Save to history
            self.conversation_history[session_id].append({'role': 'user', 'content': user_message})
            self.conversation_history[session_id].append({'role': 'assistant', 'content': response})

            return {
                'status': 'success',
                'response': response,
                'session_id': session_id
            }

        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }

    def handle_generate_notes(self, body: str) -> Dict[str, Any]:
        """Generate notes endpoint."""
        try:
            data = json.loads(body)
            topic = data.get('topic', '')
            count = data.get('count', 5)

            if not topic:
                return {'status': 'error', 'message': 'Topic required'}

            notes = self.notes_manager.generate(topic, count)

            if not notes:
                return {
                    'status': 'error',
                    'message': 'Failed to generate notes. Is Ollama running?'
                }

            filename = self.notes_manager.save(notes, topic)

            return {
                'status': 'success',
                'notes': notes,
                'filename': filename
            }

        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }

    def handle_list_notes(self) -> Dict[str, Any]:
        """List saved notes endpoint."""
        try:
            files = self.notes_manager.list_saved()
            print(f"[BACKEND] List notes called, found {len(files)} files", file=sys.stderr)
            return {
                'status': 'success',
                'files': files
            }
        except Exception as e:
            print(f"[BACKEND] Error listing notes: {e}", file=sys.stderr)
            return {
                'status': 'error',
                'message': str(e)
            }

    def handle_load_notes(self, body: str) -> Dict[str, Any]:
        """Load notes endpoint."""
        try:
            data = json.loads(body)
            filepath = data.get('filepath', '')

            if not filepath:
                return {'status': 'error', 'message': 'Filepath required'}

            notes = self.notes_manager.load(filepath)

            if not notes:
                return {'status': 'error', 'message': 'Failed to load notes'}

            return {
                'status': 'success',
                'notes': notes,
                'filepath': filepath
            }

        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }

    def handle_reset_conversation(self, body: str) -> Dict[str, Any]:
        """Reset conversation endpoint."""
        try:
            data = json.loads(body)
            session_id = data.get('session_id', 'default')

            if session_id in self.conversation_history:
                del self.conversation_history[session_id]

            return {
                'status': 'success',
                'message': 'Conversation reset'
            }

        except Exception as e:
            return {
                'status': 'error',
                'message': str(e)
            }


def run_server(port: int = 5000, verbose: bool = False) -> None:
    """Start the backend server."""
    import os
    
    api = MistralAPI(verbose=verbose)
    
    # Use absolute path for output directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, 'output')
    
    notes_manager = NotesManager(api, output_dir, 'mistral')
    
    app = SimplePythonServer(api, notes_manager)
    server = make_server('localhost', port, app)

    print(f"""
=================================================================
PadhAI Backend Server
=================================================================

Server running at: http://localhost:{port}
Ollama status: {'Available' if api.is_available() else 'Not available'}

Available endpoints:
  GET  /api/health              - Health check
  POST /api/chat                - Chat with Mistral
  POST /api/generate-notes      - Generate notes
  GET  /api/notes/list          - List saved notes
  POST /api/notes/load          - Load notes file
  POST /api/conversation/reset  - Reset conversation

Press Ctrl+C to stop the server.
""")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
        server.server_close()


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='PadhAI Backend Server')
    parser.add_argument('--port', type=int, default=5000, help='Port to run on')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    run_server(args.port, args.verbose)
