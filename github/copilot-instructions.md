# Copilot Instructions

# General
- Before writing code or making changes, ask clarifying questions if the request is ambiguous or underspecified.

# TypeScript
- Use TypeScript strict mode
- Prefer `const` over `let`
- Add `suppressHydrationWarning` to Input and Button (submit) components in auth forms that could be polluted by password managers

# /frontend
- base branding and styles follow and build upon the conventions in app/(marketing) and app/register
- signin (/login) and register (/register) pages must both include a way to navigate back to the marketing home page (/) — the Logo is wrapped in `<Link href="/">` and an explicit "← Back to home" text link appears below the footer copyright
- interactive cards that navigate to another route should be implemented as a Next.js `<Link>` (not a plain `<div>` with a nested `<a>`); convert any inner anchor to a `<span>` to avoid nested-anchor violations
