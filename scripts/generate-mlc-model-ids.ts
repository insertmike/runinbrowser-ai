#!/usr/bin/env node
/**
 * Build script to generate MLC_MODEL_IDS array from @mlc-ai/web-llm's prebuiltAppConfig.
 *
 * This script extracts all model IDs from MLC-AI's configuration and generates
 * a type-safe const array for use in the codebase.
 *
 * Run this script before building:
 *   npm run generate:model-ids
 *
 * Or it will run automatically during build via the "prebuild" script.
 */

import { prebuiltAppConfig, ModelType } from "@mlc-ai/web-llm";
import { writeFileSync } from "fs";
import { join } from "path";

// Filter to only text-generation models (model_type === 0 or undefined)
// Embedding (1) and VLM (2) models are excluded
const textGenerationModels = prebuiltAppConfig.model_list.filter(
  (m) => m.model_type === undefined || m.model_type === ModelType.LLM,
);

const modelIds = textGenerationModels.map((m) => m.model_id);

// Sort for consistency
modelIds.sort();

/**
 * Extract base model name and quantization from a model ID.
 * Pattern: {BaseModelName}-{quantization}-MLC[-{suffix}]
 * Examples:
 *   "Llama-3.2-1B-Instruct-q4f32_1-MLC" -> { base: "Llama-3.2-1B-Instruct", quantization: "q4f32_1", suffix: undefined }
 *   "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k" -> { base: "Llama-3.1-8B-Instruct", quantization: "q4f32_1", suffix: "1k" }
 */
function parseModelId(modelId: string): {
  base: string;
  quantization: string;
  suffix?: string;
} | null {
  // Match pattern: {base}-{quantization}-MLC[-{suffix}]
  const match = modelId.match(/^(.+?)-(q\d+f\d+(?:_\d+)?|q\d+f\d+)-MLC(?:-(.+))?$/);
  if (!match) {
    // Some models might not follow this pattern (e.g., embedding models)
    return null;
  }
  return {
    base: match[1]!,
    quantization: match[2]!,
    ...(match[3] && { suffix: match[3] }),
  };
}

/**
 * Extract MODEL_ID (family name) from a base model name.
 * Removes size patterns, version numbers, and common suffixes to group by base family.
 * Examples:
 *   "Qwen2.5-0.5B-Instruct" -> "Qwen"
 *   "Qwen2.5-Coder-0.5B-Instruct" -> "Qwen-Coder"
 *   "Llama-3.2-1B-Instruct" -> "Llama"
 *   "gemma-2-2b-it" -> "gemma"
 *   "DeepSeek-R1-Distill-Llama-8B" -> "DeepSeek-R1"
 */
function extractModelId(baseName: string): string {
  let modelId = baseName;

  // Remove size patterns (e.g., "-0.5B", "-1.5B", "-8B", "-13b", "-135M", etc.)
  // Match: dash, digits (with optional decimal), B/M/K, followed by dash or end
  modelId = modelId.replace(/-\d+(?:\.\d+)?[BMK](?=-|$)/gi, "");

  // Remove common suffixes (longest first to avoid partial matches)
  const suffixes = [
    "-jpn-it",
    "-chat-hf",
    "-Instruct",
    "-v1.1",
    "-v1.0",
    "-v0.4",
    "-v0.3",
    "-v0.2",
    "-v1",
    "-it",
  ];

  for (const suffix of suffixes) {
    if (modelId.endsWith(suffix)) {
      modelId = modelId.slice(0, -suffix.length);
      break; // Only remove one suffix
    }
  }

  // Remove version numbers and sub-versions to group by base family
  // Examples: "Qwen2.5" -> "Qwen", "Llama-3.2" -> "Llama", "gemma-2" -> "gemma"
  // Pattern: match version numbers like "2.5", "-2", "-3.1", "-3.2", etc.
  // But preserve variant identifiers like "-R1", "-Coder", "-Math"

  // Special handling for DeepSeek-R1-Distill-* to group under DeepSeek-R1
  if (modelId.startsWith("DeepSeek-R1-Distill-")) {
    modelId = "DeepSeek-R1";
  } else {
    // Known variant identifiers that should be preserved
    const variantIdentifiers = ["-R1", "-Coder", "-Math", "-Distill", "-Pro", "-Theta"];
    const hasVariant = variantIdentifiers.some((v) => modelId.includes(v));

    if (hasVariant) {
      // For models with variants, remove version numbers before the variant
      // Example: "Qwen2.5-Coder" -> remove "2.5" -> "Qwen-Coder"
      for (const variant of variantIdentifiers) {
        if (modelId.includes(variant)) {
          const variantIndex = modelId.indexOf(variant);
          const beforeVariant = modelId.substring(0, variantIndex);
          const afterVariant = modelId.substring(variantIndex);

          // Remove version numbers from beforeVariant
          const cleaned = beforeVariant
            .replace(/-\d+(?:\.\d+)?$/, "") // Remove "-2", "-3.1" at end
            .replace(/\d+\.\d+$/, "") // Remove "2.5" at end
            .replace(/^\w+\d+$/, (m) => m.replace(/\d+$/, "")); // Remove trailing digits from base name like "Qwen2" -> "Qwen"

          modelId = cleaned + afterVariant;
          break;
        }
      }
    } else {
      // No variants, remove all version numbers
      // Remove patterns like "-2", "-3", "-3.1", "-3.2" at the end
      modelId = modelId.replace(/-\d+(?:\.\d+)?$/g, "");

      // Remove version patterns with dots like "2.5", "3.1" (no leading dash)
      // This handles cases like "Qwen2.5" -> "Qwen", "Llama-3.2" -> "Llama-3" -> then remove "-3"
      modelId = modelId.replace(/\d+\.\d+$/g, "");
      modelId = modelId.replace(/\d+\.\d+(?=-)/g, ""); // Before a dash

      // Remove remaining version numbers like "-3" from "Llama-3"
      modelId = modelId.replace(/-\d+$/g, "");

      // Remove trailing digits from base name (e.g., "Qwen2" -> "Qwen")
      modelId = modelId.replace(/^([A-Za-z]+)\d+$/, "$1");
    }
  }

  // Remove trailing dashes and clean up double dashes
  modelId = modelId.replace(/-+$/, "");
  modelId = modelId.replace(/-+/g, "-"); // Replace multiple dashes with single dash

  return modelId;
}

/**
 * Serialize a value to TypeScript literal format with proper formatting
 */
function serializeToTS(value: unknown, indent = 0): string {
  const indentStr = "  ".repeat(indent);
  const nextIndent = indent + 1;
  const nextIndentStr = "  ".repeat(nextIndent);

  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    const items = value
      .map((item) => `${nextIndentStr}${serializeToTS(item, nextIndent)}`)
      .join(",\n");
    return `[\n${items}\n${indentStr}]`;
  }

  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return "{}";
    }
    const props = entries
      .map(([key, val]) => {
        const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
        return `${nextIndentStr}${keyStr}: ${serializeToTS(val, nextIndent)}`;
      })
      .join(",\n");
    return `{\n${props}\n${indentStr}}`;
  }

  // Fallback for any other types (shouldn't happen with AppConfig)
  return JSON.stringify(value);
}

// Create enhanced prebuiltAppConfig with group and quantization_id fields added to each model
// Only includes text-generation models
const enhancedConfig = {
  ...prebuiltAppConfig,
  model_list: textGenerationModels.map((model) => {
    // Extract base name and quantization from model_id (remove quantization and -MLC suffix)
    const parsed = parseModelId(model.model_id);
    const baseName = parsed
      ? parsed.suffix
        ? `${parsed.base}-${parsed.suffix}`
        : parsed.base
      : model.model_id;

    // Extract group (MODEL_ID) from base name
    const group = baseName ? extractModelId(baseName) : "other";

    // Extract quantization_id (e.g., "q4f32_1", "q0f16")
    // All current models have quantization, so we can safely assert it exists
    if (!parsed || !parsed.quantization) {
      throw new Error(
        `Model ${model.model_id} does not have a quantization pattern. This should not happen with current MLC-AI models.`,
      );
    }
    const quantization_id = parsed.quantization;

    return {
      ...model,
      group,
      quantization_id,
    };
  }),
};

const header = `/**
 * @fileoverview
 * This file is AUTO-GENERATED from @mlc-ai/web-llm's prebuiltAppConfig.
 * 
 * DO NOT EDIT THIS FILE MANUALLY.
 * 
 * To regenerate this file, run:
 *   npm run generate:model-ids
 * 
 * Source: @mlc-ai/web-llm prebuiltAppConfig.model_list (filtered to text-generation models only)
 * Generated at: ${new Date().toISOString()}
 * 
 * This array provides compile-time type safety for MLC model IDs.
 * Each string is a literal type, enabling TypeScript to validate model IDs at compile time.
 * 
 * **Note**: Only text-generation models (model_type === 0 or undefined) are included.
 * Embedding (model_type === 1) and VLM (model_type === 2) models are excluded.
 */

import type { AppConfig, ModelRecord } from "@mlc-ai/web-llm";

/**
 * Extended model record with group and quantization_id fields for easier UI consumption.
 */
export interface ExtendedModelRecord extends ModelRecord {
  /** Model family/group (e.g., "Qwen", "Llama", "gemma") */
  group: string;
  /** Quantization identifier extracted from model_id (e.g., "q4f32_1", "q0f16") */
  quantization_id: string;
}

/**
 * Extended app config with group field in each model record.
 */
export interface ExtendedAppConfig extends Omit<AppConfig, "model_list"> {
  model_list: Array<ExtendedModelRecord>;
}

/**
 * Prebuilt app configuration from MLC-AI, exported as const for type inference.
 * 
 * **Source**: This is a snapshot of \`@mlc-ai/web-llm\`'s \`prebuiltAppConfig\` at generation time.
 * It includes the complete model list with all configuration details, plus \`group\` and \`quantization_id\`
 * fields added to each model record for easier UI consumption.
 * 
 * **Usage**: Use this to access model configurations, infer types, and access the full
 * MLC-AI configuration without importing from \`@mlc-ai/web-llm\`. The \`group\` field makes
 * it easy to filter and organize models by family, and \`quantization_id\` provides direct
 * access to the quantization without parsing the model_id.
 * 
 * @example
 * \`\`\`typescript
 * import { prebuiltAppConfig } from 'runinbrowser';
 * 
 * // Access model list
 * const models = prebuiltAppConfig.model_list;
 * 
 * // Filter models by group
 * const qwenModels = prebuiltAppConfig.model_list.filter(m => m.group === "Qwen");
 * 
 * // Filter by quantization
 * const q4f32Models = prebuiltAppConfig.model_list.filter(m => m.quantization_id === "q4f32_1");
 * 
 * // Find a specific model
 * const llamaModel = prebuiltAppConfig.model_list.find(m => m.model_id.includes('Llama-3.2'));
 * 
 * // Infer types from the config
 * type ModelRecord = typeof prebuiltAppConfig.model_list[number];
 * \`\`\`
 * 
 * @see {@link ExtendedAppConfig} - Extended type with group field
 * @see {@link ExtendedModelRecord} - Extended model record type
 */
export const prebuiltAppConfig: ExtendedAppConfig = ${serializeToTS(enhancedConfig)} as const;

/**
 * Get all model IDs from MLC-AI's prebuiltAppConfig at runtime.
 * Used to validate that MLC_MODEL_IDS matches the actual available models.
 */
function getActualMLCModelIds(): readonly string[] {
  return Object.freeze(prebuiltAppConfig.model_list.map((m) => m.model_id));
}

/**
 * Get a model from MLC-AI's prebuiltAppConfig by exact model_id match
 */
export function getMLCModel(modelId: string): AppConfig["model_list"][number] | undefined {
  return prebuiltAppConfig.model_list.find((m) => m.model_id === modelId);
}

/**
 * Array of all available MLC model IDs as a const array with literal types.
 * 
 * **Source**: This array is automatically generated from \`@mlc-ai/web-llm\`'s
 * \`prebuiltAppConfig.model_list\` at build time. It contains all model IDs
 * that are available in the MLC-AI library.
 * 
 * **Type Safety**: The \`as const\` assertion ensures TypeScript treats each
 * string as a literal type, enabling compile-time validation of model IDs.
 * 
 * **Maintenance**: When MLC-AI updates their model list, regenerate this file
 * by running \`npm run generate:model-ids\`. The runtime validation below will
 * warn if there are any mismatches.
 * 
 * @example
 * \`\`\`typescript
 * import { MLC_MODEL_IDS, type MLCModelId } from 'runinbrowser';
 * 
 * // Type-safe: TypeScript knows these are valid
 * const modelId: MLCModelId = MLC_MODEL_IDS[0]; // Autocomplete works!
 * 
 * // Type-safe: Only accepts valid model IDs
 * await engine.loadModel("Llama-3.2-1B-Instruct-q4f32_1-MLC"); // ✅
 * await engine.loadModel("invalid-model"); // ❌ TypeScript error!
 * 
 * // Runtime validation also works
 * if (MLC_MODEL_IDS.includes(userInput as MLCModelId)) {
 *   // Safe to use
 * }
 * \`\`\`
 * 
 * @see {@link https://github.com/mlc-ai/web-llm | MLC-AI Web-LLM}
 * @see {@link MLCModelId} - Type derived from this array
 */
const _MLC_MODEL_IDS = [
`;

const modelIdsList = modelIds.map((id) => `  "${id}"`).join(",\n");

const footer = `] as const;

/**
 * Validate that all model IDs in MLC_MODEL_IDS exist in MLC-AI's config.
 * This ensures the generated list stays in sync with the actual available models.
 * Runs at module load time to catch mismatches early.
 */
const actualModelIds = getActualMLCModelIds();
const actualModelIdsSet = new Set(actualModelIds);
const missingModels = _MLC_MODEL_IDS.filter((id) => !actualModelIdsSet.has(id));
const extraModels = actualModelIds.filter((id) => !(_MLC_MODEL_IDS as readonly string[]).includes(id));

if (missingModels.length > 0) {
  console.warn(
    \`[runinbrowser] MLC_MODEL_IDS contains models not in MLC-AI config: \${missingModels.join(", ")}\`
  );
}

if (extraModels.length > 0) {
  console.warn(
    \`[runinbrowser] MLC-AI config contains models not in MLC_MODEL_IDS: \${extraModels.join(", ")}\`
  );
}

/**
 * Exported const array - validated against MLC-AI's actual config.
 * This provides compile-time type safety with runtime validation.
 * 
 * @see {@link MLCModelId} - Type derived from this array
 */
export const MLC_MODEL_IDS = _MLC_MODEL_IDS;

/**
 * Type for all MLC model IDs - union of all literal model ID strings.
 * 
 * **Source**: Derived from \`MLC_MODEL_IDS\` const array for compile-time type safety.
 * This type is automatically updated when \`MLC_MODEL_IDS\` is regenerated.
 * 
 * **Usage**: Use this type for function parameters, return types, and variables
 * that should only accept valid MLC model IDs. TypeScript will provide autocomplete
 * and catch invalid model IDs at compile time.
 * 
 * @example
 * \`\`\`typescript
 * import type { MLCModelId } from 'runinbrowser';
 * 
 * function loadModel(id: MLCModelId) {
 *   // TypeScript will only accept valid model IDs - autocomplete works!
 *   await engine.loadModel(id);
 * }
 * 
 * // ✅ Valid - TypeScript accepts this
 * loadModel("Llama-3.2-1B-Instruct-q4f32_1-MLC");
 * 
 * // ❌ Invalid - TypeScript error!
 * loadModel("invalid-model");
 * \`\`\`
 * 
 * @see {@link MLC_MODEL_IDS} - Source array for this type
 */
export type MLCModelId = typeof MLC_MODEL_IDS[number];
`;

const output = header + modelIdsList + "\n" + footer;

const outputPath = join(process.cwd(), "src/config/models/mlc-models.ts");
writeFileSync(outputPath, output, "utf-8");

console.log(`✅ Generated ${modelIds.length} model IDs in ${outputPath}`);
console.log(`   First model: ${modelIds[0]}`);
console.log(`   Last model: ${modelIds[modelIds.length - 1]}`);
