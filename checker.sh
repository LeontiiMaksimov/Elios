#!/bin/bash

# Function to recursively find and print directories and .png files
find_png_files() {
  # Loop through directories and files
  find "$1" -type d -exec echo "Directory: {}" \;  # Print directories
  find "$1" -type f -name "*.png" -exec echo "File: {}" \;  # Print .png files
}

# Run the function for the current directory
find_png_files .
