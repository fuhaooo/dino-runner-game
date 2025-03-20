#!/bin/bash

# Create placeholder images for the Dino Game
# This script creates simple colored rectangles for testing

# Create dino images
convert -size 60x70 xc:green -fill black -draw "rectangle 10,10 50,60" PNG32:dino-run1.png
convert -size 60x70 xc:green -fill black -draw "rectangle 15,15 55,65" PNG32:dino-run2.png
convert -size 60x70 xc:green -fill black -draw "rectangle 10,5 50,55" PNG32:dino-jump.png
convert -size 60x35 xc:green -fill black -draw "rectangle 10,5 50,30" PNG32:dino-duck1.png
convert -size 60x35 xc:green -fill black -draw "rectangle 15,10 55,30" PNG32:dino-duck2.png
convert -size 60x70 xc:red -fill black -draw "rectangle 10,10 50,60" PNG32:dino-dead.png

# Create environment images
convert -size 800x20 xc:brown -fill tan -draw "rectangle 0,0 800,10" PNG32:ground.png
convert -size 40x60 xc:darkgreen -fill green -draw "rectangle 10,5 30,55" PNG32:cactus.png
convert -size 70x30 xc:white -fill lightblue -draw "rectangle 10,5 60,25" PNG32:cloud.png

echo "Placeholder images created. Install ImageMagick if this script doesn't work."
echo "Run: sudo apt-get install imagemagick"
