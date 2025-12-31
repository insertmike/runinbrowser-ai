import { useState } from "react";
import MarkdownIt from "markdown-it";
import styles from "./MessageContent.module.css";

// Initialize markdown-it
const md = new MarkdownIt();

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  const [isThinkingVisible, setIsThinkingVisible] = useState(false);

  // Add simple token counting function
  const countTokens = (text: string): number => {
    // This is a very basic approximation - for more accurate counts,
    // you might want to use a proper tokenizer library
    return Math.ceil(text.length / 4);
  };

  const parseContent = (text: string) => {
    // Check if we have a partial thinking block
    if (text.includes("<think>") && !text.includes("</think>")) {
      const parts = text.split("<think>");
      const thinkContent = parts[1] ?? "";
      return {
        thinking: thinkContent.trim(),
        response: "",
        isPartial: true,
      };
    }

    // Check for complete thinking block
    const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>\s*([\s\S]*)/);
    if (!thinkMatch || thinkMatch.length < 3) return { response: text };

    return {
      thinking: (thinkMatch[1] ?? "").trim(),
      response: (thinkMatch[2] ?? "").trim(),
      isPartial: false,
    };
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return (
      <div
        className={styles.markdownContent}
        dangerouslySetInnerHTML={{ __html: md.render(text) }}
      />
    );
  };

  const { thinking, response, isPartial } = parseContent(content);

  return (
    <div>
      {thinking && (
        <div className={styles.thinkingDropdown}>
          <div
            className={styles.thinkingHeader}
            onClick={() => setIsThinkingVisible(!isThinkingVisible)}
          >
            <span>💭 AI's Thinking Process {isPartial ? "(in progress...)" : ""}</span>
            <span className={`${styles.icon} ${isThinkingVisible ? styles.open : ""}`}>▼</span>
          </div>
          {isThinkingVisible && (
            <div className={styles.thinkingContent}>{renderMarkdown(thinking)}</div>
          )}
        </div>
      )}
      <div className={styles.responseContent}>
        {renderMarkdown(response || (!thinking ? content : ""))}
      </div>
      <div className={styles.tokenCount}>~{countTokens(content)} tokens</div>
    </div>
  );
}
