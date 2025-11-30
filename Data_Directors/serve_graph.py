#!/usr/bin/env python3
"""
Simple HTTP server to serve graph-viz visualization with note files from output folder
Run: python serve_graph.py
Then open: http://localhost:8000
"""

import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

class GraphVizHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Handle API endpoint for listing notes
        if self.path == '/api/list-notes':
            output_dir = Path('output')
            if output_dir.exists():
                # Get all JSON files and sort by modification time (newest first)
                json_files = sorted(
                    output_dir.glob('*.json'),
                    key=lambda f: f.stat().st_mtime,
                    reverse=True
                )
                notes_files = [f'output/{f.name}' for f in json_files]
                
                print(f'[DEBUG] Found {len(notes_files)} JSON files in output/')
                for f in notes_files[:5]:
                    print(f'  - {f}')
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(notes_files).encode())
            else:
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps([]).encode())
            return

        # Default file serving
        if self.path == '/' or self.path == '':
            self.path = '/graph-viz-fixed.html'
        
        return SimpleHTTPRequestHandler.do_GET(self)

    def end_headers(self):
        # Add CORS headers and cache control
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom logging
        print(f'[{self.log_date_time_string()}] {format % args}')


def main():
    PORT = 8000
    os.chdir(Path(__file__).parent)
    
    server = HTTPServer(('localhost', PORT), GraphVizHandler)
    print(f"""
╔════════════════════════════════════════════════════════════╗
║           📊 Graph Visualization Server                    ║
╚════════════════════════════════════════════════════════════╝

✓ Server running at: http://localhost:{PORT}
✓ Open in browser to view interactive graph with note selector

Features:
  • Auto-detects all notes in output/ folder
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


if __name__ == '__main__':
    main()
