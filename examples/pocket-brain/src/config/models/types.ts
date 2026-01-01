import { prebuiltAppConfig } from "runinbrowser-ai";

export interface BaseModelConfig {
  modelName: string;
  modelType: ModelType;
  repo: string;
  pipeline: string;
  defaultQuantization: string;
  supportedDTypes?: string[] | undefined;
  contextLength?: number | undefined;
  defaultParams?: Record<string, unknown> | undefined;
  quantizations?: string[] | undefined;
  requiredFeatures?: string[] | undefined;
  modelLibrary?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  tags?: string[] | undefined;
}

export type ModelType = "text-generation";

export interface MLCConfig extends BaseModelConfig {
  engine: "mlc";
  quantized?: boolean | undefined;
  threads?: number | undefined;
  overrides?: Record<string, unknown> | undefined;
}

export interface TransformersConfig extends BaseModelConfig {
  engine: "transformers";
  revision?: string | undefined;
}

export type ModelConfig = MLCConfig | TransformersConfig;

// Grouped model types for UI
export interface ModelGroupInfo {
  id: string;
  label: string;
  icon?: string;
}

export interface GroupedModelEntry {
  id: string; // key in model map
  name: string; // display name
  sizeLabel?: string | undefined; // optional size tag
}

export type GroupedModels = Record<string, { group: ModelGroupInfo; models: GroupedModelEntry[] }>;

// Types inferred from prebuiltAppConfig.model_list structure
/**
 * Type representing a single model record from prebuiltAppConfig.model_list
 * Extracted from: prebuiltAppConfig -> model_list -> [index]
 *
 * Uses typeof prebuiltAppConfig to preserve runtime type information.
 *
 * @example
 * ```typescript
 * import type { MLCModelRecord } from './types';
 * import { prebuiltAppConfig } from 'runinbrowser-ai';
 *
 * const firstModel: MLCModelRecord = prebuiltAppConfig.model_list[0];
 * console.log(firstModel.model_id); // Type-safe access
 * ```
 */
export type MLCModelRecord = (typeof prebuiltAppConfig.model_list)[number];

/**
 * Type representing the model_id from prebuiltAppConfig.model_list
 * Extracted from: prebuiltAppConfig -> model_list -> [index] -> model_id
 *
 * Uses typeof prebuiltAppConfig to preserve runtime type information.
 *
 * @example
 * ```typescript
 * import type { MLCModelIdFromConfig } from './types';
 *
 * function loadModel(modelId: MLCModelIdFromConfig) {
 *   engine.loadModel(modelId);
 * }
 *
 * // Type-safe access to model_id
 * const modelId: MLCModelIdFromConfig = prebuiltAppConfig.model_list[0].model_id;
 * ```
 */
export type MLCModelIdFromConfig = (typeof prebuiltAppConfig.model_list)[number]["model_id"];
