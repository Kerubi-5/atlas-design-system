import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../src/accordion.js"
import { Avatar, AvatarFallback, AvatarImage } from "../src/avatar.js"

/** Avatars at each size; the fallback shows when the image is missing. */
export function AvatarStory() {
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/favicon.svg" alt="Atlas" />
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>GH</AvatarFallback>
      </Avatar>
    </div>
  )
}

/** Single-open FAQ list. */
export function AccordionStory() {
  return (
    <Accordion type="single" collapsible className="max-w-xl">
      <AccordionItem value="exports">
        <AccordionTrigger>When do exports run?</AccordionTrigger>
        <AccordionContent>
          Every night at 2am in the workspace timezone.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="formats">
        <AccordionTrigger>Which formats are supported?</AccordionTrigger>
        <AccordionContent>
          CSV and XLSX. PDF is on the roadmap.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="history">
        <AccordionTrigger>How long are files kept?</AccordionTrigger>
        <AccordionContent>Thirty days, then they are deleted.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
