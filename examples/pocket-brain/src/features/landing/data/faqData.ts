export interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Do I need internet?",
    answer:
      "No, Pocket Brain runs completely offline after the initial model download. Once loaded, you can use it anywhere - even at 30,000 feet with no WiFi.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes, absolutely. Nothing leaves your device. All conversations happen locally in your browser. No data is sent to servers, tracked, or stored anywhere except locally on your device.",
  },
  {
    question: "Does it work on my phone?",
    answer:
      "Yes! We automatically select smaller, optimized models based on your device's hardware. While these compact models have limited knowledge, they're great for experiencing truly private AI on your phone.",
  },
  {
    question: "Which browsers are supported?",
    answer:
      "Pocket Brain works best in modern browsers that support WebGPU, including Chrome, Edge, Safari and Firefox. Some browsers may require you to enable experimental WebGPU feature, we guide you through the process in the app.",
  },
  {
    question: "How big are the models?",
    answer:
      "Model sizes vary from 1GB to 8GB depending on the model you choose. Smaller models download faster and run quicker, while larger models provide better responses. You can switch between models anytime.",
  },
];
