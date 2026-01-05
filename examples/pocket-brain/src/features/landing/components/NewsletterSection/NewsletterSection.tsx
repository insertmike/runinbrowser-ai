import type { FormEvent } from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { Button } from "../../../shared/components/Button/Button";
import styles from "./NewsletterSection.module.css";

interface NewsletterSectionProps {
  email: string;
  setEmail: (email: string) => void;
  isSubmitting: boolean;
  submitStatus: "idle" | "success" | "error";
  onSubmit: (e: FormEvent) => void;
}

export function NewsletterSection({
  email,
  setEmail,
  isSubmitting,
  submitStatus,
  onSubmit,
}: NewsletterSectionProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <section id="blue-paper-section" className={styles.newsletterSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Get a free blue paper</h2>
          <p className={styles.description}>
            Access the blue paper research document for building Pocket Brain: State of the Art in
            In-Browser AI Model Execution
          </p>
        </div>

        <div className={styles.formContainer}>
          {submitStatus === "success" ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>✅</div>
              <p className={styles.successText}>
                You'll get the Blue Paper in your inbox in the next 24 hours!
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className={`${styles.form} ${isMobile ? styles.formMobile : ""}`}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className={`${styles.input} ${submitStatus === "error" ? styles.inputError : ""}`}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className={`${styles.button} ${isSubmitting ? styles.buttonSubmitting : ""}`}
              >
                {isSubmitting ? "Sending..." : "📊 Get Free Blue Paper"}
              </Button>
            </form>
          )}

          {submitStatus === "error" && (
            <p className={styles.errorMessage}>Something went wrong. Please try again.</p>
          )}
          <p className={styles.footerText}>Plus updates on privacy-focused AI developments</p>
          <p className={styles.footerSmall}>No spam, unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
