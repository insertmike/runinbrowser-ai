import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/Button/Button";
import { RoutePath } from "~config/routes";
import styles from "./CTASection.module.css";

interface CTASectionProps {
  onScrollToBluePaper: () => void;
}

export function CTASection({ onScrollToBluePaper }: CTASectionProps) {
  const navigate = useNavigate();

  return (
    <section id="demo-section" className={styles.ctaSection}>
      <div className={`container ${styles.container}`}>
        <h2 className={styles.title}>Experience AI that stays with you</h2>
        <p className={styles.description}>
          Ready to try the future of private, offline AI? Start chatting now.
        </p>

        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate(RoutePath.CHAT)}
            className={styles.primaryButton}
          >
            ✨ Try Pocket Brain now
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={onScrollToBluePaper}
            className={styles.secondaryButton}
          >
            📊 Get free Blue Paper
          </Button>
        </div>
        <div className={styles.footer}>No sign-up required • Works offline • 100% private</div>
        <div className={styles.creatorRow}>
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/myonchev99/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creatorLink}
          >
            Mihail
          </a>
        </div>
      </div>
    </section>
  );
}
