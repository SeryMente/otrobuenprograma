from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import re

ROOT = Path.cwd().resolve()
PORT = int(os.environ.get("OGP_PORT", "4173"))
HOST = os.environ.get("OGP_HOST", "127.0.0.1")
RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$")

class RangeHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def translate_path(self, path):
        raw = super().translate_path(path)
        candidate = Path(raw).resolve()
        try:
            candidate.relative_to(ROOT)
            return str(candidate)
        except ValueError:
            return str(ROOT / "__forbidden__")

    def send_file(self, path):
        full = ROOT / path
        if not full.is_file():
            self.send_error(404)
            return
        total = full.stat().st_size
        start = 0
        end = total - 1
        range_header = self.headers.get("Range")
        if range_header:
            match = RANGE_RE.match(range_header.strip())
            if not match:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{total}")
                self.end_headers()
                return
            start_s, end_s = match.groups()
            if start_s:
                start = int(start_s)
                end = int(end_s) if end_s else total - 1
            else:
                suffix = int(end_s)
                if suffix <= 0:
                    self.send_response(416)
                    self.send_header("Content-Range", f"bytes */{total}")
                    self.end_headers()
                    return
                start = max(0, total - suffix)
            if start < 0 or start >= total or end < start:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{total}")
                self.end_headers()
                return
            end = min(end, total - 1)
            status = 206
        else:
            status = 200

        length = end - start + 1
        content_type = self.guess_type(str(full))
        self.send_response(status)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        if status == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{total}")
        self.end_headers()

        if self.command == "HEAD":
            return
        with full.open("rb") as source:
            source.seek(start)
            remaining = length
            try:
                while remaining:
                    chunk = source.read(min(1024 * 1024, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass

    def do_GET(self):
        translated = self.translate_path(self.path)
        if translated == str(ROOT / "__forbidden__"):
            self.send_error(403)
            return
        if Path(translated).is_dir():
            index = Path(translated) / "index.html"
            if index.is_file():
                self.send_file(index.relative_to(ROOT))
                return
        self.send_file(Path(translated).relative_to(ROOT))

    def do_HEAD(self):
        self.do_GET()

if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer((HOST, PORT), RangeHandler)
    print(f"OGP_RANGE_SERVER_READY=http://{HOST}:{PORT}/", flush=True)
    server.serve_forever()