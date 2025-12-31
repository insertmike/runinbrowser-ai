import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "~assets/icons";
import styles from "./FAQModal.module.css";

interface FAQModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FAQ_ITEMS = [
  {
    question: "What is Pocket Brain?",
    answer:
      "Pocket Brain is an AI chat app that runs entirely in your web browser. Unlike ChatGPT or Claude, which send your messages to a server, Pocket Brain downloads a small AI model to your device and runs it locally using your computer's graphics card (GPU). This means it works offline and your data never leaves your device.",
  },
  {
    question: "What is the goal of this project?",
    answer:
      "We aim to showcase the state-of-the-art in browser-based AI and empower anyone to run powerful models locally. We believe the future of AI is decentralized and private, and we are committed to supporting this direction by maintaining and expanding this project. While we don't expect to replace cloud giants like GPT-4 or Gemini immediately, our mission is to spread awareness about local AI capabilities and expand into new modalities (audio, vision) over time.",
  },
  {
    question: "Which models can I run?",
    answer:
      "We support a curated list of open-source models optimized for the web. Smaller models (like SmolLM2 or Llama-3.2-1B) run fast on most laptops. Larger models (like Llama-3.2-3B or Qwen2.5-7B) act smarter but require a more powerful computer with a dedicated GPU to run smoothly.",
  },

  {
    question: "Why is the first message slow?",
    answer:
      "When you first select a model, your browser needs to download the AI weights (usually 1-4GB) and load them into memory. This only happens once per model. After that, the model is cached on your device and will load instantly next time, even without internet.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes, but with limitations. Modern high-end Android phones (Pixel 8+, Galaxy S23+) and iPhones (15 Pro+) can run smaller models. Older devices may struggle or crash because running AI requires significant memory and processing power.",
  },
  {
    question: "Is my data private?",
    answer:
      "100%. Since the AI model runs inside your browser, no text you type and no answer the AI generates is ever sent to a server. You can literally turn off your Wi-Fi after the model loads and it will still work perfectly.",
  },

  {
    question: "Linux & Safari Issues?",
    answer:
      "Linux users: Ensure you have the latest Vulkan drivers installed. Safari users: You may need to enable 'WebGPU' in the Develop menu > Feature Flags. For best results, we recommend using the latest version of Chrome or Edge.",
  },
  {
    question: "How to become amazing humanbeing?",
    answer:
      "Join the community! You can support the project by starring it on GitHub or subscribing to the creator's YouTube channel for upcoming content in 2026.",
  },
];

export const FAQModal: React.FC<FAQModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />
        <Dialog.Content className={styles.dialogContent}>
          <Dialog.Title className={styles.dialogTitle}>Frequently Asked Questions</Dialog.Title>
          <Dialog.Description className={styles.dialogDescription}>
            Learn how Pocket Brain works and how to get the best experience.
          </Dialog.Description>

          <Accordion.Root
            type="single"
            defaultValue="item-0"
            collapsible
            className={styles.accordionRoot}
          >
            {FAQ_ITEMS.map((item, index) => (
              <Accordion.Item key={index} value={`item-${index}`} className={styles.accordionItem}>
                <Accordion.Header className={styles.accordionHeader}>
                  <Accordion.Trigger className={styles.accordionTrigger}>
                    {item.question}
                    <ChevronDownIcon className={styles.chevron} aria-hidden />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className={styles.accordionContent}>
                  <div className={styles.accordionContentText}>{item.answer}</div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          <Dialog.Close className={styles.dialogClose} aria-label="Close">
            ×
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
