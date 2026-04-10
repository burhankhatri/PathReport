#!/bin/bash
nohup node server/index.js > server.log 2>&1 &
echo "Server started with PID $!"
