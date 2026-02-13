#!/bin/bash

# AuraCode - Automated Setup Script

echo "╔═══════════════════════════════════════╗"
echo "║       AuraCode Setup Wizard          ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo ""

# Install relay server dependencies
echo "📦 Installing relay server dependencies..."
cd relay-server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install relay dependencies"
    exit 1
fi
cd ..
echo "✓ Relay server ready"
echo ""

# Install extension dependencies
echo "📦 Installing extension dependencies..."
cd extension
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install extension dependencies"
    exit 1
fi
echo "✓ Extension dependencies installed"
echo ""

# Compile extension
echo "🔨 Compiling TypeScript..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ Failed to compile extension"
    exit 1
fi
cd ..
echo "✓ Extension compiled"
echo ""

echo "╔═══════════════════════════════════════╗"
echo "║        Setup Complete! 🎉            ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the relay server:"
echo "   cd relay-server && npm start"
echo ""
echo "2. In a new terminal, start ngrok:"
echo "   ngrok http 8080"
echo ""
echo "3. Open VS Code and press F5 to launch the extension"
echo ""
echo "4. Set your API keys in VS Code:"
echo "   - Cmd/Ctrl+Shift+P → 'AuraCode: Set Anthropic API Key'"
echo ""
echo "5. Get your pairing code from the status bar"
echo ""
echo "6. Open the ngrok URL on your phone and enter the code"
echo ""
echo "Happy voice coding! ✨"
