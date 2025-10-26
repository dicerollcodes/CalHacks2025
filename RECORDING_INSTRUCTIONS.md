# How to Record the Ice Cube Animation

The 3D ice cube animation is performance-intensive. Here's how to convert it to a video file for better performance.

## Option 1: Screen Recording (Easiest)

### On Mac:
1. Open your local dev server: http://localhost:5173/
2. Navigate to any user profile page
3. Open **QuickTime Player**
4. File → New Screen Recording
5. Select the area around the ice cube (just the animation, ~300x300px)
6. Start recording
7. Click the ice cube to trigger the animation
8. Stop recording when animation completes (~1-2 seconds)
9. Export as MP4: File → Export As → 1080p

### On Windows:
1. Use **Xbox Game Bar** (Win + G)
2. Or use **OBS Studio** (free) for better quality
3. Record just the ice cube area
4. Export as MP4

## Option 2: Browser DevTools (Better Quality)

### Using Chrome/Edge:
1. Open DevTools (F12)
2. Go to "More Tools" → "Rendering"
3. Enable "Rendering Frames"
4. Use a screen recorder like **ShareX** (Windows) or **Kap** (Mac)
5. Record at 60fps for smooth playback

## Option 3: Programmatic Capture (Best Quality)

I can help you add a "Record" button that captures the canvas:

```javascript
// Add this to Model.jsx temporarily
const capturer = new CCapture({ format: 'webm', framerate: 60 });
// Then capture frames during animation
```

## Converting & Optimizing the Video

Once you have the recording:

```bash
# Install ffmpeg if needed
brew install ffmpeg  # Mac
# or download from ffmpeg.org

# Convert to WebM with transparency (best for web)
ffmpeg -i ice-shatter.mov -c:v libvpx-vp9 -pix_fmt yuva420p -an client/public/ice-shatter-animation.webm

# Also create MP4 fallback (no transparency support)
ffmpeg -i ice-shatter.mov -c:v libx264 -pix_fmt yuv420p -an client/public/ice-shatter-animation.mp4

# Optimize file size
ffmpeg -i ice-shatter-animation.webm -b:v 500k -an client/public/ice-shatter-animation-optimized.webm
```

## Using the Video Version

Once you have the video files:

1. Place them in `client/public/` folder:
   - `client/public/ice-shatter-animation.webm`
   - `client/public/ice-shatter-animation.mp4`

2. In `UserProfileNew.jsx`, replace:
   ```javascript
   import IceCube from '../components/IceCube'
   ```
   with:
   ```javascript
   import IceCube from '../components/IceCubeVideo'
   ```

3. That's it! The video will play smoothly at 60fps with no rendering lag.

## Tips for Best Results

- **Resolution**: Record at 2x size (400x400px) then scale down for crisp quality
- **Frame Rate**: 60fps for smooth animation
- **Background**: Make sure to capture with transparent/black background
- **Timing**: The animation is ~1 second total now (optimized)
- **Format**: WebM with alpha channel for transparency, MP4 as fallback

## Quick Test

After placing the video files, the video version should:
- ✅ Play instantly on click (no lag)
- ✅ Look identical to the 3D version
- ✅ Use ~100x less CPU/GPU
- ✅ Work on all devices smoothly

Need help with any step? Let me know!
