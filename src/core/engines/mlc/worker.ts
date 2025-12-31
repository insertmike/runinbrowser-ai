// https://www.npmjs.com/package/@mlc-ai/web-llm
// Import from the main package - this works better with bundlers
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Hook up an Engine to a worker handler
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
