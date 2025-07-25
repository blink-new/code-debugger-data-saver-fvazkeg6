# DebugVault Pro IDE 🚀

A premium IDE-like debugging application designed for coding professionals to capture, organize, and analyze debugging data with advanced AI assistance and team collaboration features.

![DebugVault Pro IDE](https://code-debugger-data-saver-fvazkeg6.sites.blink.new)

## ✨ Features

### 🎨 Premium IDE Experience
- **5 Customizable Themes**: VS Code Dark, Monokai, Dracula, GitHub Dark, One Dark Pro
- **Command Palette**: Fuzzy search with Ctrl+Shift+P
- **Keyboard Shortcuts**: Full keyboard navigation and quick actions
- **Contextual Menus**: Smart right-click suggestions
- **Professional Typography**: JetBrains Mono for code, Inter for UI

### 🐛 Core Debugging Features
- **Session Management**: 30-second debug sessions with real-time countdown
- **Code Snippets**: Monaco editor with syntax highlighting (17+ languages)
- **Error Logging**: Comprehensive categorization with severity levels
- **Advanced Search**: Filter across all debugging data
- **Markdown Export**: Export sessions for documentation

### 🤖 AI-Powered Assistant
- **Natural Language Input**: Describe errors in plain English
- **Voice-to-Text**: Speak your error descriptions
- **Pattern Recognition**: AI learns from debugging history
- **Stack Overflow Integration**: Automatic solution suggestions
- **Smart Insights**: AI-generated debugging recommendations

### 👥 Team Collaboration
- **Real-time Sessions**: Live collaborative debugging
- **Screen Sharing**: Interactive debugging sessions
- **Team Dashboard**: Performance analytics and metrics
- **Role-based Access**: Team leads, developers, observers
- **Activity Tracking**: Monitor team debugging workflows

### 🎯 Visual Debugging
- **Workflow Designer**: Drag-and-drop debugging flows
- **Execution Timeline**: Interactive debugging playback
- **Breakpoint Management**: Visual breakpoint tracking
- **Variable Visualization**: Real-time state monitoring
- **Performance Profiling**: Memory and CPU analysis

## 🚀 Live Demo

**[Try DebugVault Pro IDE](https://code-debugger-data-saver-fvazkeg6.sites.blink.new)**

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + ShadCN UI
- **Code Editor**: Monaco Editor (VS Code engine)
- **Database**: SQLite with Blink SDK
- **Authentication**: Blink Auth (JWT-based)
- **Real-time**: WebSocket-like features via Blink Realtime
- **AI**: OpenAI GPT-4 integration
- **Storage**: Cloud file storage with Blink Storage

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rashmiraju14/code-debugger-data-saver.git
   cd code-debugger-data-saver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🎮 Usage

### Quick Start
1. **Create a debugging session** with title and description
2. **Add code snippets** using the Monaco editor
3. **Log errors** with categorization and severity
4. **Use AI assistant** to get debugging suggestions
5. **Export sessions** as markdown for documentation

### Keyboard Shortcuts
- `Ctrl+Shift+P` - Open command palette
- `Ctrl+1` - Dashboard view
- `Ctrl+2` - Sessions view
- `Ctrl+3` - Search view
- `Ctrl+N` - New session
- `Ctrl+S` - Save current work
- `Ctrl+E` - Export session

### Themes
Switch between 5 premium themes:
- **VS Code Dark** - Classic dark theme
- **Monokai** - Vibrant syntax highlighting
- **Dracula** - Purple-tinted dark theme
- **GitHub Dark** - GitHub's official dark theme
- **One Dark Pro** - Atom's popular theme

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ai/              # AI assistant features
│   ├── dashboard/       # Main dashboard
│   ├── ide/            # IDE-like components
│   ├── sessions/       # Session management
│   ├── snippets/       # Code snippet editor
│   ├── errors/         # Error logging
│   ├── team/           # Team collaboration
│   ├── visual/         # Visual debugging
│   └── ui/             # ShadCN UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
└── blink/              # Blink SDK client
```

## 🔧 Configuration

### Environment Setup
The app uses Blink SDK for backend services. No additional environment variables needed for basic functionality.

### Theme Customization
Themes are defined in `src/lib/themes.ts`. Add new themes by extending the theme configuration:

```typescript
export const themes = {
  'custom-theme': {
    name: 'Custom Theme',
    colors: {
      primary: '#your-color',
      background: '#your-bg',
      // ... more colors
    }
  }
}
```

## 📊 Database Schema

The app uses SQLite with the following main tables:
- `debug_sessions` - Debugging session data
- `code_snippets` - Code snippets with syntax highlighting
- `error_logs` - Error messages and categorization
- `ai_patterns` - AI learning and pattern recognition
- `team_sessions` - Team collaboration data

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Blink SDK** - Full-stack development platform
- **Monaco Editor** - VS Code's editor engine
- **ShadCN UI** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Flow** - Visual workflow designer
- **OpenAI** - AI-powered debugging assistance

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/rashmiraju14/code-debugger-data-saver/issues)
- **Live Demo**: [Try the app](https://code-debugger-data-saver-fvazkeg6.sites.blink.new)

## 🚀 Deployment

The app is automatically deployed to Blink's hosting platform. For custom deployment:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel, Netlify, or any static hosting service
   - The `dist/` folder contains the built application

---

**Built with ❤️ by [Rashmi Raju](https://github.com/rashmiraju14)**

*Making debugging faster, smarter, and more collaborative for developers worldwide.*