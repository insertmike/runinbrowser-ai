import models from "./mlc-models.json";
import type { ModelConfig, MLCConfig, GroupedModels, ModelType } from "./types";
import { prebuiltAppConfig } from "runinbrowser";

type RawModelConfig = {
  engine: "mlc" | "transformers";
  modelName: string;
  modelType: string;
  repo: string;
  pipeline: string;
  defaultQuantization: string;
  supportedDTypes?: string[];
  contextLength?: number;
  defaultParams?: Record<string, unknown>;
  quantizations?: string[];
  required_features?: string[]; // snake_case in JSON
  modelLibrary?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
};

const toModelConfig = (raw: RawModelConfig): ModelConfig => {
  if (raw.engine === "mlc") {
    const cfg: MLCConfig = {
      engine: "mlc",
      modelName: raw.modelName,
      modelType: raw.modelType as ModelType,
      repo: raw.repo,
      pipeline: raw.pipeline,
      defaultQuantization: raw.defaultQuantization,
      supportedDTypes: raw.supportedDTypes,
      contextLength: raw.contextLength,
      defaultParams: raw.defaultParams,
      quantizations: raw.quantizations,
      requiredFeatures: raw.required_features,
      modelLibrary: raw.modelLibrary,
      metadata: raw.metadata,
      tags: raw.tags,
    };
    return cfg;
  }
  // transformers configs are not used here yet; cast conservatively
  return raw as unknown as ModelConfig;
};

const MODEL_MAP: Record<string, ModelConfig> = Object.fromEntries(
  Object.entries(models as Record<string, RawModelConfig>).map(([, raw]) => [
    raw.modelName, // use modelName as key if possible, or keep it as is
    toModelConfig(raw),
  ]),
);

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODEL_MAP[modelId];
}

export function listAvailableModels(): string[] {
  return Object.keys(MODEL_MAP);
}

// Build grouped list for UI (chat-only) - OLD VERSION (kept for backward compat)
export function buildGroupedModels(): GroupedModels {
  // Define simple groups by prefix heuristics
  const groups: Record<string, { label: string; icon?: string }> = {
    llama: { label: "Llama" },
    qwen: { label: "Qwen" },
    gemma: { label: "Gemma" },
    smollm2: { label: "SmolLM2" },
    deepseek: { label: "DeepSeek" },
    tinyllama: { label: "TinyLlama" },
    phi: { label: "Phi" },
  };

  const result: GroupedModels = {};
  for (const [id, cfg] of Object.entries(models as Record<string, RawModelConfig>)) {
    if (cfg.modelType !== "text-generation") continue; // chat only
    const key = id.split("-")[0] ?? "other";
    const groupKey = Object.keys(groups).find((g) => key.startsWith(g)) ?? "other";
    const groupMeta = (groupKey === "other" ? { label: "Other" } : groups[groupKey]) ?? {
      label: "Other",
    };
    if (!result[groupKey]) {
      result[groupKey] = {
        group: { id: groupKey, label: groupMeta.label },
        models: [],
      };
    }
    const sizeLabel = cfg?.metadata?.download_size_in_mb
      ? (Object.values(cfg.metadata.download_size_in_mb)[0] as string | number)
      : undefined;
    result[groupKey].models.push({
      id,
      name: cfg.modelName,
      sizeLabel: sizeLabel ? `~${sizeLabel} MB` : undefined,
    });
  }
  return result;
}

// Parse model ID to extract base model name and quantization
function parseModelId(
  modelId: string,
): { baseModel: string; quantization: string; is1k: boolean } | null {
  // Special case for snowflake-arctic-embed models: snowflake-arctic-embed-{m|s}-q0f32-MLC-b{32|4}
  if (modelId.includes("snowflake-arctic-embed")) {
    const match = modelId.match(/snowflake-arctic-embed-([ms])-q0f32-MLC-b(\d+)/);
    if (match) {
      return {
        baseModel: `snowflake-arctic-embed-${match[1]}-b${match[2]}`,
        quantization: "q0f32",
        is1k: false,
      };
    }
  }

  // Pattern: {baseModel}-{quantization}-MLC or {baseModel}-{quantization}-MLC-1k
  // Match from the end: look for -MLC or -MLC-1k, then extract quantization (starts with q), then everything before is baseModel
  const is1k = modelId.endsWith("-1k");
  const without1k = is1k ? modelId.slice(0, -3) : modelId;

  if (!without1k.endsWith("-MLC")) {
    return null;
  }

  const withoutMLC = without1k.slice(0, -4); // Remove "-MLC"
  const lastDashIndex = withoutMLC.lastIndexOf("-");

  if (lastDashIndex === -1) {
    return null;
  }

  const baseModel = withoutMLC.slice(0, lastDashIndex);
  const quantization = withoutMLC.slice(lastDashIndex + 1);

  // Validate quantization starts with 'q'
  if (!quantization.startsWith("q")) {
    return null;
  }

  return {
    baseModel,
    quantization,
    is1k,
  };
}

// Build grouped models from prebuiltAppConfig.model_list
export function buildGroupedModelsFromMLC(): {
  groups: Array<{
    id: string;
    label: string;
    models: Array<{
      id: string;
      name: string;
      tags?: string[];
      quantizations: Array<{
        value: string;
        label: string;
        modelId: string;
        vramMB?: number;
      }>;
    }>;
  }>;
  modelIdMap: Record<string, string>; // Maps full model ID to display name
} {
  const groups: Array<{
    id: string;
    label: string;
    models: Array<{
      id: string;
      name: string;
      tags?: string[];
      quantizations: Array<{
        value: string;
        label: string;
        modelId: string;
        vramMB?: number;
      }>;
    }>;
  }> = [];

  const modelIdMap: Record<string, string> = {};

  const modelNameToTags: Record<string, string[]> = {};
  for (const config of Object.values(models as Record<string, RawModelConfig>)) {
    if (config.tags) {
      modelNameToTags[config.modelName] = config.tags;
    }
  }

  // Build a map: group -> baseModel -> quantizations
  const groupMap = new Map<
    string,
    Map<
      string,
      Array<{
        value: string;
        label: string;
        modelId: string;
        vramMB?: number;
      }>
    >
  >();

  // Iterate through all models in prebuiltAppConfig
  for (const entry of prebuiltAppConfig.model_list) {
    const { model_id, group } = entry;

    // Skip if group is not defined
    if (!group) continue;

    // Parse model ID to extract base model and quantization
    const parsed = parseModelId(model_id);
    if (!parsed) continue;

    const { baseModel, quantization, is1k } = parsed;

    // Create display name for model ID
    const displayName = is1k ? `${baseModel} (1k context)` : baseModel;
    modelIdMap[model_id] = displayName;

    // Initialize group if it doesn't exist
    if (!groupMap.has(group)) {
      groupMap.set(group, new Map());
    }

    const groupModels = groupMap.get(group)!;

    // Initialize base model if it doesn't exist
    if (!groupModels.has(baseModel)) {
      groupModels.set(baseModel, []);
    }

    // Add quantization to the base model
    const quantizations = groupModels.get(baseModel)!;
    const quantLabel = quantization.replace(/_/g, " ").toUpperCase();

    quantizations.push({
      value: quantization,
      label: quantLabel,
      modelId: model_id,
      vramMB: entry.vram_required_MB ?? undefined,
    });
  }

  // Convert the map structure to the final groups array
  for (const [groupName, modelsMap] of groupMap.entries()) {
    const groupModels: Array<{
      id: string;
      name: string;
      tags?: string[] | undefined;
      quantizations: Array<{
        value: string;
        label: string;
        modelId: string;
      }>;
    }> = [];

    for (const [baseModel, quantizations] of modelsMap.entries()) {
      if (quantizations.length > 0) {
        // Sort quantizations by VRAM (if available) then by modelId for consistent ordering
        quantizations.sort((a, b) => {
          if (a.vramMB !== undefined && b.vramMB !== undefined) {
            return a.vramMB - b.vramMB;
          }
          return a.modelId.localeCompare(b.modelId);
        });

        groupModels.push({
          id: baseModel,
          name: baseModel,
          tags: modelNameToTags[baseModel],
          quantizations: quantizations,
        });
      }
    }

    if (groupModels.length > 0) {
      // Sort models by name for consistent ordering
      groupModels.sort((a, b) => a.name.localeCompare(b.name));

      groups.push({
        id: groupName,
        label: groupName,
        models: groupModels,
      });
    }
  }

  // Sort groups by label for consistent ordering
  groups.sort((a, b) => a.label.localeCompare(b.label));

  return { groups, modelIdMap };
}
