# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-01-01

### Fixed

- Updated repository URLs in package.json to match renamed GitHub repository (runinbrowser-ai)
- Fixed repository URL format to npm standard (git+https://)
- Updated GitHub links in README.md and example files

## [0.1.0] - 2025-12-31

### Added

- Initial release
- **React Hooks:**
  - `useMLCEngine` - Manage MLC engine lifecycle, model loading, and caching
  - `useChat` - Handle chat state and message streaming
  - `useWebGPUSupport` - Check WebGPU browser compatibility
- **Core Features:**
  - WebGPU acceleration via MLC-AI engine
  - Web Worker support for non-blocking inference
  - Model caching and management
  - OpenAI-compatible API interface with streaming support
  - TypeScript-first design with comprehensive type definitions
- **Developer Experience:**
  - `MLCEngineAdapter` class for advanced use cases
  - `enableDebug()` utility for troubleshooting
  - Model catalog with type-safe model IDs (`MLCModelId`)
  - Full TypeScript support with exported types
