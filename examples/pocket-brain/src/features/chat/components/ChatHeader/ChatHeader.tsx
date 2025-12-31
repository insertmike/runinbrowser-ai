import { useNavigate } from "react-router-dom";
import styles from "./ChatHeader.module.css";
import { SettingsIcon, HelpCircleIcon } from "~assets/icons";

export interface ChatHeaderProps {
  onSettingsClick: () => void;
  onSupportClick: () => void;
  onFAQClick: () => void;
}

export function ChatHeader({ onSettingsClick, onSupportClick, onFAQClick }: ChatHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.brandName} onClick={() => navigate("/")}>
          Pocket Brain
        </h1>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.supportButton}
            onClick={onSupportClick}
            aria-label="Support the project"
          >
            <span>❤️</span>
            <span className={styles.supportText}>Support</span>
          </button>
          <div className={styles.divider} />
          <button
            type="button"
            className={styles.settingsButton}
            aria-label="FAQ"
            onClick={onFAQClick}
          >
            <HelpCircleIcon />
          </button>
          <button
            type="button"
            className={styles.settingsButton}
            aria-label="Settings"
            onClick={onSettingsClick}
          >
            <SettingsIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

export default ChatHeader;
