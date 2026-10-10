import { useEffect, useRef, useState } from "react"

import {
  loadThemeTokens,
  spacingScale,
  typeSamples,
  type CssVar,
} from "./lib/tokens.js"

const tokens = loadThemeTokens()

/**
 * How the Computed column is read from a hidden probe element:
 * - `theme`: custom property under the active theme (toolbar).
 * - `dark`: custom property under `.dark`, whatever the toolbar says.
 * - `radius`: the raw value applied as a border radius. Radius scale tokens
 *   live in `@theme inline`, so Tailwind inlines them and never emits them
 *   as custom properties to read back.
 */
type Probe = "theme" | "dark" | "radius"

function useComputedValues(vars: CssVar[], probe: Probe) {
  const probeRef = useRef<HTMLSpanElement>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const key = vars.map((item) => `${item.name}:${item.value}`).join("\0")

  useEffect(() => {
    const target = probeRef.current
    if (!target) return

    const read = () => {
      const next: Record<string, string> = {}
      for (const item of vars) {
        if (probe === "radius") {
          target.style.borderTopLeftRadius = item.value
          next[item.name] = getComputedStyle(target).borderTopLeftRadius
        } else {
          next[item.name] = getComputedStyle(target)
            .getPropertyValue(item.name)
            .trim()
        }
      }
      setValues(next)
    }

    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
    // `key` stands in for `vars`, which is rebuilt each render.
  }, [key, probe])

  return { probeRef, values }
}

function TokenTable({
  vars,
  swatch,
  probe = "theme",
}: {
  vars: CssVar[]
  swatch?: boolean
  probe?: Probe
}) {
  const { probeRef, values: computed } = useComputedValues(vars, probe)

  return (
    <div className="overflow-x-auto ring-1 ring-border">
      <span
        ref={probeRef}
        aria-hidden="true"
        hidden
        className={probe === "dark" ? "dark" : undefined}
      />
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs font-semibold tracking-wider uppercase">
          <tr>
            {swatch ? <th className="w-16 p-3">Swatch</th> : null}
            <th className="p-3">Token</th>
            <th className="p-3">theme.css</th>
            <th className="p-3">Computed</th>
          </tr>
        </thead>
        <tbody>
          {vars.map((item) => (
            <tr key={item.name} className="border-t border-border">
              {swatch ? (
                <td className="p-3">
                  <span
                    className="block size-8 ring-1 ring-border"
                    style={{ background: `var(${item.name})` }}
                  />
                </td>
              ) : null}
              <td className="p-3 font-mono text-xs">{item.name}</td>
              <td className="p-3 font-mono text-xs text-muted-foreground">
                {item.value}
              </td>
              <td className="p-3 font-mono text-xs text-muted-foreground">
                {computed[item.name] || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Live token reference parsed from `theme.css`. Swatches follow the Storybook
 * theme toolbar so light and dark values stay in sync with consuming apps.
 */
export function TokensPage() {
  return (
    <div className="grid gap-12">
      <header className="grid max-w-2xl gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-wider uppercase">
          Theme tokens
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Parsed from <code className="bg-muted px-1">theme.css</code>. Swatches
          and computed values follow the active theme (use the toolbar).
        </p>
      </header>

      <section className="grid gap-4">
        <h2 className="font-heading text-base font-semibold tracking-wider uppercase">
          Color
        </h2>
        <TokenTable vars={tokens.colors} swatch />
      </section>

      <section className="grid gap-4">
        <h2 className="font-heading text-base font-semibold tracking-wider uppercase">
          Dark color values
        </h2>
        <p className="text-sm text-muted-foreground">
          Raw <code className="bg-muted px-1">.dark</code> assignments, computed
          under <code className="bg-muted px-1">.dark</code> whatever the
          toolbar theme. The live swatches above already switch with the theme.
        </p>
        <TokenTable vars={tokens.darkColors} probe="dark" />
      </section>

      <section className="grid gap-4">
        <h2 className="font-heading text-base font-semibold tracking-wider uppercase">
          Type
        </h2>
        <p className="text-sm text-muted-foreground">
          <code className="bg-muted px-1">font-heading</code> uses the
          configured sans font. IBM Plex Sans is supplied by this site.
        </p>
        {tokens.type.length > 0 ? <TokenTable vars={tokens.type} /> : null}
        <div className="grid gap-4">
          {typeSamples.map((sample) => (
            <div
              key={sample.id}
              className="grid gap-1 border-b border-border pb-4"
            >
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {sample.label}
              </p>
              <p className={sample.className}>{sample.sample}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="font-heading text-base font-semibold tracking-wider uppercase">
          Spacing
        </h2>
        <p className="text-sm text-muted-foreground">
          Radius tokens from the theme, plus the default Tailwind spacing scale
          the kit uses for control height and padding (
          <code className="bg-muted px-1">h-10</code>,{" "}
          <code className="bg-muted px-1">px-3</code>, card{" "}
          <code className="bg-muted px-1">--card-p</code>).
        </p>
        <TokenTable vars={tokens.spacing} probe="radius" />
        <div className="flex flex-wrap items-end gap-4">
          {spacingScale.map((step) => (
            <div key={step} className="grid justify-items-center gap-2">
              <div
                className="bg-primary"
                style={{
                  width: `calc(var(--spacing) * ${step})`,
                  height: `calc(var(--spacing) * ${step})`,
                }}
              />
              <span className="font-mono text-[0.65rem] text-muted-foreground">
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-6">
          {tokens.spacing.map((item) => (
            <div key={item.name} className="grid justify-items-center gap-2">
              <div
                className="size-16 bg-selected ring-1 ring-border"
                style={{ borderRadius: item.value }}
              />
              <span className="font-mono text-[0.65rem] text-muted-foreground">
                {item.name.replace("--", "")}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
