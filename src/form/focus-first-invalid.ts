/**
 * The part of a form library's invalid-submit event this helper reads: the
 * form state's per-field meta, keyed by field name (TanStack Form's
 * `onSubmitInvalid` passes `{ formApi }` with this shape).
 */
export type InvalidSubmitEvent = {
  formApi: {
    state: {
      fieldMeta: Partial<Record<string, { errors: readonly unknown[] }>>
    }
  }
}

/**
 * Invalid-submit handler that focuses the first field, in page order, whose
 * meta has errors. It reads the form state, not the rendered `aria-invalid`,
 * so it works before React has re-rendered. Fields are matched by control
 * id, so give each `form/*` field `id={field.name}` (`FormTextField`
 * defaults to it). The form library needs no focus API of its own.
 *
 * ```tsx
 * const form = useForm({ onSubmitInvalid: focusFirstInvalid("order-form") })
 * <form id="order-form" onSubmit={...}>
 *   <FormSelectField id={field.name} ... />
 * ```
 */
export function focusFirstInvalid(formId: string) {
  return ({ formApi }: InvalidSubmitEvent) => {
    const form = document.getElementById(formId)
    if (!(form instanceof HTMLFormElement)) return
    const invalid = new Set(
      Object.entries(formApi.state.fieldMeta)
        .filter(([, meta]) => meta?.errors.length)
        .map(([name]) => name)
    )
    for (const element of form.elements) {
      if (element instanceof HTMLElement && invalid.has(element.id)) {
        element.focus()
        return
      }
    }
  }
}
