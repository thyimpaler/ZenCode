# ZenVoice Codex - Quick Reference

## 🚀 Getting Started (5 minutes)

```bash
# 1. Install dependencies
./setup.sh

# 2. Start relay server
cd relay-server && npm start

# 3. Start ngrok (new terminal)
ngrok http 8080

# 4. Copy ngrok URL (e.g., https://abc123.ngrok.io)

# 5. Open VS Code, press F5 to launch extension

# 6. Set API keys in VS Code
Cmd/Ctrl+Shift+P → "ZenVoice: Set Anthropic API Key"

# 7. Open ngrok URL on your phone
```

## 📱 Mobile Interface

| Action | Gesture |
|--------|---------|
| Start listening | Tap microphone button |
| Stop listening | Automatic after speech ends |
| Confirm code | Tap "Confirm & Insert" |
| Discard code | Tap "Discard" |

## ⌨️ VS Code Commands

| Command | Description |
|---------|-------------|
| `ZenVoice: Connect to Relay` | Connect extension to relay server |
| `ZenVoice: Disconnect from Relay` | Close WebSocket connection |
| `ZenVoice: Set Anthropic API Key` | Store Claude API key securely |
| `ZenVoice: Set OpenAI API Key` | Store GPT API key securely |
| `ZenVoice: Clear All API Keys` | Remove all stored keys |

## 🎤 Example Voice Prompts

### React/TypeScript
- *"Create a React component for a dark mode toggle"*
- *"Add a useState hook for managing form state"*
- *"Write a custom hook for fetching data"*

### Python
- *"Create a function to validate email addresses"*
- *"Write a class for managing a database connection"*
- *"Add error handling to the current function"*

### JavaScript
- *"Create an async function to fetch user data"*
- *"Write a debounce utility function"*
- *"Add TypeScript types to this code"*

### General
- *"Refactor this to use modern ES6 syntax"*
- *"Add comprehensive JSDoc comments"*
- *"Convert this callback to async/await"*

## ⚙️ Configuration Settings

| Setting | Default | Options |
|---------|---------|---------|
| `zenvoice.relayUrl` | `ws://localhost:8080` | Any WebSocket URL |
| `zenvoice.defaultModel` | `claude` | `claude`, `openai` |
| `zenvoice.insertMode` | `cursor` | `cursor`, `replace`, `append` |
| `zenvoice.autoConnect` | `true` | `true`, `false` |
| `zenvoice.claudeModel` | `claude-sonnet-4-20250514` | See package.json |
| `zenvoice.openaiModel` | `gpt-4o` | See package.json |

## 🔧 Troubleshooting

### Mobile won't connect
```bash
# Check relay is running
curl http://localhost:8080/health

# Verify ngrok tunnel
ngrok http 8080
# Use HTTPS URL on phone
```

### Extension can't reach relay
```bash
# Update settings.json
{
  "zenvoice.relayUrl": "wss://your-ngrok-url.ngrok.io"
}
```

### No code insertion
1. Ensure a file is open and active
2. Check Output panel: `View → Output → ZenVoice Codex`
3. Verify API key is set: Run `ZenVoice: Set Anthropic API Key`

### Speech not recognized
- Use Chrome or Safari on mobile
- Grant microphone permissions
- Speak clearly in a quiet environment
- Check browser console for errors

## 🔐 Security Checklist

- [ ] API keys stored only in VS Code secrets
- [ ] `.gitignore` includes `.env` and `*.key`
- [ ] ngrok tunnel uses authentication: `ngrok http 8080 --basic-auth="user:pass"`
- [ ] Relay not exposed to public internet without protection

## 📊 Status Indicators

### Status Bar (VS Code)

| Icon | Status | Meaning |
|------|--------|---------|
| `$(radio-tower)` | Connected | Active connection to relay |
| `$(circle-outline)` | Disconnected | Click to connect |
| `$(alert)` | Error | Connection failed |

### Mobile Dot Indicator

| Color | Status |
|-------|--------|
| 🟢 Green | Connected to relay |
| 🔴 Red | Connection error |
| ⚫ Gray | Disconnected |

## 🎨 Design Palette

```css
/* Pure Black */
background: #000000;

/* Zinc-800 */
cards: #27272a;

/* Chalk White */
text: #fafafa;

/* Accent - Zinc-400 */
muted: #a1a1aa;
```

## 📝 File Locations

```
zenvoice-codex/
├── README.md                    # Main documentation
├── ARCHITECTURE.md              # Technical deep-dive
├── CONTRIBUTING.md              # Contribution guide
├── LICENSE                      # MIT License
├── setup.sh                     # Automated setup script
├── relay-server/
│   ├── server.js               # WebSocket relay
│   └── package.json
├── mobile-app/
│   └── index.html              # Single-file web app
└── extension/
    ├── package.json            # VS Code manifest
    ├── tsconfig.json
    └── src/
        └── extension.ts        # Main logic
```

## 🆘 Getting Help

1. Check the [README.md](README.md) for detailed setup
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
3. Enable notifications: `zenvoice.showNotifications: true`
4. Check logs in VS Code Output panel
5. Open an issue on GitHub

## 💡 Pro Tips

- **Faster iterations**: Keep mobile preview open, speak multiple commands
- **Better results**: Be specific in voice prompts (mention language, framework)
- **Code context**: Mention current file type for better inference
- **Quick approval**: Preview on phone, approve on watch if supported
- **Batch operations**: Generate multiple functions in one session

---

**Made with ☮️ for peaceful coding**
