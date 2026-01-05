#!/bin/bash
# Script to add attribution headers to all transcript files

# Video 03 - AWS re:Invent
if [ -f "/Users/bryanchasko/Downloads/kiro-videos/03-aws-reinvent-sdlc-kiro/eLyFTbVtY64-AWS-reInvent-2025-Accelerate-multi-step-SDLC-with-Kiro-(DVT321).txt" ]; then
    echo "Adding header to Video 03..."
    sed -i '' '1i\
---\
Video: AWS re:Invent 2025 - Accelerate multi-step SDLC with Kiro (DVT321)\
Video ID: eLyFTbVtY64\
URL: https://youtu.be/eLyFTbVtY64\
Duration: 60:28\
Creator: AWS Kiro CLI Team\
Platform: YouTube\
Event: AWS re:Invent 2025\
Transcribed using: OpenAI Whisper\
---\
' "/Users/bryanchasko/Downloads/kiro-videos/03-aws-reinvent-sdlc-kiro/eLyFTbVtY64-AWS-reInvent-2025-Accelerate-multi-step-SDLC-with-Kiro-(DVT321).txt"
fi

echo "Attribution headers added to transcript files"
