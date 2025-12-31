import styles from "./SuggestedActions.module.css";

type SuggestedActionsProps = {
  onSelect: (text: string) => void;
  disabled?: boolean;
};

const DEFAULT_ACTIONS = [
  "Explain artificial intelligence in 3 sentences",
  "Pitch a ridiculous startup idea",
  "Plan a surprise gift for my girlfriend",
  "Explain turbulence in airplanes in 3 sentences",
];

export function SuggestedActions({ onSelect, disabled = false }: SuggestedActionsProps) {
  return (
    <div className={styles.container} data-testid="suggested-actions">
      {DEFAULT_ACTIONS.map((text) => (
        <button
          key={text}
          className={styles.pill}
          onClick={() => onSelect(text)}
          type="button"
          disabled={disabled}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export default SuggestedActions;
