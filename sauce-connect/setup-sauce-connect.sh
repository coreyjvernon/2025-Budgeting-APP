#!/bin/bash

# Download Sauce Connect based on the OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  curl -L https://saucelabs.com/downloads/sc-4.9.0-macosx.zip -o sauce-connect.zip
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  curl -L https://saucelabs.com/downloads/sc-4.9.0-linux.tar.gz -o sauce-connect.tar.gz
  tar -xzf sauce-connect.tar.gz
else
  echo "Unsupported OS"
  exit 1
fi

# Extract if it's a zip file (macOS)
if [[ -f "sauce-connect.zip" ]]; then
  unzip sauce-connect.zip
fi

# Run Sauce Connect
./sc-*/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY -i test-tunnel