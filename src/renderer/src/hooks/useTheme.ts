import { useEffect } from "react";
import { useApp } from "@/store/app";
import { activeUiTheme, cssVarsFor, THEME_VARS } from "@/lib/themes";

/**
 * Main sets nativeTheme.themeSource from the preference, so prefers-color-scheme already reflects
 * system, light, or dark. The renderer only mirrors it onto the root class.
 */
const SYSTEM_SANS = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

export function useTheme(): void {
  const theme = useApp((s) => s.settings.theme);
  const reduceMotion = useApp((s) => s.settings.reduceMotion);
  const uiFont = useApp((s) => s.settings.uiFont);
  const uiFontSize = useApp((s) => s.settings.uiFontSize);
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--ui-scale", String((uiFontSize || 14) / 14));
    if (uiFont) root.setProperty("--font-sans", `"${uiFont.replace(/"/g, "")}", ${SYSTEM_SANS}`);
    else root.removeProperty("--font-sans");
  }, [uiFont, uiFontSize]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);
  const darkTheme = useApp((s) => s.settings.darkTheme);
  const lightTheme = useApp((s) => s.settings.lightTheme);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" ? true : theme === "light" ? false : mq.matches;
      const root = document.documentElement;
      root.classList.toggle("dark", dark);
      // A theme overrides the token set inline; the built-in palette clears the overrides.
      const t = activeUiTheme(useApp.getState().settings, dark);
      const vars = t ? cssVarsFor(t) : null;
      for (const name of THEME_VARS) {
        if (vars) root.style.setProperty(name, vars[name]);
        else root.style.removeProperty(name);
      }
      root.dataset.theme = t?.id ?? "default";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, darkTheme, lightTheme]);
}
