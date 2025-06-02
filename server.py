#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class ReactHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # If requesting a file with extension, serve it normally
        if '.' in os.path.basename(path):
            return super().do_GET()
        
        # For all other paths (React routes), serve index.html
        self.path = '/index.html'
        return super().do_GET()

    def send_header(self, key, value):
        super().send_header(key, value)
        self.send_header('Access-Control-Allow-Origin', 'http://e4kcws8w8488cgk0scsko44w.207.180.196.252.sslip.io')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept, Cache-Control')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Credentials', 'true')

if __name__ == '__main__':
    PORT = 3000
    
    # Change to the dist directory
    os.chdir('/app/dist')
    
    # Start the server
    with socketserver.TCPServer(("", PORT), ReactHandler) as httpd:
        print(f"Serving React app on port {PORT}")
        print(f"Directory: {os.getcwd()}")
        print(f"Files: {os.listdir('.')}")
        httpd.serve_forever() 