#!/usr/bin/env bash

pushd audio

for filename in *.wav; do
    webm_filename=../public/audio/${filename%.*}.webm
    mp3_filename=../public/audio/${filename%.*}.mp3

    echo "==== Converting $filename to WEBM ===="
    echo "ffmpeg -y -i $filename -dash 1 $webm_filename"

    ffmpeg -y -i $filename -dash 1 $webm_filename

    echo "==== Converting $filename to MP3 ===="
    echo "ffmpeg -y -i $filename -dash 1 $mp3_filename"

    ffmpeg -y -i $filename $mp3_filename
done

popd

#ffmpeg -i ./audio/blocked.wav -dash 1 ./public/audio/blocked.webm
