// Stories that open something before they are checked. axe scans each one
// open (tests/a11y.test.mjs) and the screenshots capture it open
// (tests/visual/components.spec.ts). `shows` is the selector that must be
// visible once `open(page)` has run; both tests wait for it.
import { storyRoot } from "./browser.mjs"

const TOAST = "[data-sonner-toast]"

const clickFirst = (role) => (page) =>
  storyRoot(page).getByRole(role).first().click()

/** A story whose first button opens a dialog. */
const dialogStory = (id) => ({
  id,
  shows: "[role=dialog]",
  open: clickFirst("button"),
})

/** The story raises its toasts on mount; wait until `count` are in the DOM. */
const toasts =
  (count = 1) =>
  (page) =>
    page.waitForFunction(
      ({ selector, expected }) =>
        document.querySelectorAll(selector).length === expected,
      { selector: TOAST, expected: count }
    )

/** One story per toast chrome variant, and how many toasts it raises. */
const toastVariants = {
  plain: 1,
  success: 1,
  info: 1,
  warning: 1,
  error: 1,
  loading: 1,
  "with-description": 1,
  "with-action-and-cancel": 1,
  "long-text": 1,
  stacked: 3,
}

/** Ids of the toast variant stories (`feedback-toast--<variant>`). */
export const toastVariantIds = Object.keys(toastVariants).map(
  (name) => `feedback-toast--${name}`
)

/** Open `overlay`'s story content and wait until it shows. */
export async function openOverlay(page, overlay) {
  await overlay.open(page)
  await page
    .locator(overlay.shows)
    .first()
    .waitFor({ state: "visible", timeout: 10_000 })
}

export const OVERLAYS = [
  {
    id: "data-display-kanban--card-actions",
    shows: "[role=menu]",
    open: (page) =>
      page.getByRole("button", { name: "Card actions" }).first().click(),
  },
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
  dialogStory("forms-date-picker--playground"),
  {
    ...dialogStory("forms-date-time-picker--playground"),
    open: async (page) => {
      await clickFirst("button")(page)
      // The calendar loads on first open; wait for it, not the spinner.
      await page.getByRole("grid").waitFor()
    },
  },
  {
    id: "feedback-toast--playground",
    shows: TOAST,
    open: clickFirst("button"),
  },
  { id: "feedback-toast--types", shows: TOAST, open: toasts(5) },
  ...Object.entries(toastVariants).map(([name, count]) => ({
    id: `feedback-toast--${name}`,
    shows: TOAST,
    open: toasts(count),
  })),
  dialogStory("overlays-dialog--playground"),
  dialogStory("overlays-dialog--long-title"),
  dialogStory("overlays-popover--playground"),
  dialogStory("overlays-info-tip--playground"),
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
