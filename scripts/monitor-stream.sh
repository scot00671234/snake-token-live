#!/bin/bash

echo "🔍 Starting stream monitor..."

# Function to restart streaming if it fails
restart_stream() {
    echo "⚠️  Stream failed, restarting in 10 seconds..."
    sleep 10
    
    # Kill all processes
    pkill -f ffmpeg
    pkill -f chromium
    pkill -f Xvfb
    
    sleep 5
    
    echo "🔄 Restarting stream setup..."
    exec /usr/local/bin/stream-setup.sh
}

# Monitor the stream
while true; do
    if ! pgrep -f ffmpeg > /dev/null; then
        echo "❌ FFmpeg stream process not found!"
        restart_stream
    fi
    
    if ! pgrep -f chromium > /dev/null; then
        echo "❌ Browser process not found!"
        restart_stream
    fi
    
    # Check every 30 seconds
    sleep 30
done