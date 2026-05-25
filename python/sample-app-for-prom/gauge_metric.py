import http.server
import os
import time
from prometheus_client import start_http_server, Gauge


REQUEST_IN_PROGRESS = Gauge('requests_in_progress', 'Total number of HTTP requests in progress')
REQUEST_LAST_EXECUTED = Gauge('request_last_executed', 'Time when request was executed last time.')


HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5000"))


class HandleRequests(http.server.BaseHTTPRequestHandler):

    @REQUEST_IN_PROGRESS.track_inprogress()
    def do_GET(self):
        #REQUEST_IN_PROGRESS.inc()
        time.sleep(10)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>First python Application</title></head><body style='background-color:blue;'><h1>Hello World!</h1></body></html>", "utf-8"))
        REQUEST_LAST_EXECUTED.set(time.time())
        #REQUEST_IN_PROGRESS.dec()


if __name__ == "__main__":
    start_http_server(5001)
    server = http.server.HTTPServer((HOST, PORT), HandleRequests)
    server.serve_forever()
