import { MessageContent } from "../MessageContent/MessageContent";
import styles from "../Message/Message.module.css";

export interface MessageProps {
  text: string;
  isUser: boolean;
  className?: string;
}

export function Message({ text, isUser, className }: MessageProps) {
  const containerClasses = [
    styles.messageContainer,
    isUser ? styles.isUser : styles.isAssistant,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className={styles.messageContent}>
        <MessageContent content={text} />
      </div>
      <div className={styles.timestamp} aria-hidden="true">
        {new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

export default Message;
