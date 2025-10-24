#!/bin/bash

# K6 Installation Fix Script
# Resolves the "Exec format error" issue by reinstalling k6 for the correct architecture

set -e

echo "🔧 Fixing K6 Installation..."

# Detect system architecture
ARCH="$(uname -m)"
OS="$(uname -s)"

echo "🖥️  System: $OS $ARCH"

# Remove existing k6 installation
echo "🗑️  Removing existing k6 installation..."

if command -v k6 >/dev/null 2>&1; then
    echo "Found existing k6 installation, removing..."
    
    # Try different removal methods
    if command -v brew >/dev/null 2>&1; then
        echo "Removing via Homebrew..."
        brew uninstall k6 2>/dev/null || true
    fi
    
    # Remove from common locations
    sudo rm -f /usr/local/bin/k6 2>/dev/null || true
    sudo rm -f /usr/bin/k6 2>/dev/null || true
    rm -f ~/.local/bin/k6 2>/dev/null || true
    
    echo "✅ Existing installation removed"
else
    echo "No existing k6 installation found"
fi

# Install k6 for correct architecture
echo "📦 Installing k6 for correct architecture..."

if [[ "$OS" == "Darwin" ]]; then
    echo "🍎 macOS detected"
    
    if command -v brew >/dev/null 2>&1; then
        echo "Using Homebrew to install k6..."
        brew install k6
        
        # Verify installation
        if command -v k6 >/dev/null 2>&1; then
            echo "✅ K6 installed successfully via Homebrew"
        else
            echo "❌ Homebrew installation failed, trying direct download..."
            install_k6_direct
        fi
    else
        echo "Homebrew not found, installing directly..."
        install_k6_direct
    fi
else
    echo "❌ Unsupported OS: $OS"
    echo "Please install k6 manually from: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

function install_k6_direct() {
    echo "📥 Downloading k6 directly..."
    
    # Determine the correct binary for macOS
    if [[ "$ARCH" == "arm64" ]]; then
        K6_BINARY="k6-v0.47.0-darwin-arm64"
    else
        K6_BINARY="k6-v0.47.0-darwin-amd64"
    fi
    
    echo "Downloading $K6_BINARY..."
    
    # Download and extract
    curl -L "https://github.com/grafana/k6/releases/download/v0.47.0/${K6_BINARY}.tar.gz" | tar xvz
    
    # Install to /usr/local/bin
    sudo mv k6 /usr/local/bin/
    
    # Make executable
    sudo chmod +x /usr/local/bin/k6
    
    # Clean up
    rm -f "${K6_BINARY}.tar.gz" 2>/dev/null || true
}

# Verify installation
echo "🧪 Verifying k6 installation..."

if command -v k6 >/dev/null 2>&1; then
    K6_VERSION=$(k6 version 2>/dev/null || echo "version check failed")
    echo "✅ K6 installed successfully!"
    echo "📋 Version: $K6_VERSION"
    
    # Test k6 with a simple script
    echo "🧪 Testing k6 with simple script..."
    k6 run --quiet - << 'EOF'
import http from 'k6/http';

export default function () {
  http.get('https://httpbin.org/get');
}
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ K6 test completed successfully!"
    else
        echo "❌ K6 test failed. Please check your installation."
        exit 1
    fi
    
else
    echo "❌ K6 installation failed or k6 command not found in PATH"
    echo ""
    echo "🔧 Manual installation steps:"
    echo "1. Download k6 from: https://github.com/grafana/k6/releases"
    echo "2. Extract and move to /usr/local/bin/"
    echo "3. Make executable: chmod +x /usr/local/bin/k6"
    echo "4. Verify: k6 version"
    exit 1
fi

echo ""
echo "🎉 K6 Installation Fixed Successfully!"
echo ""
echo "📚 Next steps:"
echo "   1. Test performance tests: cd performance-tests && npm run test:load:local"
echo "   2. Run stress tests: cd performance-tests && npm run test:stress:local"
echo "   3. Check k6 documentation: https://k6.io/docs/"
echo ""
echo "🔗 Useful commands:"
echo "   - k6 version                    # Check version"
echo "   - k6 run script.js             # Run a test script"
echo "   - k6 run --vus 10 script.js    # Run with 10 virtual users"
