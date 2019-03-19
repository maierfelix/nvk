set port=80
start chrome http://localhost:%port%/
http-server -c-1 -p%port%