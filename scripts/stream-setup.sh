#!/bin/bash

echo "🎮 Setting up Pump.fun 24/7 Snake Game Stream..."

# Wait for the Snake game to be ready
echo "⏳ Waiting for Snake game to start..."
while ! curl -s http://snake-app:5000/api/stats > /dev/null; do
    echo "   Still waiting for Snake game..."
    sleep 5
done
echo "✅ Snake game is ready!"

# Check if RTMP_URL is provided
if [ -z "$RTMP_URL" ]; then
    echo "❌ ERROR: RTMP_URL environment variable not set!"
    echo "💡 Please set your pump.fun RTMP URL in Dokploy environment variables"
    echo "   Example: rtmp://ingest.pump.fun/live/YOUR_STREAM_KEY"
    exit 1
fi

echo "🖥️  Starting virtual display..."
# Start virtual display
Xvfb :1 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &
export DISPLAY=:1
sleep 3

echo "🔊 Starting audio system..."
# Start PulseAudio
pulseaudio --start --exit-idle-time=-1 --daemon
sleep 2

echo "🌐 Opening Snake game in browser..."
# Start Chrome with the Snake game
chromium-browser \
    --no-sandbox \
    --disable-gpu \
    --disable-dev-shm-usage \
    --disable-web-security \
    --autoplay-policy=no-user-gesture-required \
    --allow-running-insecure-content \
    --display=:1 \
    --window-size=1920,1080 \
    --start-fullscreen \
    --kiosk \
    --disable-infobars \
    --disable-features=VizDisplayCompositor \
    "$SNAKE_GAME_URL" &

# Wait for Chrome to load
echo "⏳ Waiting for browser to load..."
sleep 15

echo "📡 Starting stream to pump.fun..."
# Start FFmpeg streaming
exec ffmpeg -loglevel info \
    -f x11grab -video_size 1920x1080 -framerate 30 -i :1.0+0,0 \
    -f pulse -ac 2 -i default \
    -c:v libx264 -preset ultrafast -tune zerolatency \
    -maxrate 2500k -bufsize 5000k \
    -c:a aac -b:a 128k -ar 44100 \
    -r 30 -g 60 -keyint_min 30 \
    -f flv \
    "$RTMP_URL"