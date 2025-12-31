import { useEffect, useState } from "react";
import { log } from "../core/logger";

export function useWebGPUSupport(): boolean {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkWebGPU = async () => {
      // Check if WebGPU API exists
      if (!("gpu" in navigator)) {
        setIsSupported(false);
        return;
      }

      // Test if WebGPU is usable by requesting an adapter
      try {
        const adapter = await navigator.gpu?.requestAdapter();
        setIsSupported(adapter !== null);
      } catch (error: unknown) {
        log.warn("WebGPU adapter request failed:", error);
        setIsSupported(false);
      }
    };

    void checkWebGPU();
  }, []);

  return isSupported;
}
