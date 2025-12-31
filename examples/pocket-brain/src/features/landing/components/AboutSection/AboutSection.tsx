import React from "react";
import styles from "./AboutSection.module.css";

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>About Pocket Brain ✈️</h2>
          <p className={styles.subtitle}>
            Privacy-first AI that works offline. Chat with AI even at 30,000 feet.
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.mainContent}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>What is Pocket Brain?</h3>
              <p className={styles.text}>
                Pocket Brain is a privacy-first AI chat application that runs entirely in your
                browser. Unlike traditional AI services, your conversations never leave your device
                - making it perfect for use on airplanes, in areas with poor internet, or whenever
                you want complete privacy.
              </p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>How It Works</h3>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h4>Download Model</h4>
                    <p>
                      When you first send a message, the AI model downloads to your browser's cache
                    </p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h4>Local Processing</h4>
                    <p>
                      All AI processing happens locally using WebAssembly and WebGL acceleration
                    </p>
                  </div>
                </div>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h4>Offline Ready</h4>
                    <p>
                      Once loaded, you can chat completely offline - no internet connection needed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Privacy & Security</h3>
              <div className={styles.features}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🔒</span>
                  <div>
                    <strong>Complete Privacy:</strong> Your conversations never leave your device
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>📱</span>
                  <div>
                    <strong>Local Processing:</strong> All AI computation happens in your browser
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🌐</span>
                  <div>
                    <strong>No Servers:</strong> No data is sent to external servers or APIs
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💾</span>
                  <div>
                    <strong>Local Storage:</strong> Chat history is stored only on your device
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>Technology Stack</h3>
              <p className={styles.text}>
                Built with modern web technologies including React, TypeScript, and
                <a
                  href="https://browserai.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {" "}
                  BrowserAI
                </a>
                for running large language models directly in the browser.
              </p>
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>About the Creator</h3>
              <p className={styles.text}>
                Created by <strong>Mihail</strong>, a developer passionate about privacy-preserving
                AI and making advanced technology accessible to everyone. This project was born from
                the frustration of not being able to use AI assistants while traveling.
              </p>
              <p className={styles.text}>
                Follow my journey on <strong>YouTube</strong> where I share tutorials, project
                walkthroughs, and insights about building privacy-first applications.
              </p>
              <div className={styles.links}>
                <a
                  href="https://youtube.com/@mihailbuilds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkButton}
                  style={{
                    background: "#ff0000",
                    color: "white",
                    borderColor: "#ff0000",
                  }}
                >
                  YouTube Channel
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                  View Source Code
                </a>
                <a
                  href="https://github.com/mihailbuilds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkButton}
                >
                  More Projects
                </a>
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>System Requirements</h3>
              <ul className={styles.requirements}>
                <li>Modern browser with WebAssembly support</li>
                <li>At least 2GB of available RAM</li>
                <li>WebGL support for optimal performance</li>
                <li>Initial internet connection to download models</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
