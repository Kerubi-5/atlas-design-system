/** WCAG relative luminance of an RGB color with channels from 0 to 255. */
function luminance(rgb) {
  return rgb
    .map((value) => {
      const c = value / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
}

/** WCAG contrast ratio between two rendered RGB colors. */
export function contrastRatio(first, second) {
  const [hi, lo] = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}
