import http.server
import os


HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))


class HandleRequests(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>First python Application</title></head><body style='background-color:blue;'><h1>Hello World!</h1></body></html>", "utf-8"))


if __name__ == "__main__":
    server = http.server.HTTPServer((HOST, PORT), HandleRequests)
    server.serve_forever()
