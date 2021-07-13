#!/bin/bash

for f in *.svg; do
    b="$(base64 -w 0 $f)"
    bf="$(basename $f .svg)"
    echo "let ${bf}Img = new Image();"
    echo "${bf}Img.src = 'data:image/svg+xml;base64,${b}';"
done