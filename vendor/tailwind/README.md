# Local Tailwind build

`tailwind.css` is a static, compiled Tailwind CSS v4 build, generated so the
app no longer depends on the `cdn.tailwindcss.com` Play CDN script (which
prints console warnings, especially when opening the HTML files directly via
`file://`).

`input.css` is the source: it imports Tailwind, declares the `dark` variant
(class strategy), and defines the app's custom theme colors (`surface`,
`card`, `accent`, `muted` + their `-dark` variants) to match what used to be
passed via the inline `tailwind.config` object.

## Rebuilding

If you add new Tailwind utility classes to the HTML/JS files, or change the
theme colors, rebuild `tailwind.css`:

```bash
npx @tailwindcss/cli -i vendor/tailwind/input.css -o vendor/tailwind/tailwind.css --minify
```

(Or use the standalone `tailwindcss` CLI binary from
https://github.com/tailwindlabs/tailwindcss/releases if npm isn't available.)
