<div align="center">

# runinbrowser-ai 🚀

### Run any open-source AI model in React directly in the browser. No servers, no setup.

[Live Demo (Pocket Brain)](https://runinbrowser.vercel.app/)

</div>

## Overview

`runinbrowser-ai` is a **React-first TypeScript SDK** for **running AI models directly in the browser**. Built with React hooks and OpenAI-compatible types, levereging WebGPU to enable you to build AI-powered applications that run entirely client-side with **no backend required**.

## Why `runinbrowser-ai`?

- `runinbrowser-ai` is the **only fully Typescript-based** React SDK for browser AI. This means better developer experience, safer integrations, and full type-checking across your entire AI workflow

- `runinbrowser-ai` is **OpenAI API Compatible:** Integrate your application using OpenAI compatible types for functionalities such as streaming, JSON-mode, and soon (tool calling, seeding, etc...)

- `runinbrowser-ai` has **Plug and Play integration:** Integrate and run AI models in your React App by following the comprehensive **examples** and **out-of-the-box hooks** that lift the burden of managing AI state so you can focus on UI.

- `runinbrowser-ai` comes with latest advancements from its underlying engines such as **Web Worker & Service Worker** support and more.

Not to forget that everything is 🔒 **100% Local & Private**, **🌐 Offline Friendly**, **📦 Production Ready** and with **💰 Zero Server Costs**.

![ezgif-240bfe1209ae3de8](https://github.com/user-attachments/assets/97eb4851-d731-4794-8b32-16f4f7629d29)

## Quick start

You will need Node.js 18+ and npm (or another package manager) installed on your local development machine.

```bash
npm install runinbrowser-ai
```

### Basic Usage

```tsx
import { useMLCEngine, useChat } from "runinbrowser-ai";

function ChatApp() {
  // Manage engine lifecycle with the useMLCEngine hook
  const { engine, isLoading, progress } = useMLCEngine({
    modelId: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
    useWorker: true,
  });

  // Manage chat state with the useChat hook
  const { messages, send, stop, clear, isStreaming } = useChat({ engine });

  if (isLoading) {
    return <LoadingIndicator progress={progress} />;
  }

  return <ChatUI messages={messages} onSend={send} />;
}
```

## API Reference

### `useMLCEngine`

Manages MLC engine lifecycle, model loading, and caching.

#### Usage

```tsx
import { useMLCEngine } from "runinbrowser-ai";

const { engine, isLoading, progress } = useMLCEngine({
  modelId: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  useWorker: true,
});
```

#### Options

| Option       | Type                 | Default     | Description                 |
| ------------ | -------------------- | ----------- | --------------------------- |
| `modelId`    | `MLCModelId`         | `undefined` | Model to auto-load on mount |
| `useWorker`  | `boolean`            | `true`      | Run inference in Web Worker |
| `onProgress` | `(progress) => void` | `undefined` | Progress callback           |
| `onError`    | `(error) => void`    | `undefined` | Error callback              |

#### Returns

| Property            | Type                 | Description                                                       |
| ------------------- | -------------------- | ----------------------------------------------------------------- |
| `engine`            | `MLCEngineAdapter`   | Engine instance (pass to `useChat`)                               |
| `status`            | `EngineStatus`       | Current status: `'idle'` \| `'loading'` \| `'ready'` \| `'error'` |
| `isReady`           | `boolean`            | True when ready to generate                                       |
| `isLoading`         | `boolean`            | True during model loading                                         |
| `progress`          | `number`             | Loading progress (0-1)                                            |
| `error`             | `Error \| null`      | Last error that occurred                                          |
| `currentModelId`    | `MLCModelId \| null` | Currently loaded model                                            |
| `loadModel()`       | `function`           | Load a model manually                                             |
| `unload()`          | `function`           | Unload current model                                              |
| `cachedModels`      | `MLCModelId[]`       | List of cached models                                             |
| `hasModelInCache()` | `function`           | Check if model is cached                                          |
| `clearCache()`      | `function`           | Clear all cached models                                           |

#### Examples

**Auto-load on mount:**

```tsx
const { engine, isReady } = useMLCEngine({
  modelId: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
});
```

**Manual loading:**

```tsx
const { loadModel, isLoading } = useMLCEngine();

// Later...
await loadModel("Llama-3.2-1B-Instruct-q4f32_1-MLC");
```

**Progress tracking:**

```tsx
const { progress, status } = useMLCEngine({
  modelId: "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  onProgress: (p) => console.log(`${p.text} - ${Math.round(p.progress * 100)}%`),
});
```

---

### `useChat`

Manages chat messages, streaming, and conversation state. Engine agnostic.

#### Usage

```tsx
import { useChat } from "runinbrowser-ai";

const { messages, send, isStreaming } = useChat({
  engine,
  systemPrompt: "You are a helpful assistant.",
});
```

#### Options

| Option              | Type                | Description                         |
| ------------------- | ------------------- | ----------------------------------- |
| `engine`            | `Engine`            | Engine instance from `useMLCEngine` |
| `systemPrompt`      | `string`            | System message for context          |
| `generationOptions` | `GenerationOptions` | Default generation options          |

#### Returns

| Property       | Type            | Description                        |
| -------------- | --------------- | ---------------------------------- |
| `messages`     | `ChatMessage[]` | Full chat history                  |
| `isStreaming`  | `boolean`       | True during active generation      |
| `engine`       | `Engine`        | The provided engine instance       |
| `send()`       | `function`      | Send a message and stream response |
| `stop()`       | `function`      | Stop mid-stream                    |
| `regenerate()` | `function`      | Regenerate last assistant response |
| `clear()`      | `function`      | Clear all messages                 |

#### ChatMessage Type

```typescript
type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  meta?: { stopReason?: string; usage?: unknown };
};
```

#### Examples

**Basic chat:**

```tsx
const { messages, send } = useChat({ engine });

<button onClick={() => send("Hello!")}>Send</button>;
```

**With system prompt:**

```tsx
const { messages, send } = useChat({
  engine,
  systemPrompt: "You are a coding assistant. Always provide examples.",
});
```

**With default options:**

```tsx
const { messages, send } = useChat({
  engine,
  generationOptions: {
    temperature: 0.7,
    max_tokens: 500,
  },
});
```

**Override per message:**

```tsx
const { send } = useChat({ engine });

// Use defaults
send("Tell me a story");

// Override for this message
send("Generate code", {
  temperature: 0.2,
  max_tokens: 1000,
});
```

---

### `useWebGPUSupport`

Checks if WebGPU is available in the current browser.

#### Usage

```tsx
import { useWebGPUSupport } from "runinbrowser-ai";

const isSupported = useWebGPUSupport();

if (!isSupported) {
  return <p>WebGPU is not supported in this browser.</p>;
}
```

#### Returns

`boolean` - `true` if WebGPU is available, `false` otherwise.

#### Example

```tsx
function App() {
  const isSupported = useWebGPUSupport();

  if (!isSupported) {
    return (
      <div>
        <h1>WebGPU Not Supported</h1>
        <p>Please use Chrome 113+ or Edge 113+</p>
      </div>
    );
  }

  return <ChatApp />;
}
```

## Demos & examples

- **Live demo:** [runinbrowser.vercel.app](https://runinbrowser.vercel.app) (Brain Pocket experience)
- **Examples in repo:** `examples/pocket-brain` (full UI with roadmap/FAQ sections) — **Note:** This example is vibe-coded 🎨

## Requirements

- Modern browser with WebGPU (Chrome/Edge 113+, Arc).
- Devices with `shader-f16` support run larger models faster; smaller models are selected by default for compatibility.

## Kind-of roadmap (near term)

- ✅ Solid React chat hook + MLC adapter, WebGPU + Worker support, basic model catalog with caching.
- ⏳ JSON/structured outputs and richer system prompt helpers.
- ⏳ More engines (Transformers.js adapter) and voice I/O experiments.
- 🎯 Developer docs inline (this README) until a docs site is ready; examples stay authoritative.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Quick start for local development:

```bash
git clone https://github.com/insertmike/runinbrowser-ai.git
cd runinbrowser-ai
npm install  # Auto-generates required files
npm run build
```

**Note:** Some files are auto-generated and gitignored:

- `src/config/models/mlc-models.ts` - Generated during `npm install` (postinstall) and `npm run build` (prebuild)
- `src/core/engines/mlc/worker-utils.ts` - Generated during `npm run build` (prebuild, requires `build:worker` first)

**Important:** You must run `npm run build` before TypeScript compilation will work, as `worker-utils.ts` depends on the worker bundle being built first.

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Acknowledgements

This project is built on top of [MLC-AI](https://github.com/mlc-ai/web-llm) and their incredible work on WebLLM, which enables high-performance language model inference in the browser using WebGPU.

## Installation

```bash
npm install runinbrowser-ai
# or
yarn add runinbrowser-ai
# or
pnpm add runinbrowser-ai
```

## TypeScript Support

`runinbrowser-ai` is written in TypeScript and includes comprehensive type definitions. All APIs are fully typed, including:

- `GenerationOptions` - OpenAI-compatible generation parameters
- `ChatMessage` - Message types with role and content
- `Engine` - Core engine interface for extensibility
- `MLCModelId` - Type-safe model identifiers
- Hook return types and options

## Exported Types

```typescript
import type {
  // Core types
  Engine,
  EngineStatus,
  BaseChatMessage,
  ChatRole,
  InputMessage,
  LoadingProgress,
  StreamCallbacks,
  GenerationOptions,
  // Hook types
  UseChatOptions,
  UseChatReturn,
  UseMLCEngineOptions,
  UseMLCEngineReturn,
  // Model types
  MLCModelId,
} from "runinbrowser-ai";
```

## Additional Exports

### `MLCEngineAdapter`

The MLC engine adapter class that implements the `Engine` interface. You can use this directly if you need more control:

```tsx
import { MLCEngineAdapter } from "runinbrowser-ai";

const engine = new MLCEngineAdapter();
await engine.loadModel("Llama-3.2-1B-Instruct-q4f32_1-MLC");
```

### `enableDebug()`

Enable debug logging for troubleshooting:

```tsx
import { enableDebug } from "runinbrowser-ai";

enableDebug(); // Sets localStorage.debug = 'runinbrowser-ai'
```

### `MLC_MODEL_IDS`

Array of all available MLC model IDs:

```tsx
import { MLC_MODEL_IDS } from "runinbrowser-ai";

console.log(MLC_MODEL_IDS); // ["Llama-3.2-1B-Instruct-q4f32_1-MLC", ...]
```

### `prebuiltAppConfig`

Full MLC-AI configuration with extended model records:

```tsx
import { prebuiltAppConfig } from "runinbrowser-ai";

// Access model list with group and quantization_id fields
const models = prebuiltAppConfig.model_list;

// Filter by model family
const qwenModels = models.filter((m) => m.group === "Qwen");

// Find specific model
const llamaModel = models.find((m) => m.model_id.includes("Llama-3.2"));
```

### `getMLCModel()`

Get a model configuration by model ID:

```tsx
import { getMLCModel } from "runinbrowser-ai";

const model = getMLCModel("Llama-3.2-1B-Instruct-q4f32_1-MLC");
```

### Additional Types

```tsx
import type { ExtendedModelRecord, ExtendedAppConfig } from "runinbrowser-ai";
```

## Browser Compatibility

- **WebGPU**: Required for model inference. Supported in:
  - Chrome/Edge 113+
  - Arc browser
  - Safari 18+ (with experimental WebGPU support)
- **Web Workers**: Recommended for better performance (enabled by default)
- **IndexedDB**: Used for model caching

## Performance Tips

1. **Use Web Workers**: Keep inference off the main thread (default: `useWorker: true`)
2. **Model Selection**: Smaller models (1B-3B) load faster and use less memory
3. **Caching**: Models are automatically cached in IndexedDB after first load
4. **Shader Support**: Devices with `shader-f16` support run models faster

## Troubleshooting

### WebGPU Not Available

Check browser support:

```tsx
import { useWebGPUSupport } from "runinbrowser-ai";

const isSupported = useWebGPUSupport();
if (!isSupported) {
  // Show fallback UI
}
```

### Enable Debug Logging

```tsx
import { enableDebug } from "runinbrowser-ai";
enableDebug();
```

### Model Loading Issues

- Ensure you have sufficient storage space (models can be 1-4GB)
- Check browser console for IndexedDB errors
- Try clearing cache: `engine.clearCache()`

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

This project is free and open source. If you find it useful, consider subscribing to [@mihailyonchev](https://www.youtube.com/@mihailyonchev?sub_confirmation=1) on YouTube for more privacy-focused tech projects and tutorials!
