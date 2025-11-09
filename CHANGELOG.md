# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-23

### Added

- Initial release of React Native Tour Guide
- Core tour guide functionality with spotlight and tooltips
- SVG-based spotlight overlay with customizable shapes (circle, rectangle)
- Fully customizable tooltip component with multiple positioning options
- Automatic scrolling support for off-screen elements
- Smart scroll-to-target with safe zone detection
- Multi-step tour support with navigation controls
- TypeScript support with comprehensive type definitions
- Flexible configuration system for styling and behavior
- Optional blur and gradient effects (requires additional dependencies)
- Custom tooltip renderer support
- Programmatic tour control (start, next, prev, skip, end)
- Step callbacks (onNext, onPrev, onSkip)
- Context-based state management
- Zero native code - pure JavaScript implementation

### Features

- **Spotlight Shapes**: Circle or rectangle with customizable padding and border radius
- **Tooltip Positioning**: Top, bottom, left, or right with automatic screen edge detection
- **Customizable Styling**: Complete control over colors, fonts, and dimensions
- **Automatic Scrolling**: Smart scroll-to-element with relative or absolute positioning
- **Progress Indicators**: Optional progress dots and step counter
- **Navigation Controls**: Next, previous, skip, and done buttons
- **Optional Enhancements**: Blur effect, gradient overlay, and masked views
- **Developer-Friendly**: Comprehensive documentation, examples, and TypeScript support

### Dependencies

#### Required Peer Dependencies

- `react`: "\*"
- `react-native`: "\*"
- `react-native-svg`: ">=13.0.0"

#### Optional Peer Dependencies

- `@react-native-community/blur`: For blur effects
- `react-native-linear-gradient`: For gradient overlays
- `@react-native-masked-view/masked-view`: For advanced blur masking

### Documentation

- README.md with quick start and API reference
- USAGE_GUIDE.md with detailed examples and best practices
- Full TypeScript type definitions
- Example app demonstrating all features

### Notes

This is the initial release. Please report any issues or suggestions on the [GitHub repository](https://github.com/himanshu-lal4/react-native-tour-guide/issues).

---

## [Unreleased]

### Planned Features

- [ ] Animation customization options
- [ ] Voice-over accessibility support
- [ ] Gesture-based navigation (swipe between steps)
- [ ] Video/GIF support in tooltips
- [ ] Analytics integration helpers
- [ ] More tooltip positioning modes
- [ ] Animated spotlight border pulse
- [ ] Dark mode / Theme support out of the box
- [ ] React Native Web support

---

[0.1.0]: https://github.com/himanshu-lal4/react-native-tour-guide/releases/tag/v0.1.0
