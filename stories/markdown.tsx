import { FormMarkdownField } from "../src/form/markdown-field.js"
import { Markdown } from "../src/markdown.js"

import { useDemoField } from "./fields.js"

const SAMPLE = `## Notes

Use **bold** text and a [safe link](https://example.com).

- First item
- Second item

| Range | Label |
| --- | --- |
| 0–2 | Low |
| 2+ | High |
`

/** Sanitized GFM with token styles, not a typography plugin. */
export function MarkdownStory() {
  return <Markdown className="max-w-lg" content={SAMPLE} />
}

/** Write / preview markdown field. */
export function FormMarkdownFieldStory() {
  const notes = useDemoField("notes", SAMPLE)
  return (
    <div className="max-w-lg">
      <FormMarkdownField field={notes} label="Notes" />
    </div>
  )
}
