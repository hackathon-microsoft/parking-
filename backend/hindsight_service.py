"""
ParkIn - Hindsight AI Memory Service (Microsoft Agent Framework Integration)

This microservice demonstrates how Hindsight (vectorize-io/hindsight) is integrated
with the Microsoft Agent Framework to provide persistent long-term memory for smart parking.
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# In-memory Hindsight mock store if remote vector daemon is not running
HINDSIGHT_MEMORIES = {
    "entities": {
        "driver_id": "usr_wa_884",
        "plate": "WA-884-DEMO",
        "vehicle": "Tesla Model Y EV",
        "preferred_level": "P1",
        "charger_req": "50kW Fast",
        "elevator_proximity_meters": 25
    },
    "episodes": [
        {"session": "PRK-P1-1024", "spot": "P1-02", "duration_hrs": 3, "timestamp": "2026-09-28T09:15:00Z"},
        {"session": "PRK-P1-8842", "spot": "P1-04", "duration_hrs": 2, "timestamp": "2026-09-25T10:30:00Z"}
    ],
    "reflections": [
        "Driver requires EV fast charging on 100% of visits.",
        "Frequent commute window: 09:00 - 10:30 AM weekdays."
    ]
}

class HindsightHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/v1/memory/profile':
            self._set_headers(200)
            self.wfile.write(json.dumps(HINDSIGHT_MEMORIES).encode('utf-8'))
        elif self.path == '/health':
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "healthy", "service": "Hindsight-Agent-Memory"}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/v1/memory/retain':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                HINDSIGHT_MEMORIES["episodes"].append(payload)
                self._set_headers(200)
                self.wfile.write(json.dumps({"status": "retained", "hindsight_id": f"hnd_{len(HINDSIGHT_MEMORIES['episodes'])}"}).encode('utf-8'))
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run_server(port=8888):
    server_address = ('', port)
    httpd = HTTPServer(server_address, HindsightHandler)
    print(f"🧠 Hindsight AI Memory Service running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
