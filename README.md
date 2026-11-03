# Hermes Task Board

A small, dependency-free browser task board for classroom demonstrations of test-first changes and reviewable pull requests. Plain HTML, CSS, and ES modules; no build step, accounts, credentials, external services, or downloads.

## Run locally

Requires Node.js 22 or newer. No installation step is needed.

```sh
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173`. Stop with Ctrl+C. Alternatively, use `npm start` if npm is available. The development server binds only to the loopback interface and serves an explicit list of UI assets.

## Test

```sh
node --test tests/*.test.mjs
```

Or `npm test`. Tests use Node's built-in runner and no dependencies. They cover task state, immutable updates, filters, same-case search, counts, UI event handlers through a minimal DOM adapter, HTML control contracts, and a real local HTTP server. The DOM adapter is not a browser: visual layout and end-to-end assistive-technology behavior require manual checks.

## Try it

1. Add `Read a chapter` and `Write notes`.
2. Toggle a checkbox; inspect total, active, completed, and shown counts.
3. Choose All, Active, or Completed. Search composes with the selected filter.
4. Search `Read` (matches), then `read` (does not match yet).
5. Tab through the native form, search, filter buttons, and checkboxes; use Enter or Space as appropriate.

Task titles are inserted with `textContent`, not HTML parsing. There are no external assets or application network requests. The only HTTP activity needed is loading this local page and its modules.

## Intentional teaching limitations — not production ready

- **Seeded bug: search is case-sensitive.** `Read` matches `Read a chapter`, but `read` does not. Surrounding query whitespace is already trimmed. A separate presentation regression test can be copied into `tests/regression.test.mjs`; it should fail until search normalizes both titles and the query while preserving filters and source titles. This expected regression is intentionally not part of the passing baseline suite.
- Empty or whitespace-only titles are currently accepted. Empty-task validation is the separate enhancement scenario; it is not implemented in this baseline.
- Tasks exist only in memory and reset on page refresh. No persistence, editing, deletion, synchronization, or authentication is provided.
- Accessibility features include associated labels, native controls, focus outlines, and a live count status. This is not a claim of a complete accessibility audit.

Scenario instructions, regression seed, metadata, and captured test logs are maintained outside this repository by the presentation workspace. No failing regression is shipped inside the baseline test directory.

## AI-assisted development disclosure

This demonstration was created with AI assistance. Its purpose is to make small changes, tests, limitations, and human review visible. Generated code still requires review and testing; passing smoke tests do not establish production readiness.

## License

MIT; see LICENSE.
