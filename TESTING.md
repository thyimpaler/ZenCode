# ZenVoice Codex - Testing Guide

## Manual Testing Checklist

### Pre-Flight Checks

- [ ] Node.js 18+ installed: `node --version`
- [ ] VS Code 1.75+ installed
- [ ] ngrok installed (or alternative tunnel)
- [ ] Smartphone with modern browser (Chrome/Safari)

### Setup Testing

#### 1. Relay Server
```bash
cd relay-server
npm install
npm start
```

**Expected Output:**
```
╔═══════════════════════════════════════╗
║    ZenVoice Codex Relay Server       ║
╚═══════════════════════════════════════╝

  HTTP:      http://localhost:8080
  WebSocket: ws://localhost:8080

  Mobile App: Open browser to HTTP URL
  Status:     GET /health
```

**Test:**
```bash
# Should return connection status
curl http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "connections": {
    "extension": false,
    "mobile": false
  }
}
```

#### 2. ngrok Tunnel
```bash
ngrok http 8080
```

**Expected Output:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:8080
```

**Test:**
- Copy the HTTPS URL
- Open in desktop browser
- Should see mobile interface

#### 3. VS Code Extension

**Installation:**
```bash
cd extension
npm install
npm run compile
```

**Launch:**
1. Open `extension` folder in VS Code
2. Press `F5` (or Run → Start Debugging)
3. New VS Code window opens

**Test:**
- Press `Cmd/Ctrl+Shift+P`
- Type "ZenVoice"
- Should see 5 commands listed

### Functional Testing

#### Test 1: WebSocket Connection

**Steps:**
1. Start relay server
2. Launch extension (F5)
3. Extension should auto-connect

**Expected:**
- Status bar shows `$(radio-tower) ZenVoice`
- Relay console shows: `[✓] Extension connected`

**Verify:**
```bash
curl http://localhost:8080/health
```
Should show `"extension": true`

#### Test 2: Mobile Connection

**Steps:**
1. Open ngrok URL on phone
2. Grant microphone permissions if prompted

**Expected:**
- Status dot turns green
- Status text shows "Connected"
- Relay console shows: `[✓] Mobile connected`

**Verify:**
```bash
curl http://localhost:8080/health
```
Should show both `"extension": true` and `"mobile": true`

#### Test 3: API Key Storage

**Steps:**
1. In Extension Development Host:
   - `Cmd/Ctrl+Shift+P` → "ZenVoice: Set Anthropic API Key"
   - Enter: `sk-ant-test123` (or real key)
   - Repeat for OpenAI if available

**Expected:**
- Success notification appears
- Output channel logs: "Anthropic API key updated"

**Security Check:**
- Keys stored in VS Code secrets (encrypted)
- NOT visible in settings.json
- NOT transmitted to relay

#### Test 4: Voice Recognition

**Steps:**
1. On mobile, tap microphone button
2. Speak: "Create a function that adds two numbers"

**Expected:**
- Button pulses with animation
- Text appears: "Listening..."
- After speech: Shows transcript
- Relay logs: `[mobile] Message: voice_prompt`
- Extension logs: `Voice prompt: "Create a function that adds two numbers"`

#### Test 5: Code Generation (Claude)

**Prerequisites:**
- Valid Anthropic API key set
- Active internet connection

**Steps:**
1. Mobile settings: Model = "claude" (default)
2. Speak: "Create a TypeScript function to validate email"

**Expected Timeline:**
- Mobile shows: "Generating code..."
- Extension calls Anthropic API
- ~3-5 seconds later
- Mobile displays code preview card

**Verify Preview:**
- Code appears in monospaced font
- Language badge shows "typescript"
- "Confirm & Insert" and "Discard" buttons visible

#### Test 6: Code Generation (OpenAI)

**Prerequisites:**
- Valid OpenAI API key set

**Steps:**
1. Modify mobile app to use OpenAI:
   ```javascript
   // In index.html, line ~296
   model: 'openai'  // change from 'claude'
   ```
2. Speak: "Create a Python function to read CSV files"

**Expected:**
- Similar flow to Test 5
- Uses GPT-4o model
- Code preview appears

#### Test 7: Code Insertion

**Steps:**
1. In Extension Development Host, create new file: `test.ts`
2. Position cursor at line 1
3. On mobile, tap "Confirm & Insert"

**Expected:**
- Code appears at cursor position
- Mobile preview disappears
- Mobile shows: "Code inserted ✓"
- Extension Output: "Code inserted (cursor mode)"

**Verify:**
- Code matches preview exactly
- Cursor positioned after inserted code

#### Test 8: Insert Modes

**Cursor Mode:**
```typescript
// Before: Hello| world
// After:  Hello const x = 1;| world
```

**Replace Mode:**
```typescript
// Before: Hello [world]
// After:  Hello const x = 1;|
```

**Append Mode:**
```typescript
// Before: Hello
//         world
// After:  Hello
//         world
//
//         const x = 1;|
```

**Test Each:**
1. Change `zenvoice.insertMode` in settings
2. Generate code
3. Approve
4. Verify behavior

### Error Testing

#### Test 9: Missing API Key

**Steps:**
1. Run "ZenVoice: Clear All API Keys"
2. Speak a prompt

**Expected:**
- Error sent to mobile
- Mobile displays: "Error: Anthropic API key not set..."
- Notification in VS Code
- No code generated

#### Test 10: Invalid API Key

**Steps:**
1. Set API key to "sk-invalid-key-12345"
2. Speak a prompt

**Expected:**
- API error returned
- Mobile shows error message
- Extension Output logs full error

#### Test 11: Network Failure

**Steps:**
1. Disconnect from internet
2. Speak a prompt

**Expected:**
- Fetch fails with network error
- Error propagated to mobile
- Clear error message to user

#### Test 12: WebSocket Disconnect

**Steps:**
1. Stop relay server while connected
2. Try to speak a prompt

**Expected:**
- Extension detects disconnect
- Status bar updates to disconnected state
- Mobile shows connection error
- Auto-reconnect attempts (every 3s)

#### Test 13: Mobile Microphone Denied

**Steps:**
1. Deny microphone permissions in browser
2. Tap mic button

**Expected:**
- Error message: "Error: not-allowed"
- Prompt suggests granting permissions
- Mic button remains enabled for retry

### Performance Testing

#### Test 14: Latency Measurement

**Measure:**
1. Voice recognition time (speech → transcript)
2. API call time (request → response)
3. WebSocket relay time (msg → delivery)
4. Total end-to-end time

**Expected:**
- Voice: <2 seconds (for clear speech)
- API: 2-10 seconds (depends on complexity)
- Relay: <100ms
- Total: 5-15 seconds typical

#### Test 15: Large Code Generation

**Steps:**
1. Speak: "Create a complete React component with TypeScript, state management, and API calls"
2. Monitor response time

**Expected:**
- Longer API call (~10-15s)
- Code preview scrollable
- Insertion works correctly

### Edge Cases

#### Test 16: Empty Speech

**Steps:**
1. Tap mic
2. Say nothing (silence)
3. Wait for auto-stop

**Expected:**
- Recognition ends
- No prompt sent
- No error shown
- Can retry immediately

#### Test 17: Ambiguous Prompt

**Steps:**
1. Speak: "Make it better"

**Expected:**
- AI generates code (may be generic)
- Or returns error/clarification request
- System handles gracefully

#### Test 18: Multiple Rapid Prompts

**Steps:**
1. Speak prompt 1
2. Immediately speak prompt 2 (before preview)
3. Speak prompt 3

**Expected:**
- Each queued and processed
- Previews appear sequentially
- No crashes or lost messages

#### Test 19: Concurrent Mobile Connections

**Steps:**
1. Open mobile app on two devices
2. Try speaking from both

**Expected:**
- Last connection replaces previous
- Relay logs: "Replacing existing mobile connection"
- Single active mobile client

### Browser Compatibility

#### Test 20: Mobile Browsers

**Test on:**
- [ ] iOS Safari
- [ ] iOS Chrome
- [ ] Android Chrome
- [ ] Android Firefox
- [ ] Android Samsung Internet

**Verify:**
- Speech recognition works
- WebSocket connects
- UI renders correctly
- Animations smooth

### Stress Testing

#### Test 21: Long-Running Session

**Steps:**
1. Keep all components running for 1+ hour
2. Periodically generate code
3. Let connections idle

**Expected:**
- No memory leaks
- No disconnects
- Stable performance

#### Test 22: Relay Server Restart

**Steps:**
1. While connected, restart relay
2. Wait for auto-reconnect

**Expected:**
- Extension reconnects automatically
- Mobile reconnects automatically
- Resume normal operation

## Automated Testing (Future)

### Unit Tests
```bash
# Extension
cd extension
npm test

# Relay
cd relay-server
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Debugging Tools

### VS Code Extension
```
Help → Toggle Developer Tools
```
- Console for errors
- Network tab for API calls
- Debugging breakpoints

### Mobile Browser
```
Safari: Develop → [Your Phone] → [Page]
Chrome: chrome://inspect
```

### Relay Server
```javascript
// Add verbose logging in server.js
console.log('[DEBUG]', JSON.stringify(data, null, 2));
```

### Network Inspection
```bash
# Monitor WebSocket traffic
wscat -c ws://localhost:8080

# Send test message
{"type":"identify","clientType":"mobile"}
```

## Test Results Template

```markdown
# Test Results - [Date]

## Environment
- OS: macOS 14.0 / Windows 11 / Ubuntu 22.04
- VS Code: 1.85.0
- Node.js: 20.10.0
- Phone: iPhone 15 / Samsung S23

## Results

| Test | Status | Notes |
|------|--------|-------|
| Relay Server | ✅ Pass | |
| Extension Connection | ✅ Pass | |
| Mobile Connection | ✅ Pass | |
| Voice Recognition | ✅ Pass | Clear speech required |
| Claude API | ✅ Pass | |
| OpenAI API | ⏭️ Skip | No API key |
| Code Insertion | ✅ Pass | |
| Error Handling | ✅ Pass | |

## Issues Found
- None

## Recommendations
- Add automated E2E tests
- Improve error messages
```

---

**Remember:** Test in multiple environments. Real users have diverse setups!
