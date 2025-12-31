/* eslint-disable @typescript-eslint/no-empty-object-type */
// WebGPU type declarations
// TypeScript doesn't include WebGPU types by default yet.
// This minimal declaration adds support for navigator.gpu.requestAdapter()
// which is used in useWebGPUSupport hook to check browser compatibility.
// We mimic the interface because we only need 1 method (requestAdapter), not the full WebGPU spec
interface Navigator {
  gpu?: {
    requestAdapter(): Promise<GPUAdapter | null>;
  };
}

interface GPUAdapter {
  // Minimal GPU adapter interface for type checking
}
