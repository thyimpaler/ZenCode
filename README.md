# AuraCode

<div align="center">

**Context-Aware Voice Coding with Streaming AI**

*Voice your intent. Watch code stream. Approve with a glow.*

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.75+-050505.svg)](https://code.visualstudio.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-050505.svg)](https://nodejs.org/)

</div>

---

## 🌟 Overview

AuraCode is a next-generation voice-controlled coding system that brings **streaming AI generation** to your mobile device while you code in VS Code. Unlike traditional voice coding tools, AuraCode provides:

- **🎯 Context Awareness**: Reads 50 lines around your cursor to understand your codebase
- **📱 Real-Time Streaming**: Watch code materialize on your phone as AI generates it
- **🔐 Secure Pairing**: 4-digit room codes keep your sessions private
- **✨ Zen Aesthetic**: Soft glow UI with glassmorphism and pulsing orb interactions
- **🎭 Smart Indentation**: Uses VS Code SnippetString for perfect formatting

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   VS Code       │         │  Relay Server   │         │  Mobile Remote  │
│   Extension     │◄───────►│  (Rooms/4-PIN)  │◄───────►│  (Zen UI)       │
│                 │         │                 │         │                 │
│  • Context      │         │  • WebSocket    │         │  • Voice Input  │
│  • Streaming    │         │  • Pairing      │         │  • Streaming    │
│  • Insertion    │         │  • Routing      │         │  • Approval     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                                                         │
        │                                                         │
        ▼                                                         ▼
┌─────────────────┐                                     ┌─────────────────┐
│  Anthropic      │                                     │  Speech API     │
│  Claude API     │                                     │  Vibration      │
│  (Streaming)    │                                     │  Glassmorphism  │
└─────────────────┘                                     └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **VS Code 1.75+** - [Download](https://code.visualstudio.com/)
- **ngrok** - [Download](https://ngrok.com/) (for mobile access)
- **Smartphone** with modern browser (Chrome/Safari)
- **API Key** from [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/)

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/auracode.git
cd auracode
```

#### 2. Start Relay Server

```bash
cd relay-server
npm install
npm start
```

**Expected Output:**
```
╔═══════════════════════════════════════╗
║       AuraCode Relay Server          ║
╚═══════════════════════════════════════╝

  HTTP:      http://localhost:8080
  WebSocket: ws://localhost:8080
  
  Mobile App: Open browser to HTTP URL
  Status:     GET /health
  Pairing:    4-digit code system
```

#### 3. Expose with ngrok

In a **new terminal**:

```bash
ngrok http 8080
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

#### 4. Install VS Code Extension

```bash
cd extension
npm install
npm run compile
```

**Launch Extension:**
1. Open `extension` folder in VS Code
2. Press `F5` (or Run → Start Debugging)
3. A new VS Code window opens

#### 5. Configure API Keys

In the Extension Development Host:

```
Cmd/Ctrl + Shift + P
→ "AuraCode: Set Anthropic API Key"
→ Enter: sk-ant-...
```

Or for OpenAI:

```
→ "AuraCode: Set OpenAI API Key"
→ Enter: sk-...
```

#### 6. Get Pairing Code

The extension auto-connects and displays a 4-digit pairing code:

- **Status Bar** shows: `🔑 AuraCode: 1234`
- **Notification** appears with the code
- Click status bar to copy code

#### 7. Connect Mobile

On your smartphone:

1. Navigate to your ngrok URL: `https://abc123.ngrok.io`
2. Enter the 4-digit pairing code
3. Tap "Connect"
4. Grant microphone permissions

---

## 🎨 The Zen Interface

### Color Palette

```css
/* Background Depths */
--void:       #050505;  /* Main background */
--dark-glass: #0a0a0a;  /* Glassmorphism cards */

/* Cyan Glow (Active/Listening) */
--cyan-glow:  #00ffff;
--cyan-dim:   rgba(0, 255, 255, 0.3);

/* Red Glow (Errors) */
--red-glow:   #ff5252;
--red-dim:    rgba(255, 82, 82, 0.3);

/* Text */
--white:      #ffffff;
--gray:       #a0a0a0;
```

### UI Elements

**Central Orb**
- **Idle**: Soft cyan glow, gentle pulse (3s cycle)
- **Listening**: Bright cyan, rapid pulse (1s cycle)
- **Error**: Red glow, no animation

**Glassmorphism Card**
- Frosted glass effect with 20px blur
- Subtle cyan border glow
- Auto-scrolling code preview
- Streaming cursor animation

**Action Buttons**
- Cyan glow for "Approve" (success)
- Red glow for "Discard" (cancel)
- Haptic feedback via `navigator.vibrate`

---

## 🎤 Zen Mode Usage Guide

### The Perfect Session

1. **Position Your Cursor**
   - Place cursor where you want code inserted
   - AuraCode reads 50 lines before/after for context

2. **Open Mobile Remote**
   - Phone displays the pulsing orb
   - Tap "Start Listening" when ready

3. **Voice Your Intent**
   - Speak naturally: *"Create a React component for user authentication"*
   - Orb pulses brighter during listening
   - Transcript appears below orb

4. **Watch Code Stream**
   - Glassmorphism card slides up
   - Code appears character-by-character
   - Streaming cursor blinks at the end
   - Auto-scrolls to show latest content

5. **Review & Approve**
   - Read generated code
   - Tap **"Approve"** to insert (phone vibrates)
   - Or **"Discard"** to cancel (light vibration)

6. **Code Inserted**
   - Appears at cursor position in VS Code
   - Smart indentation via SnippetString
   - Ready for immediate use or refinement

### Example Voice Prompts

**React/TypeScript:**
- *"Add a useState hook for managing modal visibility"*
- *"Create a custom hook for fetching user data with error handling"*
- *"Write a TypeScript interface for the API response"*

**Python:**
- *"Create a function to validate email addresses with regex"*
- *"Add error handling with try-except to the database query"*
- *"Write a class method for parsing CSV files"*

**Context-Aware:**
- *"Add error handling to this function"* (understands current function)
- *"Refactor this to use async await"* (sees surrounding code)
- *"Add TypeScript types"* (infers from context)

---

## ⚙️ Configuration

### Extension Settings

Access via: `Preferences → Settings → AuraCode`

| Setting | Default | Description |
|---------|---------|-------------|
| `auracode.relayUrl` | `ws://localhost:8080` | WebSocket relay URL (use `wss://` for ngrok) |
| `auracode.defaultModel` | `claude` | AI model: `claude` or `openai` |
| `auracode.contextLines` | `50` | Lines to include as context (10-500) |
| `auracode.autoConnect` | `true` | Auto-connect to relay on startup |
| `auracode.showNotifications` | `true` | Show status notifications |
| `auracode.claudeModel` | `claude-sonnet-4-20250514` | Claude variant |
| `auracode.openaiModel` | `gpt-4o` | OpenAI variant |
| `auracode.useSmartIndent` | `true` | Use SnippetString for indentation |

### Update Relay URL for ngrok

```json
{
  "auracode.relayUrl": "wss://abc123.ngrok.io"
}
```

---

## 🔐 Security

### Pairing System

AuraCode uses a **room-based pairing system** for security:

1. Extension connects → Generates unique 4-digit code
2. Code creates isolated "room" on relay server
3. Mobile must submit correct code to join room
4. All messages routed only within that room
5. Rooms expire after 20 minutes of inactivity

### API Key Storage

- Keys stored in **VS Code SecretStorage** (encrypted)
- Never transmitted over WebSocket
- Never logged to console
- Automatically cleared on extension uninstall

### Network Security

**Local Development:**
- WebSocket runs on `localhost:8080`
- No external access

**Mobile Access (ngrok):**
- Use HTTPS tunnel: `ngrok http 8080`
- Optional: Add authentication: `ngrok http 8080 --basic-auth="user:pass"`
- Tunnel URL is temporary and rotates

**Production Deployment:**
- Deploy relay to cloud (Railway, Fly.io, Render)
- Use WSS (WebSocket Secure) with TLS certificates
- Implement token-based authentication
- Add rate limiting

### Security Checklist

- [ ] API keys set via secure commands
- [ ] ngrok tunnel uses authentication (optional)
- [ ] Relay not exposed to public internet without protection
- [ ] `.gitignore` includes sensitive files
- [ ] Review all generated code before approval

---

## 📊 Context Awareness

### How It Works

When you voice a prompt, AuraCode:

1. **Reads Active File**: Gets filename and language
2. **Extracts Context**: Grabs 50 lines before/after cursor
3. **Sends to AI**: Includes context in system prompt
4. **Generates Code**: AI understands surrounding code style

### Context Window

**Default**: 50 lines (configurable 10-500)

**Example:**
```typescript
// Your cursor is here ▼

// AuraCode reads:
// - 50 lines ABOVE cursor
// - 50 lines BELOW cursor
// = 100 lines total context

// AI sees imports, existing functions, types
// Matches your coding style automatically
```

### Adjusting Context

More context = Better understanding, slower processing

```json
{
  "auracode.contextLines": 100  // 200 lines total
}
```

---

## 🌊 Streaming Architecture

### Real-Time Delivery

AuraCode uses **Server-Sent Events (SSE)** from AI APIs:

```
AI API → Extension → Relay → Mobile

Chunk 1: "const "
Chunk 2: "user = "
Chunk 3: "{ name"
...
```

### Benefits

- **Immediate Feedback**: See code as it's generated
- **Cancel Early**: Discard if going wrong direction
- **Lower Latency**: Perceived speed improvement
- **Better UX**: Engaging streaming cursor animation

### Implementation

**Extension** (Node.js `fetch` with streaming):
```typescript
const response = await fetch(API_URL, { stream: true });
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  // Parse chunk and send immediately
  sendToMobile({ type: 'stream_chunk', chunk });
}
```

**Mobile** (Append to display):
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'stream_chunk') {
    streamedCode += data.chunk;
    codeDisplay.innerHTML = escapeHtml(streamedCode) + '<cursor>';
  }
};
```

---

## 🛠️ Troubleshooting

### Pairing Code Not Appearing

**Check:**
1. Extension connected to relay?
2. Status bar shows connection status
3. Check Output panel: `View → Output → AuraCode`

**Fix:**
```
Cmd/Ctrl + Shift + P
→ "AuraCode: Connect to Relay"
```

### Mobile Can't Connect

**Check:**
1. Relay server running?
2. ngrok tunnel active?
3. Using HTTPS URL on phone (not HTTP)

**Test:**
```bash
# Desktop
curl http://localhost:8080/health

# Should return:
{
  "status": "healthy",
  "activeRooms": 1,
  ...
}
```

### Code Not Streaming

**Check:**
1. API key set correctly?
2. Internet connection active?
3. Check browser console on mobile

**Verify:**
```
Cmd/Ctrl + Shift + P
→ "AuraCode: Set Anthropic API Key"
```

### Code Inserted with Wrong Indentation

**Enable Smart Indent:**
```json
{
  "auracode.useSmartIndent": true
}
```

### Speech Recognition Not Working

**Requirements:**
- Modern browser (Chrome/Safari on mobile)
- Microphone permissions granted
- HTTPS connection (required by Web Speech API)
- Quiet environment for best results

**Test:**
- Try saying: *"Hello testing"*
- Transcript should appear below orb

---

## 🎯 Advanced Usage

### Custom Context Window

For large codebases, increase context:

```json
{
  "auracode.contextLines": 200  // 400 lines total
}
```

### Switching AI Models

**Claude Sonnet** (default):
- Balanced speed and quality
- Best for general coding

**Claude Opus**:
- Highest quality
- Slower, more expensive

**OpenAI GPT-4o**:
- Fast, creative
- Good for rapid prototyping

Change in settings:
```json
{
  "auracode.defaultModel": "openai",
  "auracode.openaiModel": "gpt-4o"
}
```

### Multiple Sessions

Each pairing code creates an **isolated room**:

- Developer A: Code `1234` → Room A
- Developer B: Code `5678` → Room B
- No cross-talk between rooms

### Keyboard Shortcuts

Add custom shortcuts in `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+a",
    "command": "auracode.showPairingCode"
  }
]
```

---

## 📱 Mobile Features

### Haptic Feedback

- **Approve**: Triple pulse (50ms, 30ms, 50ms)
- **Discard**: Single pulse (30ms)

### Auto-Scrolling

Code preview automatically scrolls to bottom as new chunks arrive.

### Glassmorphism

Frosted glass effect requires:
- Modern browser (iOS Safari 14+, Chrome 76+)
- Hardware acceleration enabled

### Battery Optimization

- WebSocket uses minimal power
- Screen can dim during generation
- Efficient re-renders

---

## 🔧 Development

### Building Extension

```bash
cd extension
npm install
npm run compile      # One-time build
npm run watch        # Auto-rebuild on changes
```

### Testing Locally

```bash
# Terminal 1: Relay
cd relay-server && npm start

# Terminal 2: ngrok
ngrok http 8080

# Terminal 3: VS Code Extension
cd extension && code .
# Press F5 to launch
```

### Debugging

**Extension Logs:**
```
View → Output → AuraCode
```

**VS Code Developer Tools:**
```
Help → Toggle Developer Tools
```

**Mobile Console:**
- Safari: Develop → [Your Phone] → [Page]
- Chrome: `chrome://inspect`

---

## 📦 Deployment

### Relay Server

**Option 1: Railway**
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Option 2: Fly.io**
```toml
# fly.toml
app = "auracode-relay"

[build]
  builder = "paketobuildpacks/builder:base"

[[services]]
  internal_port = 8080
  protocol = "tcp"
```

**Option 3: Render**
- Create Web Service
- Connect GitHub repo
- Build: `npm install`
- Start: `npm start`

### Extension Distribution

**Package:**
```bash
cd extension
npm install -g @vscode/vsce
vsce package
```

Creates: `auracode-1.0.0.vsix`

**Publish to Marketplace:**
```bash
vsce publish
```

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing`
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- **Anthropic** - Claude AI streaming API
- **OpenAI** - GPT streaming API
- **Lucide** - Beautiful icon set
- **Tailwind CSS** - Utility-first styling

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/auracode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/auracode/discussions)
- **Email**: support@auracode.dev

---

<div align="center">

**Voice your code. Watch it stream. Feel the aura.** ✨

*Made with 🌊 for peaceful, context-aware coding*

</div>
