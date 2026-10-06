"""Serve the Leaflet preview over localhost so tile requests send a valid referrer."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser
class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        super().end_headers()
root=Path(__file__).resolve().parent.parent/'public'
with ThreadingHTTPServer(('127.0.0.1',0),partial(PreviewHandler,directory=str(root))) as server:
    url=f'http://127.0.0.1:{server.server_port}/local-preview.html'
    print(f'PPS Leaflet preview: {url}\nKeep this terminal open. Press Ctrl+C to stop.',flush=True)
    webbrowser.open(url)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
