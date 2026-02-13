# Contributing to ZenVoice Codex

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/zenvoice-codex.git
   cd zenvoice-codex
   ```

2. **Install Dependencies**
   ```bash
   ./setup.sh
   ```

3. **Start Development**
   ```bash
   # Terminal 1: Relay server
   cd relay-server && npm start
   
   # Terminal 2: Extension watch mode
   cd extension && npm run watch
   ```

## Code Style

- **TypeScript**: Follow existing patterns, use strict typing
- **HTML/CSS**: Maintain zen aesthetic (black, zinc, white palette)
- **Commits**: Use conventional commits format
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation changes
  - `refactor:` Code refactoring
  - `style:` Formatting changes
  - `test:` Test additions/changes

## Testing

Before submitting:
1. Test the full flow (voice → preview → insertion)
2. Test with both Claude and OpenAI models
3. Verify on multiple devices (iOS/Android)
4. Check console for errors

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit PR with clear description

## Areas for Contribution

### High Priority
- [ ] Multi-language syntax highlighting in mobile preview
- [ ] Offline mode / local LLM support
- [ ] Voice command history
- [ ] Diff view before insertion

### Medium Priority
- [ ] Custom prompts/templates
- [ ] Team collaboration features
- [ ] Voice feedback/confirmation
- [ ] Error recovery improvements

### Low Priority
- [ ] Dark/light theme toggle
- [ ] Additional AI providers
- [ ] Metrics and analytics
- [ ] Plugin architecture

## Security Guidelines

- **Never** commit API keys or secrets
- Use `vscode.secrets` for sensitive data
- Validate all inputs from WebSocket messages
- Sanitize generated code before insertion
- Report security issues privately

## Questions?

Open an issue or reach out to the maintainers.

---

**Code of Conduct**: Be respectful, constructive, and kind. We're building a peaceful developer tool, after all. ☮️
