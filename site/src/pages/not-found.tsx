import { Button } from "../../../src/button.js"
import { EmptyPanel } from "../../../src/empty-panel.js"

import { InternalLink } from "../components/internal-link.js"

export function NotFoundPage() {
  return (
    <EmptyPanel size="lg">
      <div className="grid justify-items-center gap-4">
        <p>That page is not part of the Atlas playground.</p>
        <Button asChild>
          <InternalLink href="/">Back home</InternalLink>
        </Button>
      </div>
    </EmptyPanel>
  )
}
