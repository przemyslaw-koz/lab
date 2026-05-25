import http.server
import os
import time
from prometheus_client import start_http_server, Histogram


REQUEST_LATENCY_TIME = Histogram('request_latency_time', 'Time spent processing request', buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0))


HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))


class HandleRequests(http.server.BaseHTTPRequestHandler):

    @REQUEST_LATENCY_TIME.time()
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>First python Application</title></head><body style='background-color:blue;'><h1>Hello World!</h1></body></html>", "utf-8"))



if __name__ == "__main__":
    start_http_server(5001)
    server = http.server.HTTPServer((HOST, PORT), HandleRequests)
    server.serve_forever()
