# AuraCode - Technical Architecture

## System Overview

AuraCode is a distributed voice-controlled code generation system with three core components that communicate via WebSocket with room-based pairing and real-time streaming.

## Component Architecture

### 1. Relay Server (`relay-server/server.js`)

**Technology:** Node.js 18+ with ES Modules, WebSocket Server (`ws` package)

**Responsibilities:**
- Maintain room-based pairing system (4-digit codes)
- Route messages between extension and mobile within rooms
- Serve mobile HTML application
- Handle client identification and lifecycle
- Clean up stale connections and rooms

**Room System:**
```javascript
rooms = Map<string, {
  extension: WebSocket,
  mobile: WebSocket,
  createdAt: timestamp
}>

// Example: "1234" -> { extension: ws1, mobile: ws2, createdAt: 1234567890 }
```

**Message Flow:**
```
Extension connects → Generates 4-digit code → Creates room
Mobile connects → Submits code → Joins room
All messages routed within room only
```

**Cleanup Policy:**
- Unpaired clients: 10 minutes
- Empty/old rooms: 20 minutes
- Automatic garbage collection every 5 minutes

---

### 2. Mobile Remote (`mobile-app/mobile.html`)

**Technology:** Single-file HTML5 + Tailwind CSS + Lucide Icons + Web APIs

**Key Features:**

**A. Pairing Interface**
- 4-digit numeric input
- Real-time validation
- Error display
- Auto-focus on load

**B. Central Orb**
- Radial gradient background
- CSS animations (pulse, listening, error states)
- Lucide icon (microphone)
- State-based styling

**C. Glassmorphism Card**
- `backdrop-filter: blur(20px)`
- Semi-transparent background
- Cyan border glow
- Smooth fade-in animation

**D. Code Streaming Display**
- Monospaced font family
- Auto-scrolling to bottom
- Streaming cursor animation
- Syntax-aware escaping

**E. Haptic Feedback**
```javascript
// Approve action
navigator.vibrate([50, 30, 50]);

// Discard action
navigator.vibrate(30);
```

**State Machine:**
```
Disconnected → Pairing → Paired → Idle → Listening → Streaming → Preview → Idle
```

---

### 3. VS Code Extension (`extension/src/extension.ts`)

**Technology:** TypeScript 5.x, VS Code Extension API 1.75+

**Core Features:**

**A. Context Extraction**
```typescript
function extractContext(): {
  fileName: string;
  language: string;
  context: string;
  cursorLine: number;
}

// Reads configurable number of lines (default: 50)
// Before and after cursor position
// Total context window: 100 lines (50 + 50)
```

**B. Streaming Implementation**
```typescript
// Anthropic SSE parsing
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  // Parse Server-Sent Events
  // Extract text chunks
  // Send immediately to mobile via WebSocket
}
```

**C. Smart Indentation**
```typescript
// Option 1: SnippetString (smart)
const snippet = new vscode.SnippetString(code);
await editor.insertSnippet(snippet, position);

// Option 2: Simple insertion
await editor.edit(editBuilder => {
  editBuilder.insert(position, code);
});
```

**D. Status Bar States**
- Connecting: `$(sync~spin) AuraCode`
- Paired: `$(key) AuraCode: 1234`
- Active: `$(radio-tower) AuraCode`
- Error: `$(alert) AuraCode`
- Disconnected: `$(circle-outline) AuraCode`

---

## Message Protocol

### Client Identification

**Extension → Relay:**
```json
{
  "type": "identify",
  "clientType": "extension"
}
```

**Relay → Extension:**
```json
{
  "type": "pairing_code",
  "code": "1234"
}
```

**Mobile → Relay:**
```json
{
  "type": "identify",
  "clientType": "mobile"
}
```

**Mobile → Relay (Pairing):**
```json
{
  "type": "pair",
  "code": "1234"
}
```

**Relay → Mobile:**
```json
{
  "type": "paired",
  "code": "1234"
}
```

### Voice Prompt Flow

**Mobile → Extension:**
```json
{
  "type": "voice_prompt",
  "prompt": "Create a React component for authentication"
}
```

**Extension → Mobile (Start):**
```json
{
  "type": "stream_start",
  "fileName": "App.tsx",
  "language": "typescript"
}
```

**Extension → Mobile (Chunks):**
```json
{
  "type": "stream_chunk",
  "chunk": "const Auth"
}
```

**Extension → Mobile (End):**
```json
{
  "type": "stream_end"
}
```

**Mobile → Extension (Approval):**
```json
{
  "type": "approve"
}
```

### Error Handling

```json
{
  "type": "error",
  "message": "Description of error"
}
```

---

## API Integration

### Anthropic Claude (Streaming)

**Endpoint:** `https://api.anthropic.com/v1/messages`

**Headers:**
```
Content-Type: application/json
x-api-key: sk-ant-...
anthropic-version: 2023-06-01
```

**Request Body:**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "stream": true,
  "messages": [
    {
      "role": "user",
      "content": "Voice prompt"
    }
  ],
  "system": "Context-aware system prompt with file context"
}
```

**Response (SSE Format):**
```
data: {"type":"content_block_start",...}

data: {"type":"content_block_delta","delta":{"text":"const "}}

data: {"type":"content_block_delta","delta":{"text":"user = "}}

data: [DONE]
```

**Parsing Logic:**
```typescript
// Split by newlines
// Look for "data: " prefix
// Parse JSON
// Extract delta.text
// Send to mobile immediately
```

### OpenAI GPT (Streaming)

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer sk-...
```

**Request Body:**
```json
{
  "model": "gpt-4o",
  "stream": true,
  "messages": [
    {
      "role": "system",
      "content": "Context-aware system prompt"
    },
    {
      "role": "user",
      "content": "Voice prompt"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 4096
}
```

**Response (SSE Format):**
```
data: {"choices":[{"delta":{"content":"const "}}]}

data: {"choices":[{"delta":{"content":"user = "}}]}

data: [DONE]
```

---

## Security Architecture

### Pairing System

**Security Properties:**
- 4-digit codes = 10,000 possible combinations
- Codes generated server-side (unpredictable)
- Rooms isolated (no cross-talk)
- Time-limited (20 minute expiration)
- Single active session per code

**Attack Mitigation:**
- Brute force: Rate limiting can be added
- Replay: Codes expire
- Eavesdropping: Use WSS (TLS encryption)
- MITM: WSS + certificate pinning

### API Key Management

**Storage:**
```typescript
// VS Code SecretStorage (platform-specific encryption)
// macOS: Keychain
// Windows: Credential Manager
// Linux: Secret Service API

await context.secrets.store('auracode.anthropic.apiKey', key);
```

**Transmission:**
- Keys never sent over WebSocket
- Only used in server-side API calls
- Not logged to console or files

**Lifecycle:**
- Set via command palette
- Encrypted at rest
- Cleared on extension uninstall

### Network Security

**Local Development:**
```
Extension ←→ ws://localhost:8080 ←→ Mobile (on same network)
```

**ngrok Tunnel:**
```
Extension ←→ wss://abc123.ngrok.io ←→ Mobile (anywhere)
                    ↑
                  TLS encrypted
```

**Production:**
```
Extension ←→ wss://relay.auracode.dev ←→ Mobile
                    ↑
            TLS + Auth token
```

---

## Context Awareness System

### Context Window

**Configuration:**
- Default: 50 lines before + 50 lines after = 100 lines
- Configurable: 10-500 lines (20-1000 total)

**Extraction Logic:**
```typescript
const cursorLine = position.line;
const startLine = Math.max(0, cursorLine - contextLines);
const endLine = Math.min(totalLines, cursorLine + contextLines);

const contextRange = new vscode.Range(
  new vscode.Position(startLine, 0),
  new vscode.Position(endLine, 0)
);

const contextText = document.getText(contextRange);
```

### System Prompt Template

```
You are a context-aware code generation assistant.

CONTEXT:
- File: App.tsx
- Language: typescript
- Current code around cursor:
```typescript
[50 lines of actual code]
```

INSTRUCTIONS:
1. Generate ONLY the code requested
2. Match the style and conventions of surrounding code
3. Use appropriate indentation
4. Include necessary imports if needed
5. Keep code concise and production-ready
```

### Benefits

- **Style Matching**: AI sees existing patterns
- **Import Awareness**: Knows what's already imported
- **Type Inference**: Understands project types
- **Convention Following**: Matches naming, formatting
- **Better Completions**: Context-appropriate suggestions

---

## Streaming Architecture

### End-to-End Flow

```
1. Mobile sends voice prompt
   ↓
2. Extension extracts context (file + 100 lines)
   ↓
3. Extension calls AI API with stream=true
   ↓
4. Extension sends stream_start to mobile
   ↓
5. AI returns first chunk
   ↓
6. Extension forwards chunk immediately
   ↓
7. Mobile appends to display + auto-scroll
   ↓
8. Repeat steps 5-7 until complete
   ↓
9. Extension sends stream_end
   ↓
10. Mobile shows approve/discard buttons
```

### Latency Analysis

**Without Streaming:**
```
Time to first token (TTFT): 2-3s
Time to last token: 8-10s
User sees code at: 10s
```

**With Streaming:**
```
TTFT: 2-3s
Time to last token: 8-10s
User sees code at: 2-3s ← Perceived as instant!
```

### Buffer Management

**Server-Side (Extension):**
```typescript
let buffer = '';

// Accumulate partial chunks
buffer += decoder.decode(value, { stream: true });

// Split by newlines
const lines = buffer.split('\n');
buffer = lines.pop() || ''; // Keep incomplete line

// Process complete lines
for (const line of lines) {
  // Parse and forward
}
```

**Client-Side (Mobile):**
```javascript
let streamedCode = '';

function handleChunk(chunk) {
  streamedCode += chunk;
  codeDisplay.innerHTML = escapeHtml(streamedCode) + '<cursor>';
  codeDisplay.scrollTop = codeDisplay.scrollHeight;
}
```

---

## Smart Indentation

### SnippetString API

**Features:**
- Respects VS Code's indentation settings
- Auto-adjusts for nested blocks
- Preserves relative indentation
- Handles tabs vs. spaces

**Usage:**
```typescript
const code = `function hello() {
  console.log('world');
}`;

// Creates snippet with smart indentation
const snippet = new vscode.SnippetString(code);

// Inserts and auto-formats
await editor.insertSnippet(snippet, position);
```

**Fallback (Simple):**
```typescript
await editor.edit(editBuilder => {
  editBuilder.insert(position, code);
});
```

---

## Performance Considerations

### Memory

**Relay Server:**
- Minimal state (Map of rooms)
- Each room: ~2KB (2 WebSocket references)
- 1000 rooms = ~2MB

**Extension:**
- Context extraction: O(n) where n = contextLines
- Streaming buffer: <1MB typically
- No code caching

**Mobile:**
- Code display: DOM string manipulation
- Auto-scroll: Passive (no forced reflows)
- Animations: GPU-accelerated CSS

### Network

**WebSocket Messages:**
- Identification: ~50 bytes
- Voice prompt: ~200 bytes
- Stream chunk: ~20-100 bytes
- Total bandwidth: <10 KB/s during streaming

**API Calls:**
- Request: ~5KB (with context)
- Response: ~50KB (full code)
- Streaming: Chunked delivery (lower TTFT)

### CPU

**Extension:**
- Context extraction: <1ms
- Streaming parsing: ~0.1ms per chunk
- Insertion: <10ms

**Mobile:**
- Speech recognition: Browser-native (optimized)
- DOM updates: Batched via `innerHTML`
- Animations: CSS (GPU-offloaded)

---

## Error Handling

### Connection Errors

**Scenario:** Relay server down

**Extension:**
```typescript
ws.on('error', (err) => {
  updateStatusBar('error');
  showNotification('Connection error');
  // No auto-reconnect (user must manually connect)
});
```

**Mobile:**
```javascript
ws.onclose = () => {
  updateStatus('disconnected');
  // Auto-reconnect after 3 seconds
  setTimeout(connectWebSocket, 3000);
};
```

### API Errors

**Scenario:** Invalid API key

**Handling:**
```typescript
if (!response.ok) {
  const error = await response.text();
  
  sendToMobile({
    type: 'error',
    message: `API error: ${response.status}`
  });
  
  showNotification('Check API key');
}
```

### Streaming Interruption

**Scenario:** Network drops mid-stream

**Mobile:**
```javascript
// Timeout after 30 seconds of no chunks
let streamTimeout = setTimeout(() => {
  showError('Stream timeout');
}, 30000);

// Reset on each chunk
function handleChunk(chunk) {
  clearTimeout(streamTimeout);
  streamTimeout = setTimeout(...);
}
```

---

## Deployment Strategies

### Development

```
Relay:     localhost:8080
Extension: Debug mode (F5)
Mobile:    ngrok tunnel
```

### Staging

```
Relay:     staging.auracode.dev
Extension: .vsix install
Mobile:    HTTPS domain
```

### Production

```
Relay:     relay.auracode.dev (Railway/Fly.io)
Extension: VS Code Marketplace
Mobile:    CDN-hosted
```

---

## Future Enhancements

### Phase 2
- [ ] Multi-file context awareness
- [ ] Code diff preview before insertion
- [ ] Voice command history
- [ ] Offline mode (local LLMs)

### Phase 3
- [ ] Team collaboration (shared rooms)
- [ ] Custom system prompts
- [ ] Git integration (auto-commit)
- [ ] Metrics and analytics

---

**Version:** 1.0.0  
**Last Updated:** February 2026
