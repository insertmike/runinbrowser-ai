import styles from "./YouTubeSection.module.css";
import { YouTubeLargeIcon, YouTubeIcon } from "~assets/icons";

interface YouTubeSectionProps {
  videoId?: string; // YouTube video ID - can be added later when video is ready
}

export function YouTubeSection({ videoId }: YouTubeSectionProps) {
  return (
    <section className={styles.youtubeSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>See Pocket Brain in Action 🎥</h2>
          <p className={styles.subtitle}>
            Watch how Pocket Brain works and learn about building privacy-first AI applications
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.videoContainer}>
            {videoId ? (
              <div className={styles.videoWrapper}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Pocket Brain Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.video}
                />
              </div>
            ) : (
              <div className={styles.videoPlaceholder}>
                <div className={styles.placeholderIcon}>
                  <YouTubeLargeIcon />
                </div>
                <h3 className={styles.placeholderTitle}>Video Coming Soon!</h3>
                <p className={styles.placeholderText}>
                  I'm working on a detailed walkthrough of Pocket Brain. Subscribe to be notified
                  when it's ready!
                </p>
              </div>
            )}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.supportCard}>
              <h3 className={styles.supportTitle}>💝 Support This Project</h3>
              <p className={styles.supportText}>
                Pocket Brain is completely <strong>free and open source</strong>. If you find it
                useful, the best way to support me is by subscribing to my YouTube channel where I
                share more privacy-focused tech projects and tutorials!
              </p>

              <div className={styles.subscribeSection}>
                <a
                  href="https://youtube.com/@mihailbuilds"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.subscribeButton}
                >
                  <YouTubeIcon />
                  Subscribe to @mihailbuilds
                </a>
                <p className={styles.subscribeNote}>
                  Your subscription helps me create more free, privacy-focused tools!
                </p>
              </div>
            </div>

            <div className={styles.featuresCard}>
              <h3 className={styles.featuresTitle}>🎬 What You'll See</h3>
              <ul className={styles.featuresList}>
                <li>Complete setup walkthrough</li>
                <li>Privacy features explained</li>
                <li>Offline functionality demo</li>
                <li>Behind-the-scenes development</li>
                <li>Tips for building similar apps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default YouTubeSection;
