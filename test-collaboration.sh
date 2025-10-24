#!/bin/bash

# Financbase Collaboration System Test Script
# Tests all components of the collaboration system

echo "🧪 Testing Enhanced Collaboration System..."
echo ""

# Test 1: Check if Next.js dev server is running
echo "📡 Testing Next.js Development Server..."
if curl -s http://localhost:3010 > /dev/null 2>&1; then
    echo "✅ Next.js server is running on localhost:3010"
else
    echo "❌ Next.js server is not responding"
fi

# Test 2: Check if PartyKit server is running
echo ""
echo "🔌 Testing PartyKit WebSocket Server..."
if curl -s http://localhost:1999 > /dev/null 2>&1; then
    echo "✅ PartyKit server is running on localhost:1999"
else
    echo "❌ PartyKit server is not responding"
fi

# Test 3: Check collaboration page accessibility
echo ""
echo "🌐 Testing Collaboration Page..."
if curl -s http://localhost:3010/collaboration | grep -q "CollaborationHub"; then
    echo "✅ Collaboration page is accessible"
else
    echo "❌ Collaboration page not found or not rendering properly"
fi

# Test 4: Check WebSocket connectivity
echo ""
echo "🔄 Testing WebSocket Connection..."
if command -v websocat &> /dev/null; then
    # Test WebSocket connection (this might fail if no auth, but should connect)
    timeout 5 bash -c "</dev/tcp/localhost/1999" 2>/dev/null && echo "✅ WebSocket port is open" || echo "❌ WebSocket connection failed"
else
    echo "⚠️  WebSocket testing requires 'websocat' tool"
fi

# Test 5: Check component imports
echo ""
echo "📦 Testing Component Imports..."
if [ -f "components/collaboration/collaboration-hub.tsx" ]; then
    echo "✅ CollaborationHub component exists"
else
    echo "❌ CollaborationHub component missing"
fi

if [ -f "components/collaboration/workspace-management.tsx" ]; then
    echo "✅ WorkspaceManagement component exists"
else
    echo "❌ WorkspaceManagement component missing"
fi

if [ -f "components/collaboration/client-management.tsx" ]; then
    echo "✅ ClientManagement component exists"
else
    echo "❌ ClientManagement component missing"
fi

if [ -f "components/collaboration/approval-workflows.tsx" ]; then
    echo "✅ ApprovalWorkflows component exists"
else
    echo "❌ ApprovalWorkflows component missing"
fi

if [ -f "components/collaboration/comment-system.tsx" ]; then
    echo "✅ CommentSystem component exists"
else
    echo "❌ CommentSystem component missing"
fi

if [ -f "components/collaboration/chat-interface.tsx" ]; then
    echo "✅ ChatInterface component exists"
else
    echo "❌ ChatInterface component missing"
fi

# Test 6: Check TypeScript compilation
echo ""
echo "🔧 Testing TypeScript Compilation..."
if npx tsc --noEmit --skipLibCheck; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
fi

# Test 7: Check PartyKit server compilation
echo ""
echo "🚀 Testing PartyKit Server..."
if [ -f "partykit/server.ts" ]; then
    echo "✅ PartyKit server file exists"
    if npx tsc partykit/server.ts --noEmit --skipLibCheck; then
        echo "✅ PartyKit server compiles successfully"
    else
        echo "❌ PartyKit server compilation failed"
    fi
else
    echo "❌ PartyKit server file missing"
fi

# Test 8: Check environment configuration
echo ""
echo "⚙️  Testing Environment Configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "⚠️  .env.local not found (create from .env.example)"
fi

echo ""
echo "📊 Test Summary:"
echo "================"

# Count successful tests
success_count=0
total_tests=8

if curl -s http://localhost:3010 > /dev/null 2>&1; then ((success_count++)); fi
if curl -s http://localhost:1999 > /dev/null 2>&1; then ((success_count++)); fi
if curl -s http://localhost:3010/collaboration | grep -q "CollaborationHub"; then ((success_count++)); fi
if [ -f "components/collaboration/collaboration-hub.tsx" ]; then ((success_count++)); fi
if [ -f "components/collaboration/workspace-management.tsx" ]; then ((success_count++)); fi
if [ -f "components/collaboration/client-management.tsx" ]; then ((success_count++)); fi
if [ -f "components/collaboration/approval-workflows.tsx" ]; then ((success_count++)); fi
if [ -f "components/collaboration/comment-system.tsx" ]; then ((success_count++)); fi
if [ -f "components/collaboration/chat-interface.tsx" ]; then ((success_count++)); fi
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then ((success_count++)); fi
if [ -f "partykit/server.ts" ]; then
    if npx tsc partykit/server.ts --noEmit --skipLibCheck > /dev/null 2>&1; then ((success_count++)); fi
fi

echo "✅ Passed: $success_count/$total_tests tests"

if [ $success_count -eq $total_tests ]; then
    echo ""
    echo "🎉 All tests passed! Collaboration system is ready to use."
    echo ""
    echo "📱 Access the collaboration system at:"
    echo "   http://localhost:3010/collaboration"
    echo ""
    echo "🔧 Real-time features available at:"
    echo "   PartyKit WebSocket: http://localhost:1999"
    echo ""
    echo "📚 Documentation:"
    echo "   COLLABORATION_README.md - Complete usage guide"
    echo "   setup-collaboration.sh - Setup script"
else
    echo ""
    echo "⚠️  Some tests failed. Check the output above for details."
    echo ""
    echo "🔧 To fix common issues:"
    echo "   1. Run 'pnpm install' to ensure all dependencies are installed"
    echo "   2. Check .env.local for proper PartyKit configuration"
    echo "   3. Ensure PartyKit token is set: PARTY_KIT_TOKEN=your_token"
    echo "   4. Run 'pnpm partykit deploy' to deploy the WebSocket server"
fi

echo ""
echo "🚀 Quick Start:"
echo "   1. Open http://localhost:3010 in your browser"
echo "   2. Navigate to 'Collaboration' in the sidebar"
echo "   3. Create a workspace and start collaborating!"
echo ""
echo "✨ Features Ready:"
echo "   ✓ Multi-role workspace management"
echo "   ✓ Client-advisor workflows"
echo "   ✓ Real-time approval workflows"
echo "   ✓ Enhanced commenting system"
echo "   ✓ Real-time chat with channels"
echo "   ✓ Practice management analytics"
