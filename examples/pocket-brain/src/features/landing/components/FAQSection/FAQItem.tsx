import styles from "./FAQSection.module.css";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className={styles.faqItem}>
      <button onClick={onToggle} className={styles.faqButton}>
        {question}
        <span className={`${styles.faqArrow} ${isOpen ? styles.faqArrowOpen : ""}`}>↓</span>
      </button>
      {isOpen && <div className={styles.faqAnswer}>{answer}</div>}
    </div>
  );
}
