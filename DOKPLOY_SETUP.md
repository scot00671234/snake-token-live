# 🎮 Dokploy Automatic Pump.fun Streaming Setup

## Quick Setup Instructions

### 1. Add Files to Your Project
Copy these files to your project repository:
- `docker-compose.streaming.yml`
- `Dockerfile.streamer` 
- `scripts/` folder with all scripts

### 2. Configure in Dokploy

#### Option A: Docker Compose Deployment (Recommended)
1. Go to your Dokploy project
2. Click "Create Service" → "Docker Compose"
3. Upload or paste the `docker-compose.streaming.yml` content
4. Set environment variables:
   - `RTMP_URL`: Your pump.fun RTMP URL (e.g., `rtmp://ingest.pump.fun/live/YOUR_STREAM_KEY`)
   - `DATABASE_URL`: Your database connection string

#### Option B: Add to Existing Application
1. In your existing snake-game-app in Dokploy
2. Go to "Advanced" settings
3. Add this to "Run Command":
   ```bash
   docker run -d --name pump-streamer --network snake-game-app_default -e RTMP_URL=$RTMP_URL -e SNAKE_GAME_URL=http://snake-game-app:5000 $(docker build -f Dockerfile.streamer -q .)
   ```

### 3. Set Environment Variables in Dokploy
1. Go to your application/service
2. Click "Environment" tab
3. Add these variables:
   - `RTMP_URL`: `rtmp://ingest.pump.fun/live/YOUR_ACTUAL_STREAM_KEY`
   - Any other environment variables your app needs

### 4. Deploy
Click "Deploy" in Dokploy - everything will be automatic!

## What Happens Automatically

✅ **Snake game starts** on port 5000  
✅ **Virtual display creates** a headless screen  
✅ **Browser opens** your Snake game in fullscreen  
✅ **Stream starts** to pump.fun automatically  
✅ **Monitor runs** 24/7 to restart if anything fails  
✅ **Logs available** in Dokploy for debugging  

## Getting Your RTMP URL

1. Go to pump.fun
2. Start creating a livestream
3. Choose "RTMP (OBS/streaming software)"
4. Copy the RTMP URL that looks like: `rtmp://ingest.pump.fun/live/abc123xyz`

## Monitoring

- View logs in Dokploy: Service → Logs tab
- Stream status shows in real-time
- Automatic restarts if stream fails

## Troubleshooting

**Stream not starting?**
- Check RTMP_URL is correct in environment variables
- Verify Snake game is accessible at your domain
- Check logs in Dokploy

**Poor quality?**
- Adjust FFmpeg settings in `stream-setup.sh`
- Increase VPS resources if needed

That's it! Your 24/7 pump.fun stream will run automatically whenever you deploy! 🚀