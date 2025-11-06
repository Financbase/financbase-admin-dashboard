#!/bin/bash

# Script to view OpenAPI documentation
# This script provides multiple options to view the generated API documentation

echo "📚 Financbase API Documentation Viewer"
echo "======================================="
echo ""

# Check if openapi.json exists
if [ ! -f "public/openapi.json" ]; then
    echo "❌ OpenAPI specification not found!"
    echo "   Run 'npm run openapi:generate' first to generate the documentation."
    exit 1
fi

echo "✅ OpenAPI specification found: public/openapi.json"
echo ""
echo "Choose a viewing option:"
echo ""
echo "1. Open in Swagger Editor (online)"
echo "2. Open in Swagger UI (local server)"
echo "3. Copy file path to clipboard"
echo "4. View in Next.js app (http://localhost:3000/api-docs)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Opening Swagger Editor..."
        echo "   URL: https://editor.swagger.io/"
        echo ""
        echo "📋 Instructions:"
        echo "   1. Go to File > Import File"
        echo "   2. Select: $(pwd)/public/openapi.json"
        echo ""
        if command -v open &> /dev/null; then
            open "https://editor.swagger.io/"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "https://editor.swagger.io/"
        else
            echo "   Please manually open: https://editor.swagger.io/"
        fi
        ;;
    2)
        echo ""
        echo "🚀 Starting local Swagger UI server..."
        echo ""
        if command -v npx &> /dev/null; then
            npx --yes swagger-ui-serve public/openapi.json --port 3001 --open
        else
            echo "❌ npx not found. Please install Node.js or use option 1 or 4."
        fi
        ;;
    3)
        file_path="$(pwd)/public/openapi.json"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "$file_path" | pbcopy
            echo "✅ File path copied to clipboard:"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "$file_path" | xclip -selection clipboard
            echo "✅ File path copied to clipboard:"
        else
            echo "📋 File path (copy manually):"
        fi
        echo "   $file_path"
        ;;
    4)
        echo ""
        echo "🌐 Next.js API Docs Page"
        echo "   URL: http://localhost:3000/api-docs"
        echo ""
        echo "   Make sure your Next.js dev server is running:"
        echo "   npm run dev"
        echo ""
        if command -v open &> /dev/null; then
            open "http://localhost:3000/api-docs"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "http://localhost:3000/api-docs"
        else
            echo "   Please manually open: http://localhost:3000/api-docs"
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

