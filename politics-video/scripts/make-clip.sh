#!/bin/bash
# ตัดฉากเขียว + ทำลูปไป-กลับ จากคลิป AI (1280x720 ตัวละครสองคน)
# ใช้: bash scripts/make-clip.sh input.mp4 public/clips/woman-talk.webm
ffmpeg -v error -i "$1" -filter_complex "[0:v]fps=30,crop=932:680:180:40,scale=1864:1360:flags=lanczos,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1,chromakey=0x3FB006:0.13:0.06,despill=type=green:mix=0.6:expand=0.1,format=yuva420p[o]" \
  -map "[o]" -c:v libvpx-vp9 -b:v 6M -auto-alt-ref 0 -row-mt 1 -deadline good -cpu-used 4 "$2" -y
