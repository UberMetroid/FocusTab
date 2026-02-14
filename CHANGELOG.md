# Changelog

All notable changes to FocusTab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-02-13

### Added
- **Rest Days**: Users can now leave their focus empty for rest days. The extension displays "Take a rest, senpai! You deserve it." with a motivational message.
- **Daily Quotes**: Added a rotating motivational quote system that displays below the focus area. Includes 20 quotes mixing productivity wisdom with anime-style references.
- **Enhanced Accessibility**: Improved screen reader support with `aria-live` regions for dynamic content.

### Changed
- **Optional Focus**: Focus is no longer mandatory. Enter a task or leave it empty for a rest day.
- **Button Context**: "Complete" button now changes to "Set Focus" when viewing a rest day, allowing easy task setting.
- **Storage Handling**: Improved error handling with fallback to localStorage if Chrome storage fails.
- **Input Placeholder**: Updated to hint at rest day functionality.

### Fixed
- Input validation now allows empty focus (for rest days) while still enforcing 200 character limit.
- Button state properly resets when switching between focus and rest modes.

### Migration from v1.x
- No manual migration needed. Your existing focus data is preserved.
- The extension now accepts empty focus input, which was previously rejected.
- If you had no focus set, you'll now see the rest day message instead of being prompted immediately.

---

## [1.x] - Previous Versions

### Known Issues in v1.x
- Focus input was mandatory (could not set rest days)
- No motivational quotes
- Less descriptive error messages

---

## Upgrading

To upgrade from v1.x to v2.0:

1. Pull the latest changes or re-download the extension
2. Go to `chrome://extensions/`
3. Click the refresh icon on FocusTab
4. Your existing focus will be preserved automatically
5. Enjoy the new rest day and quote features!

## Reporting Issues

If you encounter problems after upgrading:
1. Try removing and re-adding the extension
2. Clear browser cache for the extension
3. Report issues at: https://github.com/UberMetroid/FocusTab/issues
