import { useEffect } from "react";
import { useApp } from "@/store/app";

/**
 * Main sets nativeTheme.themeSource from the preference, so prefers-color-scheme already reflects
 * system, light, or dark. The renderer only mirrors it onto the root class.
 */
export function useTheme(): void {
  const theme = useApp((s) => s.settings.theme);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" ? true : theme === "light" ? false : mq.matches;
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}
