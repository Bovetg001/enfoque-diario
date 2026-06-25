"use client";
import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("enfoque-theme");
    if (stored === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else {
      // auto
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = (dark: boolean) => {
        setTheme(dark ? "dark" : "light");
        document.documentElement.classList.toggle("dark", dark);
      };
      apply(mq.matches);
      mq.addEventListener("change", (e) => apply(e.matches));
    }
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("enfoque-theme", next);
  };

  return { theme, toggle };
}
