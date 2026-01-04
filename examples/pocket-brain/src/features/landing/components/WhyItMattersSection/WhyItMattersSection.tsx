import React from "react";
import styles from "./WhyItMattersSection.module.css";

const problems = [
  {
    icon: "🕵️",
    title: "Your chats are being harvested",
    desc: "Every prompt you send to ChatGPT or Gemini may become training data. Your private thoughts are building someone else's empire.",
  },
  {
    icon: "💸",
    title: "You're paying to be the product",
    desc: "You pay subscriptions for AI that learns from your data, then charges you more for premium features.",
  },
  {
    icon: "📦",
    title: "You're chatting with a black box",
    desc: "Hidden algorithms, unknown biases, mysterious data processing. You have no idea what's really happening behind the scenes.",
  },
];

const solutions = [
  {
    icon: "🔒",
    title: "AI that belongs to you",
    desc: "Your conversations stay on your device. No servers, no logs, no data mining. Complete privacy by design.",
  },
  {
    icon: "🌍",
    title: "Intelligence without borders",
    desc: "Works on planes, trains, and even the top of Everest - anywhere with a browser. No internet required after setup.",
  },
  {
    icon: "⚡",
    title: "The future starts here",
    desc: "What once needed supercomputers can now run in your browser. AI is becoming smaller, quicker, and closer to you.",
  },
];

export const WhyItMattersSection: React.FC = () => {
  return (
    <section className={styles.whyItMattersSection}>
      <div className={styles.backgroundPattern} />
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why it truly matters</h2>
          <p className={styles.description}>
            Today's AI comes with strings attached: your data, money and trust. Brain Pocket is the
            AI with the freedom you deserve - in your browser.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>
              <span className={styles.problemGradient}>The Problem</span>
            </h3>
            <div className={styles.items}>
              {problems.map((problem, index) => (
                <div key={index} className={styles.item}>
                  <div className={styles.itemIcon}>{problem.icon}</div>
                  <div>
                    <h4 className={styles.itemTitle}>{problem.title}</h4>
                    <p className={styles.itemDescription}>{problem.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>
              <span className={styles.solutionGradient}>The Solution</span>
            </h3>
            <div className={styles.items}>
              {solutions.map((solution, index) => (
                <div key={index} className={`${styles.item} ${styles.solutionItem}`}>
                  <div className={styles.itemIcon}>{solution.icon}</div>
                  <div>
                    <h4 className={styles.itemTitle}>{solution.title}</h4>
                    <p className={styles.itemDescription}>{solution.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerIcon}>🚀</div>
          <h3 className={styles.footerTitle}>This is just the beginning</h3>
          <p className={styles.footerDescription}>
            We're at the very start of what's possible with local AI. While server models are still
            more powerful, the gap in speed and capability is closing fast, and soon world-class AI
            won't come at the cost of your privacy. Brain pocket will keep up with the latest
            advancements in AI.
          </p>
        </div>
      </div>
    </section>
  );
};
