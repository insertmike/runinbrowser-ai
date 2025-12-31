import { Button } from "../../../shared/components/Button/Button";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  onScrollToDemo: () => void;
  onScrollToGitHub: () => void;
}

export function HeroSection({ onScrollToDemo, onScrollToGitHub }: HeroSectionProps) {
  return (
    <section className={styles.heroSection}>
      <div className={styles.backgroundPattern} />
      <div className={`container ${styles.container}`}>
        <div className={styles.content}>
          <div className={`badge animate-slide-up ${styles.badge}`}>🛡️ Private by Default</div>

          <h1 className={styles.title}>
            AI that runs in your browser -{" "}
            <span className={styles.titleGradient}>even at 30,000 feet</span>
          </h1>

          <p className={styles.description}>
            Private, offline, and ready anywhere. We are on a mission to run any AI model in your
            browser
          </p>

          <div className={styles.buttonContainer}>
            <Button
              variant="primary"
              size="large"
              onClick={onScrollToDemo}
              className={styles.button}
            >
              ✨ Try Pocket Brain
            </Button>

            <Button
              variant="secondary"
              size="large"
              onClick={onScrollToGitHub}
              className={styles.button}
            >
              View on GitHub
            </Button>
          </div>

          <p className={styles.poweredBy}>
            Powered by{" "}
            <a
              href="https://github.com/insertmike/runinbrowser"
              target="_blank"
              rel="noopener noreferrer"
            >
              runinbrowser
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
