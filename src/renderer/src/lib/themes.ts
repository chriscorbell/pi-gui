import type { GuiSettings } from "@shared/contract";

/**
 * Optional color themes for the interface and the terminal. Each theme carries the handful of
 * surfaces and accents the UI tokens are derived from, plus a 16-color ANSI palette for xterm.
 * "default" keeps the built-in zinc palette from styles.css.
 */
export interface UiTheme {
  id: string;
  name: string;
  appearance: "dark" | "light";
  bg: string;
  sunken: string;
  surface: string;
  raised: string;
  fg: string;
  muted: string;
  faint: string;
  accent: string;
  ok: string;
  warn: string;
  danger: string;
  /** black, red, green, yellow, blue, magenta, cyan, white, then the bright eight. */
  ansi: string[];
}

export const DEFAULT_THEME = "default";
export const MATCH_INTERFACE = "match";

export const THEMES: UiTheme[] = [
  {
    id: "dracula", name: "Dracula", appearance: "dark",
    bg: "#282a36", sunken: "#21222c", surface: "#2c2e3b", raised: "#353748",
    fg: "#f8f8f2", muted: "#a8adc8", faint: "#6272a4", accent: "#bd93f9", ok: "#50fa7b", warn: "#f1fa8c", danger: "#ff5555",
    ansi: ["#21222c", "#ff5555", "#50fa7b", "#f1fa8c", "#bd93f9", "#ff79c6", "#8be9fd", "#f8f8f2", "#6272a4", "#ff6e6e", "#69ff94", "#ffffa5", "#d6acff", "#ff92df", "#a4ffff", "#ffffff"],
  },
  {
    id: "catppuccin-latte", name: "Catppuccin Latte", appearance: "light",
    bg: "#eff1f5", sunken: "#e6e9ef", surface: "#e6e9ef", raised: "#f7f8fb",
    fg: "#4c4f69", muted: "#6c6f85", faint: "#9ca0b0", accent: "#1e66f5", ok: "#40a02b", warn: "#df8e1d", danger: "#d20f39",
    ansi: ["#5c5f77", "#d20f39", "#40a02b", "#df8e1d", "#1e66f5", "#ea76cb", "#179299", "#acb0be", "#6c6f85", "#d20f39", "#40a02b", "#df8e1d", "#1e66f5", "#ea76cb", "#179299", "#bcc0cc"],
  },
  {
    id: "catppuccin-frappe", name: "Catppuccin Frappé", appearance: "dark",
    bg: "#303446", sunken: "#292c3c", surface: "#363a4f", raised: "#414559",
    fg: "#c6d0f5", muted: "#a5adce", faint: "#737994", accent: "#8caaee", ok: "#a6d189", warn: "#e5c890", danger: "#e78284",
    ansi: ["#51576d", "#e78284", "#a6d189", "#e5c890", "#8caaee", "#f4b8e4", "#81c8be", "#b5bfe2", "#626880", "#e78284", "#a6d189", "#e5c890", "#8caaee", "#f4b8e4", "#81c8be", "#a5adce"],
  },
  {
    id: "catppuccin-macchiato", name: "Catppuccin Macchiato", appearance: "dark",
    bg: "#24273a", sunken: "#1e2030", surface: "#2b2f44", raised: "#363a4f",
    fg: "#cad3f5", muted: "#a5adcb", faint: "#6e738d", accent: "#8aadf4", ok: "#a6da95", warn: "#eed49f", danger: "#ed8796",
    ansi: ["#494d64", "#ed8796", "#a6da95", "#eed49f", "#8aadf4", "#f5bde6", "#8bd5ca", "#b8c0e0", "#5b6078", "#ed8796", "#a6da95", "#eed49f", "#8aadf4", "#f5bde6", "#8bd5ca", "#a5adcb"],
  },
  {
    id: "catppuccin-mocha", name: "Catppuccin Mocha", appearance: "dark",
    bg: "#1e1e2e", sunken: "#181825", surface: "#24243a", raised: "#313244",
    fg: "#cdd6f4", muted: "#a6adc8", faint: "#6c7086", accent: "#89b4fa", ok: "#a6e3a1", warn: "#f9e2af", danger: "#f38ba8",
    ansi: ["#45475a", "#f38ba8", "#a6e3a1", "#f9e2af", "#89b4fa", "#f5c2e7", "#94e2d5", "#bac2de", "#585b70", "#f38ba8", "#a6e3a1", "#f9e2af", "#89b4fa", "#f5c2e7", "#94e2d5", "#a6adc8"],
  },
  {
    id: "tokyo-night", name: "Tokyo Night", appearance: "dark",
    bg: "#1a1b26", sunken: "#16161e", surface: "#1f2030", raised: "#292e42",
    fg: "#c0caf5", muted: "#a9b1d6", faint: "#565f89", accent: "#7aa2f7", ok: "#9ece6a", warn: "#e0af68", danger: "#f7768e",
    ansi: ["#414868", "#f7768e", "#9ece6a", "#e0af68", "#7aa2f7", "#bb9af7", "#7dcfff", "#a9b1d6", "#414868", "#f7768e", "#9ece6a", "#e0af68", "#7aa2f7", "#bb9af7", "#7dcfff", "#c0caf5"],
  },
  {
    id: "tokyo-night-storm", name: "Tokyo Night Storm", appearance: "dark",
    bg: "#24283b", sunken: "#1f2335", surface: "#292e42", raised: "#343a55",
    fg: "#c0caf5", muted: "#a9b1d6", faint: "#565f89", accent: "#7aa2f7", ok: "#9ece6a", warn: "#e0af68", danger: "#f7768e",
    ansi: ["#414868", "#f7768e", "#9ece6a", "#e0af68", "#7aa2f7", "#bb9af7", "#7dcfff", "#a9b1d6", "#414868", "#f7768e", "#9ece6a", "#e0af68", "#7aa2f7", "#bb9af7", "#7dcfff", "#c0caf5"],
  },
  {
    id: "tokyo-night-moon", name: "Tokyo Night Moon", appearance: "dark",
    bg: "#222436", sunken: "#1e2030", surface: "#2f334d", raised: "#383d5b",
    fg: "#c8d3f5", muted: "#98a2d6", faint: "#636da6", accent: "#82aaff", ok: "#c3e88d", warn: "#ffc777", danger: "#ff757f",
    ansi: ["#444a73", "#ff757f", "#c3e88d", "#ffc777", "#82aaff", "#c099ff", "#86e1fc", "#828bb8", "#444a73", "#ff757f", "#c3e88d", "#ffc777", "#82aaff", "#c099ff", "#86e1fc", "#c8d3f5"],
  },
  {
    id: "tokyo-night-day", name: "Tokyo Night Day", appearance: "light",
    bg: "#e1e2e7", sunken: "#d0d5e3", surface: "#d8dae5", raised: "#eceef3",
    fg: "#3760bf", muted: "#6172b0", faint: "#848cb5", accent: "#2e7de9", ok: "#587539", warn: "#8c6c3e", danger: "#f52a65",
    ansi: ["#b4b5b9", "#f52a65", "#587539", "#8c6c3e", "#2e7de9", "#9854f1", "#007197", "#6172b0", "#a1a6c5", "#f52a65", "#587539", "#8c6c3e", "#2e7de9", "#9854f1", "#007197", "#3760bf"],
  },
  {
    id: "everforest-dark", name: "Everforest Dark", appearance: "dark",
    bg: "#2d353b", sunken: "#232a2e", surface: "#343f44", raised: "#3d484d",
    fg: "#d3c6aa", muted: "#9da9a0", faint: "#7a8478", accent: "#a7c080", ok: "#a7c080", warn: "#dbbc7f", danger: "#e67e80",
    ansi: ["#475258", "#e67e80", "#a7c080", "#dbbc7f", "#7fbbb3", "#d699b6", "#83c092", "#d3c6aa", "#7a8478", "#e67e80", "#a7c080", "#dbbc7f", "#7fbbb3", "#d699b6", "#83c092", "#d3c6aa"],
  },
  {
    id: "everforest-light", name: "Everforest Light", appearance: "light",
    bg: "#fdf6e3", sunken: "#efebd4", surface: "#f4f0d9", raised: "#fffcf0",
    fg: "#5c6a72", muted: "#829181", faint: "#a6b0a0", accent: "#8da101", ok: "#8da101", warn: "#dfa000", danger: "#f85552",
    ansi: ["#5c6a72", "#f85552", "#8da101", "#dfa000", "#3a94c5", "#df69ba", "#35a77c", "#dfddc8", "#829181", "#f85552", "#8da101", "#dfa000", "#3a94c5", "#df69ba", "#35a77c", "#fdf6e3"],
  },
  {
    id: "everblush", name: "Everblush", appearance: "dark",
    bg: "#141b1e", sunken: "#0f1517", surface: "#1b2225", raised: "#232a2d",
    fg: "#dadada", muted: "#b3b9b8", faint: "#6b7b7d", accent: "#67b0e8", ok: "#8ccf7e", warn: "#e5c76b", danger: "#e57474",
    ansi: ["#232a2d", "#e57474", "#8ccf7e", "#e5c76b", "#67b0e8", "#c47fd5", "#6cbfbf", "#b3b9b8", "#2d3437", "#ef7e7e", "#96d988", "#f4d67a", "#71baf2", "#ce89df", "#67cbe7", "#bdc3c2"],
  },
  {
    id: "nord", name: "Nord", appearance: "dark",
    bg: "#2e3440", sunken: "#272c36", surface: "#3b4252", raised: "#434c5e",
    fg: "#eceff4", muted: "#d8dee9", faint: "#7b88a1", accent: "#88c0d0", ok: "#a3be8c", warn: "#ebcb8b", danger: "#bf616a",
    ansi: ["#3b4252", "#bf616a", "#a3be8c", "#ebcb8b", "#81a1c1", "#b48ead", "#88c0d0", "#e5e9f0", "#4c566a", "#bf616a", "#a3be8c", "#ebcb8b", "#81a1c1", "#b48ead", "#8fbcbb", "#eceff4"],
  },
  {
    id: "gruvbox-dark", name: "Gruvbox Dark", appearance: "dark",
    bg: "#282828", sunken: "#1d2021", surface: "#32302f", raised: "#3c3836",
    fg: "#ebdbb2", muted: "#bdae93", faint: "#928374", accent: "#83a598", ok: "#b8bb26", warn: "#fabd2f", danger: "#fb4934",
    ansi: ["#282828", "#cc241d", "#98971a", "#d79921", "#458588", "#b16286", "#689d6a", "#a89984", "#928374", "#fb4934", "#b8bb26", "#fabd2f", "#83a598", "#d3869b", "#8ec07c", "#ebdbb2"],
  },
  {
    id: "gruvbox-light", name: "Gruvbox Light", appearance: "light",
    bg: "#fbf1c7", sunken: "#f2e5bc", surface: "#f2e5bc", raised: "#f9f5d7",
    fg: "#3c3836", muted: "#665c54", faint: "#928374", accent: "#076678", ok: "#79740e", warn: "#b57614", danger: "#9d0006",
    ansi: ["#fbf1c7", "#cc241d", "#98971a", "#d79921", "#458588", "#b16286", "#689d6a", "#7c6f64", "#928374", "#9d0006", "#79740e", "#b57614", "#076678", "#8f3f71", "#427b58", "#3c3836"],
  },
  {
    id: "rose-pine", name: "Rosé Pine", appearance: "dark",
    bg: "#191724", sunken: "#16141f", surface: "#1f1d2e", raised: "#26233a",
    fg: "#e0def4", muted: "#908caa", faint: "#6e6a86", accent: "#c4a7e7", ok: "#9ccfd8", warn: "#f6c177", danger: "#eb6f92",
    ansi: ["#26233a", "#eb6f92", "#31748f", "#f6c177", "#9ccfd8", "#c4a7e7", "#ebbcba", "#e0def4", "#6e6a86", "#eb6f92", "#31748f", "#f6c177", "#9ccfd8", "#c4a7e7", "#ebbcba", "#e0def4"],
  },
  {
    id: "rose-pine-moon", name: "Rosé Pine Moon", appearance: "dark",
    bg: "#232136", sunken: "#1f1d2e", surface: "#2a273f", raised: "#393552",
    fg: "#e0def4", muted: "#908caa", faint: "#6e6a86", accent: "#c4a7e7", ok: "#9ccfd8", warn: "#f6c177", danger: "#eb6f92",
    ansi: ["#393552", "#eb6f92", "#3e8fb0", "#f6c177", "#9ccfd8", "#c4a7e7", "#ea9a97", "#e0def4", "#6e6a86", "#eb6f92", "#3e8fb0", "#f6c177", "#9ccfd8", "#c4a7e7", "#ea9a97", "#e0def4"],
  },
  {
    id: "rose-pine-dawn", name: "Rosé Pine Dawn", appearance: "light",
    bg: "#faf4ed", sunken: "#f2e9e1", surface: "#f4ede8", raised: "#fffaf3",
    fg: "#575279", muted: "#797593", faint: "#9893a5", accent: "#907aa9", ok: "#56949f", warn: "#ea9d34", danger: "#b4637a",
    ansi: ["#f2e9e1", "#b4637a", "#286983", "#ea9d34", "#56949f", "#907aa9", "#d7827e", "#575279", "#9893a5", "#b4637a", "#286983", "#ea9d34", "#56949f", "#907aa9", "#d7827e", "#575279"],
  },
  {
    id: "one-dark", name: "One Dark", appearance: "dark",
    bg: "#282c34", sunken: "#21252b", surface: "#2c313a", raised: "#353b45",
    fg: "#abb2bf", muted: "#9da5b4", faint: "#5c6370", accent: "#61afef", ok: "#98c379", warn: "#e5c07b", danger: "#e06c75",
    ansi: ["#3f4451", "#e06c75", "#98c379", "#e5c07b", "#61afef", "#c678dd", "#56b6c2", "#abb2bf", "#4f5666", "#e06c75", "#98c379", "#e5c07b", "#61afef", "#c678dd", "#56b6c2", "#ffffff"],
  },
  {
    id: "solarized-dark", name: "Solarized Dark", appearance: "dark",
    bg: "#002b36", sunken: "#00212b", surface: "#073642", raised: "#103f4c",
    fg: "#93a1a1", muted: "#839496", faint: "#586e75", accent: "#268bd2", ok: "#859900", warn: "#b58900", danger: "#dc322f",
    ansi: ["#073642", "#dc322f", "#859900", "#b58900", "#268bd2", "#d33682", "#2aa198", "#eee8d5", "#002b36", "#cb4b16", "#586e75", "#657b83", "#839496", "#6c71c4", "#93a1a1", "#fdf6e3"],
  },
  {
    id: "solarized-light", name: "Solarized Light", appearance: "light",
    bg: "#fdf6e3", sunken: "#eee8d5", surface: "#eee8d5", raised: "#fffbf0",
    fg: "#586e75", muted: "#657b83", faint: "#93a1a1", accent: "#268bd2", ok: "#859900", warn: "#b58900", danger: "#dc322f",
    ansi: ["#eee8d5", "#dc322f", "#859900", "#b58900", "#268bd2", "#d33682", "#2aa198", "#073642", "#fdf6e3", "#cb4b16", "#93a1a1", "#839496", "#657b83", "#6c71c4", "#586e75", "#002b36"],
  },
  {
    id: "kanagawa-wave", name: "Kanagawa Wave", appearance: "dark",
    bg: "#1f1f28", sunken: "#16161d", surface: "#2a2a37", raised: "#363646",
    fg: "#dcd7ba", muted: "#c8c093", faint: "#727169", accent: "#7e9cd8", ok: "#98bb6c", warn: "#e6c384", danger: "#c34043",
    ansi: ["#090618", "#c34043", "#76946a", "#c0a36e", "#7e9cd8", "#957fb8", "#6a9589", "#c8c093", "#727169", "#e82424", "#98bb6c", "#e6c384", "#7fb4ca", "#938aa9", "#7aa89f", "#dcd7ba"],
  },
];

export function themeById(id: string | null | undefined): UiTheme | null {
  if (!id || id === DEFAULT_THEME) return null;
  return THEMES.find((t) => t.id === id) ?? null;
}

/** The interface theme in effect for the current appearance, or null for the built-in palette. */
export function activeUiTheme(settings: GuiSettings, dark: boolean): UiTheme | null {
  return themeById(dark ? settings.darkTheme : settings.lightTheme);
}

/** The theme the terminal should draw with, or null for the built-in palette. */
export function activeTerminalTheme(settings: GuiSettings, dark: boolean): UiTheme | null {
  if (settings.terminalTheme === MATCH_INTERFACE) return activeUiTheme(settings, dark);
  return themeById(settings.terminalTheme);
}

const mix = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

/** CSS custom properties that override the built-in tokens for a theme. */
export function cssVarsFor(t: UiTheme): Record<string, string> {
  const dark = t.appearance === "dark";
  return {
    "--bg": t.bg,
    "--bg-sunken": t.sunken,
    "--surface": t.surface,
    "--surface-raised": t.raised,
    "--border": mix(t.fg, dark ? 10 : 12),
    "--border-strong": mix(t.fg, dark ? 18 : 22),
    "--fg": t.fg,
    "--fg-muted": t.muted,
    "--fg-faint": t.faint,
    "--accent": t.accent,
    "--accent-fg": dark ? t.bg : "#ffffff",
    "--accent-soft": mix(t.accent, 16),
    "--ok": t.ok,
    "--warn": t.warn,
    "--danger": t.danger,
    "--danger-soft": mix(t.danger, 16),
    "--hover": mix(t.fg, 6),
    "--active": mix(t.fg, 10),
    "--code-bg": t.sunken,
  };
}

export const THEME_VARS = Object.keys(cssVarsFor(THEMES[0]));
