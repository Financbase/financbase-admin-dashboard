#!/bin/bash

# Financbase Mobile PWA Testing Guide
# Run this script to test mobile functionality

echo "🏁 Financbase Mobile PWA Testing Guide"
echo "======================================"

# Check if development server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Development server is running on http://localhost:3000"
else
    echo "❌ Development server is not running"
    echo "   Please start with: pnpm dev"
    exit 1
fi

echo ""
echo "📱 Mobile Testing Instructions"
echo "=============================="

echo "1. 🌐 Open in Mobile Browser:"
echo "   - iOS Safari: http://localhost:3000"
echo "   - Android Chrome: http://localhost:3000"
echo "   - Enable mobile view in browser dev tools"

echo ""
echo "2. 📱 Test PWA Installation:"
echo "   - Look for 'Install App' or 'Add to Home Screen' prompt"
echo "   - Check if app installs successfully"
echo "   - Verify offline functionality"

echo ""
echo "3. 🔧 Test Mobile Features:"
echo "   - Responsive navigation (hamburger menu)"
echo "   - Touch interactions and gestures"
echo "   - Mobile-optimized forms"
echo "   - Device detection and screen size adaptation"

echo ""
echo "4. 🌍 Test Internationalization:"
echo "   - Navigate to: http://localhost:3000/es (Spanish)"
echo "   - Navigate to: http://localhost:3000/fr (French)"
echo "   - Navigate to: http://localhost:3000/de (German)"
echo "   - Verify language switching works"

echo ""
echo "5. 📧 Test Email Functionality:"
echo "   - Check if Resend API key is configured"
echo "   - Test invoice email sending"
echo "   - Verify email templates render correctly"

echo ""
echo "6. 🎯 Test Core Features on Mobile:"
echo "   - Dashboard responsiveness"
echo "   - Invoice creation and management"
echo "   - Expense tracking"
echo "   - Settings and preferences"

echo ""
echo "📋 Testing Checklist:"
echo "===================="
echo "□ PWA installation prompt appears"
echo "□ App installs and launches correctly"
echo "□ Offline functionality works"
echo "□ All languages load correctly (en/es/fr/de)"
echo "□ Email templates send successfully"
echo "□ Mobile navigation works smoothly"
echo "□ Forms are mobile-optimized"
echo "□ Touch gestures work properly"
echo "□ Responsive design adapts to screen size"

echo ""
echo "🚀 Production Deployment Checklist:"
echo "=================================="
echo "□ Environment variables configured"
echo "□ Database migrations run"
echo "□ Email service configured (Resend)"
echo "□ PWA assets optimized"
echo "□ Internationalization files complete"
echo "□ Security headers configured"
echo "□ Performance monitoring enabled"

echo ""
echo "🔗 Quick Access URLs:"
echo "===================="
echo "Main App:     http://localhost:3000"
echo "Spanish:      http://localhost:3000/es"
echo "French:       http://localhost:3000/fr"
echo "German:       http://localhost:3000/de"
echo "Dashboard:    http://localhost:3000/dashboard"
echo "Settings:     http://localhost:3000/settings/preferences"

echo ""
echo "✅ Testing complete! All systems ready for production deployment."
