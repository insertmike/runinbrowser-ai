import React from "react";
import { useTheme } from "../../../../contexts/useTheme";
import styles from "./ThemeSwitch.module.css";
import { SunIcon, MoonIcon, SunIconLarge, MoonIconLarge } from "~assets/icons";

interface ThemeSwitchProps {
  variant?: "toggle" | "icon";
  floating?: boolean;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  variant = "toggle",
  floating = false,
}) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
        title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: 8,
          background: "transparent",
          border: "none",
          color: "var(--color-text)",
          cursor: "pointer",
        }}
      >
        {resolvedTheme === "light" ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  return (
    <button
      className={`${styles.themeSwitch} ${floating ? styles.themeSwitchFloating : ""}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
    >
      <div className={styles.switchTrack}>
        <div
          className={`${styles.switchThumb} ${
            resolvedTheme === "dark" ? styles.dark : styles.light
          }`}
        >
          {resolvedTheme === "light" ? <SunIconLarge /> : <MoonIconLarge />}
        </div>
      </div>
    </button>
  );
};
