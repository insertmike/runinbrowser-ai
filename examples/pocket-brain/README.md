# Brain Pocket (runinbrowser-ai example)

This is a complete, production-ready example of how to build an AI-powered landing page and chat interface using `runinbrowser-ai`.

**Note:** This showcase is **vibe-coded 🎨**. While the core `runinbrowser-ai` library is where the primary engineering focus and resources are devoted, this example was built to quickly demonstrate the potential of browser-based AI.

## Features

- **Full Landing Page:** Hero section, "How it Works", and Waitlist integration.
- **Advanced Chat Interface:** Built with `useMLCEngine` and `useChat` hooks.
- **Modern UI:** Responsive design using CSS Modules and a clean, aesthetic look.
- **In-App Browser Support:** Special handling for Instagram/Twitter browsers to ensure WebGPU compatibility.
- **Optimized for WebGPU:** Direct hardware acceleration in the browser.

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Structure

- `src/features/chat`: Core chat logic and UI components.
- `src/components`: Reusable layout components like Hero, Header, and Footer.
- `src/hooks`: Custom hooks for browser detection and media queries.
- `src/assets/icons`: SVG icon system.

## runinbrowser-ai Integration

This example showcases the primary hooks from the `runinbrowser-ai` SDK:

```tsx
import { useMLCEngine, useChat } from "runinbrowser-ai";

// ... engine initialization
// ... chat state management
```

For more details on the SDK, see the [root README](../../README.md).
