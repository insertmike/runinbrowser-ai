import React from "react";
import styles from "./ChatBox.module.css";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { ScrollDownIcon } from "~assets/icons";

export interface ChatBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isEmpty?: boolean;
}

export const ChatBox = ({ children, className, isEmpty, ...props }: ChatBoxProps) => {
  const chatBoxClasses = [
    styles.chatBox,
    "custom-scrollbar",
    isEmpty && styles.chatBoxEmpty,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const { scrollRef, isAtBottom, disableAutoScroll, scrollToBottom } = useAutoScroll({
    content: children,
    smooth: true,
  });

  return (
    <div className={chatBoxClasses} {...props}>
      <div
        ref={scrollRef}
        className={`${styles.chatInner} ${isEmpty ? styles.chatInnerEmpty : ""}`}
        onWheel={disableAutoScroll}
        onTouchMove={disableAutoScroll}
      >
        <div className={styles.messages}>{children}</div>
      </div>

      {!isAtBottom && (
        <button
          type="button"
          className={styles.scrollToBottom}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
        >
          <ScrollDownIcon />
        </button>
      )}
    </div>
  );
};

ChatBox.displayName = "ChatBox";

export default ChatBox;
