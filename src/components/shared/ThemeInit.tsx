"use client";
import { useEffect } from "react";

export function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("enfoque-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    } else if (stored === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);
  return null;
}
