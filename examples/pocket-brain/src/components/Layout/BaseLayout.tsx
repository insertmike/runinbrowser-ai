import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../../contexts/ThemeProvider";
import styles from "./BaseLayout.module.css";

export default function BaseLayout() {
  return (
    <ThemeProvider>
      <div className={styles.container}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}
