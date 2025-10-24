#!/bin/bash

# K6 Installation Script for FinancBase Admin Dashboard
# This script installs k6 performance testing tool across different platforms

set -e

echo "🚀 Installing k6 Performance Testing Tool..."

# Detect operating system
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
    Linux*)
        echo "📦 Detected Linux system"
        
        # Check if running on Ubuntu/Debian
        if command -v apt-get >/dev/null 2>&1; then
            echo "🔧 Installing k6 via apt..."
            sudo apt-get update
            sudo apt-get install -y ca-certificates gnupg
            sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
            echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
            sudo apt-get update
            sudo apt-get install -y k6
        # Check if running on CentOS/RHEL/Fedora
        elif command -v yum >/dev/null 2>&1; then
            echo "🔧 Installing k6 via yum..."
            sudo yum install -y https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.rpm
        elif command -v dnf >/dev/null 2>&1; then
            echo "🔧 Installing k6 via dnf..."
            sudo dnf install -y https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.rpm
        else
            echo "❌ Unsupported Linux distribution. Please install k6 manually."
            exit 1
        fi
        ;;
    Darwin*)
        echo "🍎 Detected macOS system"
        
        # Check if Homebrew is installed
        if command -v brew >/dev/null 2>&1; then
            echo "🔧 Installing k6 via Homebrew..."
            brew install k6
        else
            echo "❌ Homebrew not found. Please install Homebrew first or install k6 manually."
            echo "   Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        ;;
    CYGWIN*|MINGW*|MSYS*)
        echo "🪟 Detected Windows system"
        
        # Check if Chocolatey is installed
        if command -v choco >/dev/null 2>&1; then
            echo "🔧 Installing k6 via Chocolatey..."
            choco install k6
        # Check if Scoop is installed
        elif command -v scoop >/dev/null 2>&1; then
            echo "🔧 Installing k6 via Scoop..."
            scoop install k6
        else
            echo "❌ Package manager not found. Please install k6 manually."
            echo "   Download from: https://k6.io/docs/getting-started/installation/"
            exit 1
        fi
        ;;
    *)
        echo "❌ Unsupported operating system: ${OS}"
        echo "   Please install k6 manually from: https://k6.io/docs/getting-started/installation/"
        exit 1
        ;;
esac

# Verify installation
if command -v k6 >/dev/null 2>&1; then
    K6_VERSION=$(k6 version)
    echo "✅ k6 installed successfully!"
    echo "📋 Version: ${K6_VERSION}"
    
    # Create k6 configuration directory
    mkdir -p ~/.k6
    echo "📁 Created k6 configuration directory: ~/.k6"
    
    # Create k6 config file
    cat > ~/.k6/config.json << EOF
{
  "summaryTrendStats": ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  "summaryTimeUnit": "ms",
  "noColor": false,
  "quiet": false,
  "verbose": false,
  "logOutput": "stderr",
  "logLevel": "info"
}
EOF
    echo "⚙️  Created k6 configuration file: ~/.k6/config.json"
    
    # Test k6 installation
    echo "🧪 Testing k6 installation..."
    k6 run --quiet - << 'EOF'
import http from 'k6/http';

export default function () {
  http.get('https://httpbin.org/get');
}
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ k6 test completed successfully!"
    else
        echo "❌ k6 test failed. Please check your installation."
        exit 1
    fi
    
else
    echo "❌ k6 installation failed or k6 command not found in PATH"
    exit 1
fi

echo ""
echo "🎉 k6 Performance Testing Tool Installation Complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Navigate to the performance-tests directory: cd performance-tests"
echo "   2. Run a basic load test: npm run test:load:local"
echo "   3. Run stress testing: npm run test:stress:local"
echo "   4. View the performance testing guide: cat README.md"
echo ""
echo "🔗 Useful resources:"
echo "   - k6 Documentation: https://k6.io/docs/"
echo "   - k6 Examples: https://github.com/grafana/k6/tree/master/examples"
echo "   - Performance Testing Best Practices: https://k6.io/docs/testing-guides/"
