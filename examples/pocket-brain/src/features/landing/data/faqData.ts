export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "What is Pocket Brain?",
    answer:
      "Pocket Brain is an AI chat app that runs entirely in your web browser. Unlike ChatGPT or Claude, which send your messages to a server, Pocket Brain downloads a small AI model to your device and runs it locally using your computer's graphics card (GPU). This means it works offline and your data never leaves your device.",
  },
  {
    question: "What is the goal of this project?",
    answer:
      "We aim to showcase the state-of-the-art in browser-based AI and empower anyone to run powerful models locally. We believe the future of AI is decentralized and private, and we are committed to supporting this direction by maintaining and expanding this project.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes, 100%. Since the AI model runs inside your browser, no text you type and no answer the AI generates is ever sent to a server. You can literally turn off your Wi-Fi after the model loads and it will still work perfectly.",
  },
  {
    question: "Why is the first message slow?",
    answer:
      "When you first select a model, your browser needs to download the AI weights (usually 1-4GB) and load them into memory. This only happens once per model. After that, the model is cached on your device and will load instantly next time, even without internet.",
  },
  {
    question: "Does it work on my phone?",
    answer:
      "Yes! Modern high-end Android phones (Pixel 8+, Galaxy S23+) and iPhones (15 Pro+) can run smaller models. By default smallest models are selected. Older devices may struggle due to memory and processing requirements.",
  },
  {
    question: "Why a browser app instead of a native app?",
    answer:
      "Our goal is maximum accessibility - no installations required, just open a link and run it. While browser environments can be more limited in memory management, especially on mobile, we are exploring native wrappers for the future to improve reliability. For now, we're focused on pushing the limits of what's possible directly in the web.",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "Pocket Brain works best in modern browsers that support WebGPU, including Chrome, Edge, Safari and Firefox. For best results, we recommend using the latest version of Chrome or Edge.",
  },
  {
    question: "How can I support the project?",
    answer:
      "You can support the project by starring it on GitHub or subscribing to the creator's YouTube channel for upcoming content in 2026.",
  },
];
