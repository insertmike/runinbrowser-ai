import React from "react";
import styles from "./HowItWorksSection.module.css";

const steps = [
  {
    badge: "1",
    title: "Load on device",
    desc: "The model streams once into your browser and is cached locally.",
    icon: "💾",
  },
  {
    badge: "2",
    title: "Process your prompt",
    desc: "Your words are tokenized and prepared entirely in the browser.",
    icon: "🧩",
  },
  {
    badge: "3",
    title: "Generate tokens",
    desc: "WebGPU accelerates the model to produce tokens in real‑time.",
    icon: "⚡",
  },
  {
    badge: "4",
    title: "Answer privately",
    desc: "Results render instantly - nothing leaves your device.",
    icon: "🔒",
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className={styles.howItWorksSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>How it works</h2>
          <p className={styles.description}>
            A high-level overview of how Pocket Brain works in just four steps.
          </p>
        </div>

        <div className={styles.grid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepBadge}>Step {step.badge}</div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
