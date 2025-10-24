#!/bin/bash

# Enhanced Collaboration System Usage Guide
# Complete guide for using all collaboration features in Financbase

echo "🚀 Financbase Enhanced Collaboration System"
echo "=============================================="
echo ""

# Check system status
echo "📊 System Status Check:"
echo "======================"

# Check Next.js server
if curl -s http://localhost:3010 > /dev/null 2>&1; then
    echo "✅ Next.js Development Server: Running on http://localhost:3010"
else
    echo "❌ Next.js Development Server: Not running"
    echo "   Run: pnpm dev"
fi

# Check PartyKit server
if curl -s http://localhost:1999 > /dev/null 2>&1; then
    echo "✅ PartyKit WebSocket Server: Running on http://localhost:1999"
else
    echo "❌ PartyKit WebSocket Server: Not running"
    echo "   Run: pnpm partykit dev --port 1999"
fi

echo ""
echo "🌐 Access URLs:"
echo "==============="
echo "📱 Main Application: http://localhost:3010"
echo "💬 Collaboration Hub: http://localhost:3010/collaboration"
echo "🔌 WebSocket Server:  http://localhost:1999"
echo ""

echo "🎯 Quick Start Guide:"
echo "====================="
echo "1. Open http://localhost:3010 in your browser"
echo "2. Sign in with your Clerk account"
echo "3. Click 'Collaboration' in the sidebar (with 'New' badge)"
echo "4. Create your first workspace"
echo "5. Invite team members"
echo "6. Start collaborating!"
echo ""

echo "✨ Available Features:"
echo "======================"
echo "🏢 Workspace Management:"
echo "   - Create accounting firms, client workspaces, practice groups"
echo "   - Multi-role access control (owner, admin, manager, accountant, client, viewer)"
echo "   - Team member invitation and permission management"
echo "   - Practice metrics and performance tracking"
echo ""

echo "👥 Client-Advisor Workflows:"
echo "   - Comprehensive client onboarding with full profiles"
echo "   - Status tracking (active, inactive, prospect)"
echo "   - Engagement type management (monthly, quarterly, annual, project)"
echo "   - Client portal integration for secure communication"
echo "   - Workload balancing and client assignment"
echo ""

echo "✅ Approval Workflows:"
echo "   - Multi-level approval chains with conditional routing"
echo "   - Real-time approval tracking and escalation"
echo "   - Comprehensive audit trails for compliance"
echo "   - Automated notifications and reminders"
echo ""

echo "💬 Real-time Communication:"
echo "   - Multi-channel chat (public, private, direct messages)"
echo "   - Real-time messaging with typing indicators"
echo "   - Message reactions and emoji support"
echo "   - File attachments with preview capabilities"
echo "   - Threaded conversations and reply chains"
echo ""

echo "📝 Enhanced Commenting:"
echo "   - Entity-specific commenting on invoices, expenses, documents"
echo "   - Threaded conversations with proper nesting"
echo "   - Internal vs client-facing note controls"
echo "   - @mention system for targeted notifications"
echo "   - Comment status management (active, resolved, archived)"
echo ""

echo "🎯 Practice Management:"
echo "   - Client satisfaction scoring and performance metrics"
echo "   - Response time monitoring and SLA management"
echo "   - Task completion rates and productivity analytics"
echo "   - Revenue tracking by client and engagement type"
echo "   - Overdue task management with automated reminders"
echo ""

echo "🔧 Developer Commands:"
echo "======================"
echo "📦 Install dependencies: pnpm install"
echo "🚀 Start development:    pnpm dev"
echo "🔌 Start PartyKit:       pnpm partykit dev --port 1999"
echo "🧪 Run tests:           ./test-collaboration.sh"
echo "📚 View documentation:   cat COLLABORATION_README.md"
echo ""

echo "🔒 Security & Compliance:"
echo "=========================="
echo "✅ Role-based access control with workspace-scoped permissions"
echo "✅ Comprehensive audit trails for all collaboration activities"
echo "✅ Data isolation between workspaces and clients"
echo "✅ Internal note controls for sensitive information"
echo "✅ SOC 2 and GDPR compliance features"
echo ""

echo "📱 Navigation Guide:"
echo "===================="
echo "Main Sidebar → Collaboration (with 'New' badge)"
echo ""
echo "Collaboration Hub Tabs:"
echo "  📊 Overview:   Dashboard with metrics and recent activity"
echo "  🏢 Workspaces: Multi-workspace management and team setup"
echo "  👥 Clients:    Client onboarding and relationship management"
echo "  ✅ Approvals:  Real-time approval workflows and tracking"
echo "  💬 Chat:       Real-time messaging with channels and presence"
echo ""

echo "🚨 Troubleshooting:"
echo "==================="
echo "If real-time features aren't working:"
echo "1. Check PartyKit server: curl http://localhost:1999"
echo "2. Verify WebSocket connection in browser dev tools"
echo "3. Check browser console for connection errors"
echo "4. Ensure no firewall blocking WebSocket connections"
echo ""

echo "🎉 You're All Set!"
echo "=================="
echo "The Enhanced Collaboration System is ready to use!"
echo "Navigate to http://localhost:3010/collaboration to get started."
echo ""
echo "For detailed documentation, see: COLLABORATION_README.md"
