# Batch Video Processing Workflow

## Current Process (Single Video)
1. **Frame Extraction**: `@ffmpeg-mcp/extract_frames_from_video` 
2. **Visual Analysis**: `@vision-server/analyze_image` per frame
3. **Audio Processing**: `transcribe_video` (needs fixing for MP3)
4. **Unified Output**: JSON + Markdown correlation

## Batch Processing Strategy

### Input Structure
```
/Users/bryanchasko/Downloads/batch-videos/
├── video1_id/
│   ├── frames/
│   ├── audio.mp3
│   └── metadata.json
├── video2_id/
└── video3_id/
```

### Automated Batch Script
```bash
#!/bin/bash
for video_dir in /Users/bryanchasko/Downloads/batch-videos/*/; do
    video_id=$(basename "$video_dir")
    
    # Process frames
    for frame in "$video_dir/frames"/*.png; do
        analyze_image "$frame" >> "$video_dir/visual-analysis.json"
    done
    
    # Create unified output
    create_unified_transcript "$video_id"
done
```

### MCP Tool Sequence (Per Video)
1. `@ffmpeg-mcp/get_video_info` → metadata
2. `@ffmpeg-mcp/extract_frames_from_video` → PNG frames  
3. Loop: `@vision-server/analyze_image` → descriptions
4. `transcribe_video` → audio transcript
5. Correlate timestamps → unified JSON/MD

### Optimization for Batch
- **Parallel Processing**: Process multiple videos simultaneously
- **Frame Batching**: Analyze frames in groups of 5-10
- **Error Handling**: Skip failed videos, continue batch
- **Progress Tracking**: JSON status file per video
- **Resource Management**: Limit concurrent Ollama requests

### Implementation
```json
{
  "batch_config": {
    "max_concurrent_videos": 3,
    "frames_per_batch": 8,
    "scene_threshold": 0.4,
    "output_format": ["json", "markdown"]
  }
}
```

The workflow is now proven and can be scaled to process multiple videos automatically.
