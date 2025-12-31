import React, { useState } from "react";
import { faqItems } from "../../data/faqData";
import { FAQItem } from "./FAQItem";
import styles from "./FAQSection.module.css";

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqSection}>
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Frequently asked questions</h2>
          <p className={styles.subtitle}>Your questions, answered.</p>
        </div>

        <div className={styles.faqList}>
          {faqItems.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => toggleFaq(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
