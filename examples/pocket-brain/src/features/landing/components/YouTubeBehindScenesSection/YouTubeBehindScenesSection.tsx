import React from "react";
import styles from "./YouTubeBehindScenesSection.module.css";
import { YouTubeLargeIcon, YouTubeIcon, GitHubIcon } from "~assets/icons";

export const YouTubeBehindScenesSection: React.FC = () => {
  return (
    <section id="github-section" className={styles.youtubeSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>See Behind the Scenes 🎥</h2>
          <p className={styles.description}>
            Join me on the journey of creating Pocket Brain - the choices, challenges, and
            breakthroughs that made it possible to run AI completely in the browser.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.videoContainer}>
            <div className={styles.videoPlaceholder}>
              <div className={styles.icon}>
                <YouTubeLargeIcon />
              </div>
              <h3 className={styles.placeholderTitle}>Video Coming Soon!</h3>
              <p className={styles.placeholderText}>
                I'm working on a detailed walkthrough of Pocket Brain. Subscribe to be notified when
                it's ready!
              </p>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={`feature-card ${styles.supportCard}`}>
              <h3 className={styles.supportTitle}>💝 Support This Project</h3>
              <p className={styles.supportText}>
                Pocket Brain is completely{" "}
                <strong className={styles.supportStrong}>free and open source</strong>. If you find
                it useful, the best way to support me is by subscribing to my YouTube channel where
                I share more privacy-focused tech projects and tutorials!
              </p>

              <div className={styles.actions}>
                <div className={styles.buttonGroup}>
                  <a
                    href="https://youtube.com/@mihailyonchev?sub_confirmation=1"
                    // target="_blank"
                    rel="noopener noreferrer"
                    className={styles.youtubeButton}
                  >
                    <YouTubeIcon />
                    Subscribe to Mihail Yonchev
                  </a>
                  <a
                    href="https://github.com/insertmike/runinbrowser-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.githubButton}
                  >
                    <GitHubIcon />
                    View on GitHub
                  </a>
                </div>
                <p className={styles.subscribeNote}>
                  Your subscription helps me create more free, privacy-focused tools!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
