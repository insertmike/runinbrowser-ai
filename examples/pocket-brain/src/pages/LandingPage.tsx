import { useState } from "react";
import { ThemeSwitch } from "../features/shared/components/ThemeSwitch";

import {
  HeroSection,
  FeaturesSection,
  WhyItMattersSection,
  ComparisonSection,
  HowItWorksSection,
  RoadmapSection,
  NewsletterSection,
  FAQSection,
  CTASection,
} from "../features/landing/components";
import { YouTubeBehindScenesSection } from "../features/landing/components/YouTubeBehindScenesSection/YouTubeBehindScenesSection";
import styles from "./LandingPage.module.css";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const scrollToDemo = () => {
    document.getElementById("demo-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToGitHub = () => {
    document.getElementById("github-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const scrollToBluePaper = () => {
    document.getElementById("blue-paper-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(
        "https://qhablahneaxtlctthytc.supabase.co/functions/v1/super-responder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      if (response.ok) {
        setSubmitStatus("success");
        setEmail("");
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.landingPage}>
      <ThemeSwitch floating />
      <HeroSection onScrollToDemo={scrollToDemo} onScrollToGitHub={scrollToGitHub} />
      <FeaturesSection />
      <WhyItMattersSection />
      <ComparisonSection />
      <HowItWorksSection />
      <RoadmapSection />
      <NewsletterSection
        email={email}
        setEmail={setEmail}
        isSubmitting={isSubmitting}
        submitStatus={submitStatus}
        onSubmit={handleNewsletterSubmit}
      />
      <FAQSection />
      <YouTubeBehindScenesSection />
      <CTASection onScrollToBluePaper={scrollToBluePaper} />
    </div>
  );
}
