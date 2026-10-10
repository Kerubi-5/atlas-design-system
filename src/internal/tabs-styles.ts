import { cva } from "class-variance-authority"

import { disabledState, focusRing, selectedState } from "./styles.js"

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-stretch justify-center p-0 text-muted-foreground group-data-[orientation="horizontal"]/tabs:h-11 group-data-[orientation="vertical"]/tabs:h-fit group-data-[orientation="vertical"]/tabs:flex-col',
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tabsTriggerVariants = cva([
  focusRing,
  disabledState,
  'relative inline-flex h-full min-w-0 flex-1 items-center justify-center gap-2 border border-transparent px-4 py-1.5 text-xs font-semibold tracking-wider whitespace-nowrap text-foreground/60 uppercase transition-all group-data-[orientation="vertical"]/tabs:w-full group-data-[orientation="vertical"]/tabs:justify-start group-data-[orientation="vertical"]/tabs:px-4 group-data-[orientation="vertical"]/tabs:py-2 hover:text-foreground has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-3.5',
  'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state="active"]:border-transparent group-data-[variant=line]/tabs-list:data-[state="active"]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state="active"]:bg-transparent',
  selectedState.active,
  'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation="horizontal"]/tabs:after:inset-x-0 group-data-[orientation="horizontal"]/tabs:after:bottom-[-5px] group-data-[orientation="horizontal"]/tabs:after:h-0.5 group-data-[orientation="vertical"]/tabs:after:inset-y-0 group-data-[orientation="vertical"]/tabs:after:-right-1 group-data-[orientation="vertical"]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state="active"]:after:opacity-100',
])

export { tabsListVariants, tabsTriggerVariants }
