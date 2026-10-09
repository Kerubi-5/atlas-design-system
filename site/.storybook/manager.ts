import { addons } from "storybook/manager-api"
import { create } from "storybook/theming"

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Atlas React Kit",
    brandUrl: "/",
    brandTarget: "_self",
    colorPrimary: "#7c3aed",
    colorSecondary: "#7c3aed",
  }),
})
