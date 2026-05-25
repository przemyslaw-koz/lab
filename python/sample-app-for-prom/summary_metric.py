import http.server
import os
from prometheus_client import start_http_server, Summary


REQUEST_LATENCY_TIME = Summary('request_latency_time', 'Time spent processing request')


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
