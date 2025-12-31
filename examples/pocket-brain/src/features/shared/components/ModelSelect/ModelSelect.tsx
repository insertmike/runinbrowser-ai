import { useMemo, useState, useEffect } from "react";
import * as Select from "@radix-ui/react-select";
import styles from "./ModelSelect.module.css";
import {
  SpinnerIcon,
  CheckmarkIcon,
  CheckmarkSmallIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "~assets/icons";

export type HierarchicalModelGroup = {
  id: string;
  label: string;
  models: Array<{
    id: string;
    name: string;
    tags?: string[] | undefined;
    quantizations: Array<{
      value: string;
      label: string;
      modelId: string;
      vramMB?: number | undefined;
    }>;
  }>;
};

export interface ModelSelectProps {
  hierarchicalGroups: readonly HierarchicalModelGroup[];
  modelIdMap?: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  cachedModelIds?: Set<string> | readonly string[];
  loadingCachedModels?: boolean;
  getCachedModels?: () => Promise<string[]>;
  compact?: boolean;
  variant?: "default" | "ghost";
}

export function ModelSelect({
  hierarchicalGroups,
  modelIdMap,
  value,
  onChange,
  disabled = false,
  cachedModelIds,
  loadingCachedModels = false,
  getCachedModels,
  compact = false,
  variant = "default",
}: ModelSelectProps) {
  const [cachedModelIdsState, setCachedModelIdsState] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());

  // Extract available tags from all groups
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const group of hierarchicalGroups) {
      for (const model of group.models) {
        if (model.tags) {
          for (const tag of model.tags) {
            tags.add(tag);
          }
        }
      }
    }
    return Array.from(tags).sort();
  }, [hierarchicalGroups]);

  // Fetch cached models if getCachedModels is provided
  useEffect(() => {
    if (getCachedModels) {
      getCachedModels()
        .then((cached) => {
          setCachedModelIdsState(new Set(cached));
        })
        .catch((error) => {
          console.error("Failed to fetch cached models:", error);
        });
    }
  }, [getCachedModels]);

  const cachedSet = cachedModelIds || cachedModelIdsState;

  // Build downloaded group from cached models
  const downloadedGroup = useMemo<HierarchicalModelGroup | null>(() => {
    if (!hierarchicalGroups || !modelIdMap || !cachedSet) return null;

    const cached = cachedSet instanceof Set ? cachedSet : new Set(cachedSet);
    if (cached.size === 0) return null;

    const downloadedModelsMap = new Map<
      string,
      Array<{
        value: string;
        label: string;
        modelId: string;
        vramMB?: number;
      }>
    >();

    for (const group of hierarchicalGroups) {
      for (const model of group.models) {
        for (const quant of model.quantizations) {
          if (cached.has(quant.modelId)) {
            if (!downloadedModelsMap.has(model.id)) {
              downloadedModelsMap.set(model.id, []);
            }
            downloadedModelsMap.get(model.id)!.push({
              ...quant,
              vramMB: quant.vramMB ?? undefined,
            });
          }
        }
      }
    }

    if (downloadedModelsMap.size === 0) return null;

    const models = Array.from(downloadedModelsMap.entries()).map(([modelId, quantizations]) => {
      let modelName = modelId;
      let modelTags: string[] | undefined;
      for (const group of hierarchicalGroups) {
        const foundModel = group.models.find((m) => m.id === modelId);
        if (foundModel) {
          modelName = foundModel.name;
          modelTags = foundModel.tags;
          break;
        }
      }
      return {
        id: modelId,
        name: modelName,
        tags: modelTags,
        quantizations: quantizations.sort((a, b) => {
          if (a.vramMB !== undefined && b.vramMB !== undefined) {
            return a.vramMB - b.vramMB;
          }
          return a.modelId.localeCompare(b.modelId);
        }),
      };
    });

    models.sort((a, b) => a.name.localeCompare(b.name));

    return {
      id: "downloaded",
      label: "Downloaded",
      models,
    };
  }, [hierarchicalGroups, modelIdMap, cachedSet]);

  // Combine downloaded group with other groups
  const allGroups = useMemo(() => {
    if (downloadedGroup) {
      return [downloadedGroup, ...hierarchicalGroups];
    }
    return hierarchicalGroups;
  }, [hierarchicalGroups, downloadedGroup]);

  // Build filtered groups with deduplicated quantizations and search support
  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const seenQuantIds = new Set<string>();

    return allGroups
      .map((group) => {
        const models = group.models
          .filter((model) => !activeFilter || model.tags?.includes(activeFilter))
          .map((model) => {
            const quantizations = model.quantizations.filter((quant) => {
              if (seenQuantIds.has(quant.modelId)) {
                return false;
              }

              if (!term) {
                return true;
              }

              const haystack = [
                group.label,
                model.name,
                quant.label,
                quant.modelId,
                modelIdMap?.[quant.modelId] ?? "",
              ]
                .join(" ")
                .toLowerCase();

              return haystack.includes(term);
            });

            if (quantizations.length === 0) {
              return null;
            }

            for (const q of quantizations) {
              seenQuantIds.add(q.modelId);
            }

            return {
              ...model,
              quantizations,
            };
          })
          .filter((m): m is HierarchicalModelGroup["models"][number] => m !== null);

        if (models.length === 0) {
          return null;
        }

        return {
          ...group,
          models,
        };
      })
      .filter((g): g is HierarchicalModelGroup => g !== null);
  }, [allGroups, modelIdMap, searchTerm, activeFilter]);

  // Selected label & cached flag for trigger
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const selectedInfo = useMemo(() => {
    for (const group of allGroups) {
      for (const model of group.models) {
        for (const quant of model.quantizations) {
          if (quant.modelId === value) {
            const isCached =
              cachedSet instanceof Set
                ? cachedSet.has(quant.modelId)
                : Array.isArray(cachedSet)
                  ? cachedSet.includes(quant.modelId)
                  : false;
            return {
              label: modelIdMap?.[quant.modelId] || model.name,
              isCached,
            };
          }
        }
      }
    }

    return {
      label: modelIdMap?.[value] || value,
      isCached: false,
    };
  }, [allGroups, modelIdMap, value, cachedSet]);

  const toggleExpanded = (modelId: string) => {
    setExpandedModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

  const formatVRAM = (mb?: number) => {
    if (mb === undefined) return null;
    if (mb < 1024) return `VRAM ${mb}MB`;
    return `VRAM ${(mb / 1024).toFixed(1)}GB`;
  };

  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        className={`${styles.trigger} ${compact ? styles.triggerCompact : ""} ${variant === "ghost" ? styles.triggerGhost : ""}`}
        aria-label="Select model"
      >
        <Select.Value placeholder="Select a model...">
          {selectedInfo && (
            <span className={styles.triggerValue}>
              <span className={styles.triggerLabel}>{selectedInfo.label}</span>
              {loadingCachedModels ? (
                <span className={styles.loadingSpinner} title="Checking cached models...">
                  <SpinnerIcon className={styles.spinner} />
                </span>
              ) : (
                selectedInfo.isCached && (
                  <span className={styles.cachedBadge} title="Cached">
                    <CheckmarkIcon />
                  </span>
                )
              )}
            </span>
          )}
        </Select.Value>
        <Select.Icon className={styles.icon}>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={8}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {availableTags.length > 0 && (
            <div className={styles.filterWrapper}>
              <button
                className={`${styles.filterChip} ${activeFilter === null ? styles.filterChipActive : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveFilter(null);
                }}
              >
                All
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={`${styles.filterChip} ${activeFilter === tag ? styles.filterChipActive : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveFilter(tag === activeFilter ? null : tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          <Select.Viewport className={styles.viewport}>
            {filteredGroups.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateText}>No models found</div>
                <div className={styles.emptyStateSubtext}>Try a different search term</div>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id} className={styles.group}>
                  <div className={styles.groupLabel}>{group.label}</div>
                  {group.models.map((model) => {
                    if (model.quantizations.length === 0) return null;

                    // Choose a default quantization: lowest VRAM first, then lexicographically
                    const sortedQuantizations = [...model.quantizations].sort((a, b) => {
                      if (a.vramMB !== undefined && b.vramMB !== undefined) {
                        return a.vramMB - b.vramMB;
                      }
                      return a.modelId.localeCompare(b.modelId);
                    });

                    const defaultQuant = sortedQuantizations[0];
                    if (!defaultQuant) return null;

                    const isCachedDefault =
                      cachedSet instanceof Set
                        ? cachedSet.has(defaultQuant.modelId)
                        : Array.isArray(cachedSet)
                          ? cachedSet.includes(defaultQuant.modelId)
                          : false;
                    const isExpanded = expandedModels.has(model.id);

                    return (
                      <div key={model.id} className={styles.modelBlock}>
                        <div
                          className={styles.modelHeader}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpanded(model.id);
                          }}
                          aria-label={
                            isExpanded ? "Collapse quantizations" : "Expand quantizations"
                          }
                        >
                          <span className={styles.itemLabel}>{model.name}</span>
                          <div className={styles.itemMeta}>
                            {isCachedDefault && (
                              <span
                                className={styles.itemBadge}
                                title="Default quantization cached"
                              >
                                <CheckmarkSmallIcon />
                              </span>
                            )}
                            <button
                              type="button"
                              className={styles.expandButton}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleExpanded(model.id);
                              }}
                            >
                              <ChevronRightIcon
                                style={{
                                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                  transition: "transform 0.15s ease",
                                }}
                              />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className={styles.quantizationList}>
                            {sortedQuantizations.map((quant) => {
                              const isCached =
                                cachedSet instanceof Set
                                  ? cachedSet.has(quant.modelId)
                                  : Array.isArray(cachedSet)
                                    ? cachedSet.includes(quant.modelId)
                                    : false;

                              return (
                                <Select.Item
                                  key={quant.modelId}
                                  value={quant.modelId}
                                  className={styles.itemQuant}
                                >
                                  <Select.ItemText>
                                    <div className={styles.itemContent}>
                                      <span className={styles.itemLabel}>{quant.label}</span>
                                      <div className={styles.itemMeta}>
                                        {isCached && (
                                          <span className={styles.itemBadge} title="Cached">
                                            <CheckmarkSmallIcon />
                                          </span>
                                        )}
                                        {formatVRAM(quant.vramMB) && (
                                          <span className={styles.vramBadge}>
                                            {formatVRAM(quant.vramMB)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </Select.ItemText>
                                </Select.Item>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default ModelSelect;
