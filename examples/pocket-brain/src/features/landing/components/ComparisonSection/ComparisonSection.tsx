import React from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { comparisonRows } from "../../data/comparisonData";
import { getComparisonStyling } from "../../utils/comparisonUtils";
import styles from "./ComparisonSection.module.css";

export const ComparisonSection: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <section className={styles.comparisonSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Pocket Brain vs ChatGPT</h2>
          <p className={styles.subtitle}>
            A quick side‑by‑side comparison of Browser AI vs Cloud AI.
          </p>
        </div>

        {isMobile ? (
          <div className={styles.mobileGrid}>
            {comparisonRows.map((row, i) => {
              const browserStyling = getComparisonStyling("browser", row.advantage);
              const cloudStyling = getComparisonStyling("cloud", row.advantage);
              return (
                <div key={i} className={styles.mobileCard}>
                  <div className={styles.mobileCriteria}>{row.criteria}</div>
                  <div className={styles.mobileOptions}>
                    <div
                      className={styles.mobileOption}
                      style={{ background: browserStyling.background }}
                    >
                      <div className={styles.mobileOptionHeader}>
                        {browserStyling.icon} Browser AI
                      </div>
                      <div>{row.browser}</div>
                    </div>
                    <div
                      className={styles.mobileOption}
                      style={{ background: cloudStyling.background }}
                    >
                      <div className={styles.mobileOptionHeader}>{cloudStyling.icon} Cloud AI</div>
                      <div>{row.cloud}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th>Criteria</th>
                    <th>Pocket Brain (Browser AI)</th>
                    <th>ChatGPT (Cloud AI)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => {
                    const browserStyling = getComparisonStyling("browser", row.advantage);
                    const cloudStyling = getComparisonStyling("cloud", row.advantage);
                    return (
                      <tr key={i} className={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                        <td className={styles.tableCellCriteria}>{row.criteria}</td>
                        <td className={styles.tableCell}>
                          <span style={{ background: browserStyling.background }}>
                            {browserStyling.icon} {row.browser}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <span style={{ background: cloudStyling.background }}>
                            {cloudStyling.icon} {row.cloud}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
