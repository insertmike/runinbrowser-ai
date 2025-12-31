import type { HTMLAttributes, ReactNode } from "react";
import styles from "./InputContainer.module.css";

export interface InputContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function InputContainer({ children, className, ...props }: InputContainerProps) {
  const containerClasses = [styles.inputContainer, className].filter(Boolean).join(" ");

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
}

export default InputContainer;
