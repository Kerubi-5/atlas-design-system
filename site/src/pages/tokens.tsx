import { useEffect, useState } from "react"

import {
  loadThemeTokens,
  spacingScale,
  typeSamples,
  type CssVar,
} from "../lib/tokens.js"

const tokens = loadThemeTokens()

function useComputedVars(names: string[]) {
  const [values, setValues] = useState<Record<string, string>>({})
  const key = names.join("\0")

  useEffect(() => {
    function read() {
      const style = getComputedStyle(document.documentElement)
      const next: Record<string, string> = {}
      for (const name of key.split("\0")) {
        if (!name) continue
        next[name] = style.getPropertyValue(name).trim()
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
  }, [key])

  return values
}

function TokenTable({ vars, swatch }: { vars: CssVar[]; swatch?: boolean }) {
  const names = vars.map((item) => item.name)
  const computed = useComputedVars(names)

  return (
    <div className="overflow-x-auto ring-1 ring-border">
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

export function TokensPage() {
  return (
    <div className="grid gap-12">
      <header className="grid max-w-2xl gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-wider uppercase">
          Theme tokens
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Parsed from <code className="bg-muted px-1">theme.css</code>. Swatches
          and computed values follow the active theme (press D or use the
          toggle).
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
          Raw <code className="bg-muted px-1">.dark</code> assignments. The live
          swatches above already switch with the theme.
        </p>
        <TokenTable vars={tokens.darkColors} />
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
        <TokenTable vars={tokens.spacing} />
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
                style={{ borderRadius: `var(${item.name})` }}
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
