export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "What is Pocket Brain?",
    answer:
      "Pocket Brain is an AI chat app that runs entirely in your web browser, designed to showcase the state-of-the-art in decentralized AI. Unlike cloud-based tools, it runs locally on your device's GPU—meaning it works offline, your data never leaves your device, and there's zero installation required. Our goal is to empower anyone to run powerful models privately and for free.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes, 100%. Since the AI model runs inside your browser, no text you type and no answer the AI generates is ever sent to a server. You can literally turn off your Wi-Fi after the model loads and it will still work perfectly.",
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
];
