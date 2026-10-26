/**
 * Storybook sidebar muted text. The default light hint (#8d9399 on #ecf2f9)
 * is 2.75:1. polished cannot parse oklch, so these stay sRGB hex and are
 * tuned for 4.5:1 (WCAG 1.4.3) on Storybook's light and dark chrome.
 */
export const MANAGER_MUTED = {
  light: "#5c5c5c",
  dark: "#c8c8c8",
} as const

/** Backgrounds the shortcut hint sits on in each Storybook UI theme. */
export const MANAGER_MUTED_ON = {
  light: "#ecf2f9",
  dark: "#0a0a0a",
} as const
