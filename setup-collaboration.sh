#!/bin/bash

# Financbase Enhanced Collaboration System Setup
# This script sets up the PartyKit WebSocket server for real-time collaboration features

echo "🚀 Setting up Enhanced Collaboration System..."

# Check if PartyKit is installed
if ! command -v partykit &> /dev/null; then
    echo "📦 Installing PartyKit..."
    npm install -g partykit
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Set up environment variables
echo "🔧 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "📝 Please update .env.local with your PartyKit token:"
    echo "   PARTY_KIT_TOKEN=your_partykit_token_here"
else
    echo "✅ .env.local already exists"
fi

# Deploy PartyKit server
echo "🚀 Deploying PartyKit server..."
if command -v partykit &> /dev/null; then
    partykit deploy
    echo "✅ PartyKit server deployed successfully!"
else
    echo "❌ PartyKit not found. Please install it first:"
    echo "   npm install -g partykit"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

echo ""
echo "🎉 Enhanced Collaboration System Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo "1. Update .env.local with your PartyKit token"
echo "2. Run 'partykit dev' for local development"
echo "3. Access collaboration features at /collaboration"
echo "4. Check COLLABORATION_README.md for usage instructions"
echo ""
echo "🔗 Real-time Features:"
echo "- WebSocket connections via PartyKit"
echo "- Live presence indicators"
echo "- Real-time messaging and notifications"
echo "- Collaborative document editing"
echo ""
echo "📱 Available at:"
echo "- Collaboration Hub: /collaboration"
echo "- Workspace Management: /collaboration (Workspaces tab)"
echo "- Client Management: /collaboration (Clients tab)"
echo "- Approval Workflows: /collaboration (Approvals tab)"
echo "- Real-time Chat: /collaboration (Chat tab)"
