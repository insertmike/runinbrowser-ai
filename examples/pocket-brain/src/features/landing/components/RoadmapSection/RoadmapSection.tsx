import React from "react";
import styles from "./RoadmapSection.module.css";

const roadmapItems = [
  {
    number: "1",
    title: "Today: Chat in your browser",
    description: "Powered fully on-device with multiple model options and real-time streaming.",
    isActive: true,
  },
  {
    number: "2",
    title: "Next: More models, architectures & engines",
    description:
      "Expanded model library, support for different architectures, inference engines (e.g. transformers.js), and advanced chat features.",
    isActive: false,
  },
  {
    number: "3",
    title: "Looking Ahead",
    description:
      "We're exploring possibilities. Pocket Brain could become the first step towards a browser AI ecosystem - free, open-source, and privacy-first.",
    isActive: false,
  },
];

export const RoadmapSection: React.FC = () => {
  return (
    <section className={styles.roadmapSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>What's next</h2>
          <p className={styles.subtitle}>Tentative roadmap based on signal.</p>
        </div>

        <div className={styles.roadmapList}>
          {roadmapItems.map((item, index) => (
            <div
              key={index}
              className={`feature-card ${styles.roadmapItem} ${
                item.isActive ? styles.roadmapItemActive : ""
              }`}
            >
              <div
                className={`${styles.roadmapNumber} ${
                  item.isActive ? styles.roadmapNumberActive : ""
                }`}
              >
                {item.number}
              </div>
              <div>
                <h3 className={styles.roadmapTitle}>{item.title}</h3>
                <p className={styles.roadmapDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
