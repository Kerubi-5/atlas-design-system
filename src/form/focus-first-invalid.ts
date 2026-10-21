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
 * so it works before React has re-rendered. Fields are matched by the
 * `data-field-name` each `form/*` field puts on its control: `FormTextField`
 * and `FormMarkdownField` read `field.name`; the other fields take
 * `fieldName={field.name}`. The lookup stays inside the form with id
 * `formId`, so a second form with the same field names is never touched.
 * The form library needs no focus API of its own.
 *
 * ```tsx
 * const form = useForm({ onSubmitInvalid: focusFirstInvalid("order-form") })
 * <form id="order-form" onSubmit={...}>
 *   <FormSelectField fieldName={field.name} ... />
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
    for (const element of form.querySelectorAll<HTMLElement>(
      "[data-field-name]"
    )) {
      if (invalid.has(element.dataset.fieldName ?? "")) {
        element.focus()
        return
      }
    }
  }
}
