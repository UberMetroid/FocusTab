# FocusTab: Unleash Your Focus Power! ⚡️

Transform your new tab page into a focused productivity powerhouse with **FocusTab**! This minimalist Chrome/Chromium extension helps you eliminate distractions and concentrate on your most important daily task.

## ✨ Features

- **Single Daily Focus:** Set one primary goal for the day to maintain laser-like focus.
- **Rest Days:** Optionally leave your focus empty for a well-deserved rest day.
- **Daily Quotes:** Rotating motivational quotes to keep you inspired.
- **Progress Tracking:** View your streak, longest streak, and weekly activity chart.
- **Background Customization:** Choose from gradient presets or upload your own image.
- **Anime-Inspired Design:** A visually engaging interface with subtle animations.
- **Dark Mode:** Toggle between light and dark themes for comfortable viewing.
- **Persistent Storage:** Your focus and preferences are saved across sessions.
- **Celebratory Fireworks:** Visual reward when you complete your task!

## 🚀 Installation

### Chrome / Chromium (Sideloading)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/UberMetroid/FocusTab.git
   ```
   Or click "Code" → "Download ZIP" on GitHub.

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked**

5. Select the `FocusTab` directory (the folder containing `manifest.json`)

### Other Browsers

- **Edge:** Use the same sideloading process at `edge://extensions/`
- **Brave:** Use the same sideloading process at `brave://extensions/`
- **Firefox:** See [临时扩展支持](https://extensionworkshop.com/?utm_source=devwebsite&utm_medium=website&utm_campaign=devoverview) for temporary installation, or convert using [web-ext](https://extensionworkshop.com/?utm_source=devwebsite&utm_medium=website&utm_campaign=devoverview)

## 📖 Quick Start

1. **Open a new tab** — You'll see "What should you focus on, senpai?"

2. **Enter your focus** — Type your main task for the day and press Enter (or click "Set Focus")

3. **Stay focused** — Each new tab shows your focus with motivational text

4. **Complete your task** — Click "Complete" to celebrate with fireworks!

5. **Rest when needed** — Leave the input empty to set a rest day

### Hidden Features

- **Progress Panel:** Press `Ctrl+Shift+P` to view your streak stats and weekly chart
- **Background Customization:** In the progress panel, select gradient presets or upload your own image (max 2MB)

## 🔧 Troubleshooting

### Focus not saving
- Ensure you're using Chrome/Chromium with extension support
- Try reloading the extension: Go to `chrome://extensions/` → click the reload icon on FocusTab
- Check if "Site can save data" is allowed in extension details

### Dark mode toggle not working
- Make sure the toggle is clicked firmly (there's a 150ms debounce)
- Refresh the extension as above

### Storage sync issues
- FocusTab uses local Chrome storage by default
- If using browser sync, ensure sync is enabled in Chrome settings
- Data persists locally even without sync

### Extension not loading after update
- Chrome may disable extensions from unknown developers
- Re-enable in `chrome://extensions/` if you see a warning
- Try removing and re-adding the extension

### New tab not showing FocusTab
- Check that FocusTab is enabled in `chrome://extensions/`
- Ensure no other extension is overriding new tab pages
- Try setting FocusTab as your default in Chrome settings

### Progress stats not updating
- Complete a focus task to increment your streak
- Streak only counts when you complete a task (not just setting one)
- Rest days don't break your streak — only missing a day without completing does

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Development Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/<your-username>/FocusTab.git
cd FocusTab

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in a new branch
2. Test locally by loading the unpacked extension
3. Follow the existing code style:
   - Use ES6+ with async/await
   - CSS variables for theming
   - Semantic HTML
4. Commit with clear, descriptive messages

### Submitting Changes

1. Push to your fork: `git push origin feature/your-feature-name`
2. Open a Pull Request against the `main` branch
3. Describe your changes and why they're needed
4. Wait for review — we appreciate all contributions!

### Coding Standards

- Use 4 spaces for indentation
- Add comments for complex logic
- Test in both light and dark modes
- Ensure accessibility (keyboard navigation, screen reader support)

## 🐞 Issues and Support

- **Found a bug?** Open an issue on [GitHub Issues](https://github.com/UberMetroid/FocusTab/issues)
- **Have a suggestion?** We'd love to hear it! Open a feature request
- **Need help?** Check the troubleshooting section above or open an issue

## 📋 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and migration notes.

## 📜 License

This project is open source under the [MIT License](./LICENSE).

## 🔗 Links

- **GitHub Repository:** [https://github.com/UberMetroid/FocusTab](https://github.com/UberMetroid/FocusTab)
- **Report Issues:** [https://github.com/UberMetroid/FocusTab/issues](https://github.com/UberMetroid/FocusTab/issues)

---

**Start conquering your day, one focus at a time!**
