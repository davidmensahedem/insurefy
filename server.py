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