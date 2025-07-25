# Contributing to DebugVault Pro IDE

Thank you for your interest in contributing to DebugVault Pro IDE! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup Development Environment

1. **Fork the repository**
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

4. **Run linting**
   ```bash
   npm run lint
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic

### Component Structure
```
src/components/
├── feature-name/
│   ├── ComponentName.tsx
│   ├── hooks/
│   └── types.ts
```

### Naming Conventions
- **Components**: PascalCase (`MyComponent.tsx`)
- **Hooks**: camelCase starting with `use` (`useMyHook.ts`)
- **Types**: PascalCase (`MyType.ts`)
- **Files**: kebab-case for non-components (`my-utility.ts`)

## 🎯 Contributing Areas

### 🐛 Bug Fixes
- Check existing issues before creating new ones
- Include steps to reproduce
- Provide screenshots if applicable
- Test your fix thoroughly

### ✨ New Features
- Discuss major features in issues first
- Follow the existing design patterns
- Add appropriate tests
- Update documentation

### 🎨 UI/UX Improvements
- Maintain consistency with existing themes
- Test across different screen sizes
- Consider accessibility guidelines
- Follow the IDE-like design principles

### 📚 Documentation
- Keep README.md up to date
- Add JSDoc comments for complex functions
- Update CHANGELOG.md for significant changes

## 🔧 Technical Guidelines

### State Management
- Use React hooks for local state
- Use Blink SDK for data persistence
- Follow the existing patterns for API calls

### Styling
- Use Tailwind CSS classes
- Follow the theme system for colors
- Maintain responsive design
- Use CSS variables for theme customization

### Testing
- Test new features manually
- Ensure existing functionality isn't broken
- Test across different browsers
- Verify mobile responsiveness

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding guidelines
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all checks pass

### Commit Message Format
```
type(scope): description

Examples:
feat(ai): add voice-to-text error input
fix(ui): resolve theme switching bug
docs(readme): update installation instructions
style(components): improve button hover states
```

## 🎨 Design System

### Themes
- VS Code Dark (default)
- Monokai
- Dracula
- GitHub Dark
- One Dark Pro

### Typography
- **UI Text**: Inter font family
- **Code**: JetBrains Mono font family
- **Sizes**: Follow Tailwind's scale

### Colors
Use CSS variables defined in the theme system:
```css
var(--primary)
var(--background)
var(--foreground)
var(--accent)
```

## 🚨 Issue Reporting

### Bug Reports
Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

### Feature Requests
Include:
- Clear description of the feature
- Use case and benefits
- Mockups or examples if applicable
- Implementation suggestions

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Live Demo**: Test features at the live demo link

## 🏆 Recognition

Contributors will be:
- Listed in the README.md
- Mentioned in release notes
- Given credit in commit messages

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DebugVault Pro IDE! 🚀