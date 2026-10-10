import { addons } from "storybook/manager-api"
import { create } from "storybook/theming"

// Storybook renders brandTitle as HTML when there is no brandImage. Keeping
// the name as live text (next to the favicon mark) uses the sidebar font and
// stays selectable, which an image wordmark would not.
const brandTitle = `<span style="display:inline-flex;align-items:center;gap:8px;font-weight:700"><img src="./favicon.svg" alt="" width="22" height="22" style="display:block" />Atlas React Kit</span>`

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle,
    brandUrl: "/",
    brandTarget: "_self",
    colorPrimary: "#7c3aed",
    colorSecondary: "#7c3aed",
  }),
})
