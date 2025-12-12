#!/bin/bash

echo "Installing diagrams library and dependencies..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.7 or higher"
    exit 1
fi

echo "Python found!"
echo

# Install diagrams
echo "Installing diagrams library..."
pip3 install diagrams

# Install graphviz (Python package)
echo "Installing graphviz Python package..."
pip3 install graphviz

echo
echo "========================================"
echo "Installation complete!"
echo
echo "IMPORTANT: You also need to install Graphviz system package:"
echo
echo "For macOS:"
echo "   brew install graphviz"
echo
echo "For Ubuntu/Debian:"
echo "   sudo apt-get install graphviz"
echo
echo "For Fedora:"
echo "   sudo dnf install graphviz"
echo
echo "========================================"
echo

