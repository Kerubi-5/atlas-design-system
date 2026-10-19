// Stories that open something before they are checked. axe scans each one
// open (tests/a11y.test.mjs) and the screenshots capture it open
// (tests/visual/components.spec.ts). `shows` is the selector that must be
// visible once `open(page)` has run; both tests wait for it.
import { storyRoot } from "./browser.mjs"

const clickFirst = (role) => (page) =>
  storyRoot(page).getByRole(role).first().click()

/** The story raises its toasts on mount; wait until `count` are in the DOM. */
const toasts =
  (count = 1) =>
  (page) =>
    page.waitForFunction(
      (expected) =>
        document.querySelectorAll("[data-sonner-toast]").length === expected,
      count
    )

export const OVERLAYS = [
  {
    id: "actions-dropdown-menu--row-actions",
    shows: "[role=menu]",
    open: (page) => page.getByRole("button", { name: "Actions" }).click(),
  },
  {
    id: "forms-select--playground",
    shows: "[role=listbox]",
    open: clickFirst("combobox"),
  },
  {
    id: "forms-combobox--playground",
    shows: "[role=listbox]",
    open: clickFirst("combobox"),
  },
  {
    id: "forms-combobox--creatable",
    shows: "[role=listbox]",
    open: async (page) => {
      await clickFirst("combobox")(page)
      await page.getByPlaceholder("Search or type a 3-letter code").fill("PHP")
      await page.getByRole("option", { name: 'Create "PHP"' }).waitFor()
    },
  },
  {
    id: "forms-date-picker--playground",
    shows: "[role=dialog]",
    open: clickFirst("button"),
  },
  {
    id: "forms-date-time-picker--playground",
    shows: "[role=dialog]",
    open: async (page) => {
      await clickFirst("button")(page)
      // The calendar loads on first open; wait for it, not the spinner.
      await page.getByRole("grid").waitFor()
    },
  },
  {
    id: "feedback-toast--playground",
    shows: "[data-sonner-toast]",
    open: clickFirst("button"),
  },
  {
    id: "feedback-toast--types",
    shows: "[data-sonner-toast]",
    open: toasts(5),
  },
  // One story per toast chrome variant.
  { id: "feedback-toast--plain", shows: "[data-sonner-toast]", open: toasts() },
  {
    id: "feedback-toast--success",
    shows: "[data-sonner-toast]",
    open: toasts(),
  },
  { id: "feedback-toast--info", shows: "[data-sonner-toast]", open: toasts() },
  {
    id: "feedback-toast--warning",
    shows: "[data-sonner-toast]",
    open: toasts(),
  },
  { id: "feedback-toast--error", shows: "[data-sonner-toast]", open: toasts() },
  {
    id: "feedback-toast--loading",
    shows: "[data-sonner-toast]",
    open: toasts(),
  },
  {
    id: "feedback-toast--with-description",
    shows: "[data-sonner-toast]",
    open: toasts(),
  },
  {
    id: "feedback-toast--with-action-and-cancel",
    shows: "[data-sonner-toast]",
    open: toasts(),
  },
  {
    id: "feedback-toast--long-text",
    shows: "[data-sonner-toast]",
    open: toasts(),
  },
  {
    id: "feedback-toast--stacked",
    shows: "[data-sonner-toast]",
    open: toasts(3),
  },
  {
    id: "overlays-dialog--playground",
    shows: "[role=dialog]",
    open: clickFirst("button"),
  },
  {
    id: "overlays-dialog--long-title",
    shows: "[role=dialog]",
    open: clickFirst("button"),
  },
  {
    id: "overlays-popover--playground",
    shows: "[role=dialog]",
    open: clickFirst("button"),
  },
  {
    id: "overlays-info-tip--playground",
    shows: "[role=dialog]",
    open: clickFirst("button"),
  },
  {
    id: "overlays-tooltip--playground",
    shows: "[role=tooltip]",
    open: (page) => storyRoot(page).getByRole("button").first().focus(),
  },
  {
    id: "layout-accordion--faq",
    shows: "[data-slot=accordion-content][data-state=open]",
    open: (page) =>
      page.getByRole("button", { name: "When do exports run?" }).click(),
  },
]
