# Contributing to Repolyze

Thanks for your interest in contributing! This guide will help you get started.

## Quick Start

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/Repolyze.git
cd Repolyze

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Add your GITHUB_TOKEN and OPENROUTER_API_KEY

# 4. Start development
pnpm dev
```

## 📋 How to Contribute

### Reporting Bugs

[Open an issue](https://github.com/OssiumOfficial/Repolyze/issues/new) with:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### Suggesting Features

[Start a discussion](https://github.com/OssiumOfficial/Repolyze/discussions/new?category=ideas) with:

- Problem you're trying to solve
- Proposed solution
- Any alternatives considered

### Submitting Code

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature
   # or: fix/bug-description
   ```

2. **Make changes** and test

   ```bash
   pnpm lint        # Check for errors
   pnpm type-check  # Verify types
   pnpm build       # Test build
   ```

3. **Commit** using [Conventional Commits](https://conventionalcommits.org)

   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update readme"
   ```

4. **Push and open PR**
   ```bash
   git push origin feature/your-feature
   ```

## 📝 Commit Convention

| Type       | Description                 |
| ---------- | --------------------------- |
| `feat`     | New feature                 |
| `fix`      | Bug fix                     |
| `docs`     | Documentation               |
| `style`    | Formatting (no code change) |
| `refactor` | Code restructuring          |
| `perf`     | Performance improvement     |
| `test`     | Adding tests                |
| `chore`    | Maintenance                 |

**Examples:**

```
feat: add branch comparison view
fix: resolve memory leak in file tree
docs: update API documentation
```

## ✅ PR Checklist

Before submitting:

- [ ] Code follows existing style
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] Changes tested locally
- [ ] Documentation updated (if needed)

## 🏷️ Good First Issues

Look for issues labeled:

- [`good first issue`](https://github.com/OssiumOfficial/Repolyze/labels/good%20first%20issue) - Great for beginners
- [`help wanted`](https://github.com/OssiumOfficial/Repolyze/labels/help%20wanted) - We need help

## 💬 Need Help?

- [GitHub Discussions](https://github.com/OssiumOfficial/Repolyze/discussions) - Questions & ideas
- [Twitter](https://x.com/ossium_inc) - Quick questions

---

Thanks for contributing! ☕
