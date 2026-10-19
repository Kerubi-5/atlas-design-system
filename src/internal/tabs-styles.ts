import { cva } from "class-variance-authority"

import {
  disabledState,
  focusRing,
  inlineIcon,
  selectedState,
} from "./styles.js"

/**
 * Tab row. `TabsList` and `TabsNav` pass `orientation`, which picks plain
 * size classes so a consumer `className` (`h-9`) replaces them. Called
 * without it (`auto`), the row reads the orientation from the `group/tabs`
 * root instead, as it always has for apps building their own list.
 */
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-max min-w-full items-stretch justify-start p-0 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
      orientation: {
        auto: 'group-data-[orientation="horizontal"]/tabs:h-7 group-data-[orientation="vertical"]/tabs:h-fit group-data-[orientation="vertical"]/tabs:flex-col',
        horizontal: "h-7",
        vertical: "h-fit flex-col",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "auto",
    },
  }
)

/**
 * Horizontal scroller around a tab row. `p-1` leaves room for the active
 * border and focus ring; the height is the `h-7` list plus that padding
 * (`h-9` = 28px + 8px) so the list fits the content box and the outer
 * row matches `Button` `size="sm"`. Putting padding on an overflow box
 * without this height makes `scrollHeight` taller than `clientHeight`
 * and a vertical scrollbar appears if `overflow-y` is not hidden. Line
 * variant adds `pb-2` for the underline (`h-10` = 28px + 4px + 8px). A
 * block, so it fills its parent without `w-full`. `theme.css` hides the
 * scrollbar and draws the edge fades.
 */
const tabsScrollerVariants = cva(
  "relative box-border min-w-0 max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain p-1",
  {
    variants: {
      variant: {
        default: "",
        line: "pb-2",
      },
      orientation: {
        horizontal: "",
        vertical: "",
      },
    },
    compoundVariants: [
      { variant: "default", orientation: "horizontal", className: "h-9" },
      { variant: "line", orientation: "horizontal", className: "h-10" },
    ],
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
)

const tabsTriggerVariants = cva([
  focusRing,
  disabledState,
  // flex-none + px-4: every trigger and TabsNav link keeps the same
  // horizontal padding. flex-1 used to grow short labels and make the
  // longest (e.g. Apple Reminders) look tighter. No last-child padding.
  'relative inline-flex h-full min-w-max flex-none items-center justify-center gap-2 border border-transparent px-4 py-1.5 text-xs font-semibold tracking-wider whitespace-nowrap text-foreground/60 uppercase transition-all group-data-[orientation="vertical"]/tabs:w-full group-data-[orientation="vertical"]/tabs:justify-start group-data-[orientation="vertical"]/tabs:px-4 group-data-[orientation="vertical"]/tabs:py-2 hover:text-foreground has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 dark:text-muted-foreground dark:hover:text-foreground',
  inlineIcon.default,
  'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state="active"]:border-transparent group-data-[variant=line]/tabs-list:data-[state="active"]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state="active"]:bg-transparent',
  selectedState.active,
  'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation="horizontal"]/tabs:after:inset-x-0 group-data-[orientation="horizontal"]/tabs:after:bottom-[-5px] group-data-[orientation="horizontal"]/tabs:after:h-0.5 group-data-[orientation="vertical"]/tabs:after:inset-y-0 group-data-[orientation="vertical"]/tabs:after:-right-1 group-data-[orientation="vertical"]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state="active"]:after:opacity-100',
])

export { tabsListVariants, tabsScrollerVariants, tabsTriggerVariants }
