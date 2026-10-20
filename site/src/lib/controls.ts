/**
 * Control options for a prop whose union react-docgen cannot read, such as a
 * cva `VariantProps` type. Name every member of `T` once: a missing or extra
 * member fails the site typecheck, so the control follows the component.
 * Props typed as plain unions need no list; Storybook infers their options.
 */
export function controlOptions<T extends string>(
  members: Record<NoInfer<T>, true>
) {
  return Object.keys(members) as T[]
}
