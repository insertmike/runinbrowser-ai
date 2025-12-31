import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm/lib/web_worker.js";
var s = new WebWorkerMLCEngineHandler();
self.onmessage = (e) => {
  s.onmessage(e);
}; //# sourceMappingURL=worker.js.map
//# sourceMappingURL=worker.js.map
