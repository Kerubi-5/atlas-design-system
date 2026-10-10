import { CircleAlertIcon, CircleCheckIcon, InfoIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "../src/alert.js"
import { Button } from "../src/button.js"
import { Progress } from "../src/progress.js"
import { Spinner } from "../src/spinner.js"

/** Inline alerts in each tone; body text stays muted for contrast. */
export function AlertStory() {
  return (
    <div className="grid max-w-xl gap-3">
      <Alert>
        <InfoIcon />
        <AlertTitle>Exports run nightly</AlertTitle>
        <AlertDescription>
          Files land in the shared drive by 6am local time.
        </AlertDescription>
      </Alert>
      <Alert variant="success">
        <CircleCheckIcon />
        <AlertTitle>Billing updated</AlertTitle>
        <AlertDescription>
          Your next invoice uses the new card.
        </AlertDescription>
      </Alert>
      <Alert variant="warning">
        <CircleAlertIcon />
        <AlertTitle>Trial ends in 3 days</AlertTitle>
        <AlertDescription>
          Add a payment method to keep access.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>Could not save</AlertTitle>
        <AlertDescription>
          The server did not respond. Your changes are still here; try again.
        </AlertDescription>
      </Alert>
    </div>
  )
}

/** Labelled progress bar for a determinate job. */
export function ProgressStory() {
  return (
    <div className="grid max-w-sm gap-2">
      <div className="flex justify-between text-sm">
        <span id="upload-label">Uploading orders.csv</span>
        <span className="text-muted-foreground tabular-nums">64%</span>
      </div>
      <Progress value={64} aria-labelledby="upload-label" />
    </div>
  )
}

/** Spinner alone and inside a pending button. */
export function SpinnerStory() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Spinner />
      <Button type="button" disabled>
        <Spinner aria-label="Saving" data-icon="inline-start" />
        Saving
      </Button>
    </div>
  )
}
