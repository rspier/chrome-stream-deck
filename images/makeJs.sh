#!/bin/sh

for f in *.svg; do
    b="$(base64 < $f | awk 1 ORS='')"
    bf="$(basename $f .svg)"
    echo "let ${bf}Img = new Image();"
    echo "${bf}Img.src = 'data:image/svg+xml;base64,${b}';"
done
