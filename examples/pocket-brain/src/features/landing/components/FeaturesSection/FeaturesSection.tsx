import React from "react";
import styles from "./FeaturesSection.module.css";

const features = [
  {
    icon: "📡",
    title: "No internet? No problem.",
    description: "Works completely offline after the initial model download.",
  },
  {
    icon: "🔒",
    title: "Your words never leave your device.",
    description: "Complete privacy with zero data collection or tracking.",
  },
  {
    icon: "🔌",
    title: "Zero setup",
    description: "No installs or drivers. Open the app and you're ready.",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className={styles.featuresSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>This shouldn't be possible</h2>
          <p className={styles.subtitle}>
            But here we are, Brain Pocket makes the impossible feel inevitable
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={`feature-card ${styles.featureCard}`}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
