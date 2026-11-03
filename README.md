# UPI QR Generator

**Your UPI. One Link.**

UPI QR Generator turns a UPI ID into a scannable payment QR code and a permanent,
shareable payment page, with an optional payment amount. There is no account, no
database, no payment processing, and no stored payment data.

A payment page is reconstructed entirely from its URL:

```
https://upigenerator.netlify.app/pay/name%40okaxis?amount=500.00
                          ↓
  /pay/name%40okaxis + amount=500.00
                          ↓
  name@okaxis + 500.00 → upi://pay?pa=name%40okaxis&am=500.00&cu=INR
                          ↓
              QR code rendered locally in the browser
```

The UPI ID in the path and the optional `amount` query are the only state.
Reopening the same URL — today, tomorrow, or from a different browser — produces
the same QR code.

Source code: <https://github.com/BtwVansh/upi-qr-gen>

---

## Features

- **UPI ID to QR in seconds** — enter a UPI ID, optionally add an amount, accept
  the disclaimer, and get a payment page.
- **Optional payment amount** — enter a positive amount with up to two decimals
  to embed `am` in the UPI URI and display it on the payment page. Leave it
  blank for an open-amount QR.
- **Stateless payment links** — the UPI ID and optional amount are encoded in
  the URL, and the QR code is rebuilt client-side. No database or backend
  storage.
- **Cloudflare Turnstile CAPTCHA** — managed-mode verification is required
  before a payment link is created. Tokens are verified server-side with
  Cloudflare's Siteverify API and are rejected when invalid, expired or reused.
- **Editable amount on the payment page** — changing the amount regenerates the
  QR code and the shareable URL together.
- **Native app buttons** — Google Pay, PhonePe, and Paytm, with
  platform-appropriate launch URLs.
- **Works on desktop too** — the same page shows the QR and copy/download/share
  controls; app buttons are disabled with a clear explanation.
- **Downloadable PNG** — generated at 1024 × 1024 on demand, always dark on
  white for reliable scanning.
- **Copy and share** — copy the UPI ID or payment link, and use the native
  share sheet where the browser supports it.
- **Light and dark themes** — follows the system preference on first visit and
  remembers the visitor's choice.
- **Accessible and responsive** — keyboard-friendly controls, visible focus
  states, skip link, ARIA labels, and layouts tested from 390 px upward.
- **SEO and metadata** — Open Graph and Twitter images, sitemap, robots rules,
  manifest, and a custom 404 page. Payment pages are deliberately `noindex`.
- **Honest failure states** — the UI never claims an app is installed, never
  claims a payment succeeded, and always keeps the QR code available as a
  fallback.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15.5.28 (App Router) |
| UI | React 19.2.0, TypeScript 5.9.3 |
| Styling | Tailwind CSS 3.4.19 |
| Icons | lucide-react 1.66.0 |
| QR generation | qrcode 1.5.4 (client-side PNG data URLs) |
| CAPTCHA | Cloudflare Turnstile, managed mode, with server-side Siteverify |
| Hosting | Netlify with the native Next.js integration |
| Tests | `tsx` + Node assertions, plus headless Chrome verification |

No database, authentication, analytics, or advertising scripts are used.
CAPTCHA verification runs in a stateless server route and stores nothing.

---

## Getting started

Requirements: **Node.js 20.9 or newer** (Node 22 is used on Netlify) and npm.

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npm run dev
```

Add your Cloudflare Turnstile keys to `.env.local` before generating a link.
See [Cloudflare Turnstile setup](#cloudflare-turnstile-setup).

Open <http://localhost:3000>.

To run the production build locally:

```bash
npm run build
npm start
```

### Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run verify` | Run the 32 deterministic unit checks |
| `npm run check` | Typecheck + lint + unit checks |

---

## Cloudflare Turnstile setup

The generator uses Cloudflare Turnstile in **managed mode**. The widget is
rendered in the form, and the token is verified server-side before the API route
returns a payment URL. No token or verification result is stored.

### Environment variables

| Variable | Visibility | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Turnstile widget site key, embedded in the browser bundle |
| `TURNSTILE_SECRET_KEY` | **Server-only** | Used by `/api/turnstile/verify` to call Siteverify |

Never prefix the secret key with `NEXT_PUBLIC_`. Only the server route reads it.

### Create the widget

1. Open the Cloudflare dashboard → **Turnstile** → **Add widget**.
2. Choose **Managed** mode.
3. Add the hostnames that serve the app. For production, at minimum:
   - `upigenerator.netlify.app`
   - `localhost` if you want to test locally
   - any Netlify deploy-preview hostnames you use
4. Copy the **Site Key** and **Secret Key**.

### Configure Netlify

In **Site configuration → Environment variables**, add:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your site key>
TURNSTILE_SECRET_KEY=<your secret key>
```

Apply both to the deploy contexts you use (production, deploy previews, branch
deploys). `NEXT_PUBLIC_*` values are inlined at build time, so trigger a new
deploy after adding or changing the site key. The secret key is read at runtime
by the server route and is never sent to the browser.

### Local development

Create `.env.local` from `.env.example` and add both keys. Restart `npm run dev`
after changing environment variables.

Cloudflare publishes official always-pass test keys for local development:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Use real keys in production. The test keys are provided by Cloudflare and are
not a frontend-only bypass.

### Verification behaviour

- The server validates the UPI ID and amount first, then calls
  `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- The payment URL is only returned after `success: true`.
- Turnstile tokens are single-use. A reused token produces
  `timeout-or-duplicate`, which is shown as an expired/used error.
- The widget resets after a failed verification so the user can retry.
- If the secret key is missing, the API returns a configuration error and no
  payment link is created.

If you add a Content Security Policy later, allow
`https://challenges.cloudflare.com` for `script-src`, `frame-src`, and
`connect-src`.

---

## Routes

| Route | Rendering | Description |
| --- | --- | --- |
| `/` | Static | Landing page and UPI QR generator |
| `/pay/[upi]` | Dynamic (server-rendered) | Payment page reconstructed from the UPI ID and optional `amount` query |
| `/api/turnstile/verify` | Dynamic (server-only) | Verifies a Turnstile token with Siteverify and returns the payment URL only after success |
| `/privacy` | Static | Privacy notice |
| `/disclaimer` | Static | Disclaimer and limitations |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | Generated | Crawler and app metadata |
| `/icon.svg`, `/opengraph-image`, `/twitter-image` | Generated | Favicon and social images |
| any unknown path | Dynamic | Custom 404 page |

`/pay/[upi]` is **not** statically exported. Direct visits and browser
refreshes are handled by Netlify's Next.js runtime.

---

## How the stateless link works

### 1. CAPTCHA verification

The homepage form requires a Turnstile token. The browser sends the token, UPI
ID and optional amount to `/api/turnstile/verify`, which validates the payment
details and calls Cloudflare's Siteverify endpoint. Only after a successful
verification does the route return the relative payment URL. The secret key
stays on the server, and the token is single-use.

Direct visits to an existing `/pay/...` URL still work without a CAPTCHA. That
is required for the stateless architecture: a shared payment link must remain
reproducible without a database or an issuance record.

### 2. Validation

`lib/upi.ts` normalises invisible characters and surrounding whitespace, then
performs syntax checks only:

- exactly one `@`
- 1–64 characters before `@`
- 2–32 characters after `@`
- allowed character sets, with letters or digits at both ends
- no internal whitespace

A syntactically valid ID is **not** a verified ID. UPI QR Generator cannot know whether
the handle exists, is active, or belongs to the intended recipient.

### 3. Optional amount

`validateAmount()` accepts a positive number with at most two decimal places,
ignores a leading `₹` and surrounding whitespace, and canonicalises the value to
two decimals. Blank input is valid and means the payer chooses the amount.

- `500` → `500.00`
- `12.5` → `12.50`
- `0`, `-5`, `1.234`, `abc` → rejected
- repeated `?amount=` parameters → rejected

The amount is part of the URL query, so `/pay/ABCD%40OKAXIS?amount=500.00`
reconstructs the same QR code. Invalid or repeated amounts render the custom 404
page rather than silently choosing a value.

### 4. Encoding

The UPI ID is encoded exactly once as a URL path segment and exactly once
inside the UPI URI. The amount is included as `am` only when one is set:

```ts
buildPaymentHref("name@okaxis")          // "/pay/name%40okaxis"
buildPaymentHref("name@okaxis", "500.00") // "/pay/name%40okaxis?amount=500.00"
buildUpiUri("name@okaxis")               // "upi://pay?pa=name%40okaxis&cu=INR"
buildUpiUri("name@okaxis", "500.00")     // "upi://pay?pa=name%40okaxis&am=500.00&cu=INR"
```

### 5. Decoding

Next.js 15 supplies dynamic route params percent-encoded in this app's runtime,
so `readUpiRouteParam()` calls `decodeURIComponent` **once**, then validates.
Double-encoded input (`name%2540okaxis`) decodes to a literal `%40`, which fails
validation instead of being decoded a second time.

### 6. QR generation

`components/qr-code.tsx` calls `qrcode` in the browser and renders a PNG data
URL. The URI is never sent to a server, and no QR image is stored anywhere.

---

## Platform detection and app launching

Detection lives in `lib/device.ts` and is a pure function over browser signals:
user agent, `navigator.platform`, `navigator.maxTouchPoints`, and
`navigator.userAgentData.platform` when available. It recognises Android,
iPhone, iPad/iPadOS (including Safari's desktop-style user agent),
Windows, macOS, Linux, ChromeOS, and unknown platforms.

| Platform | Behaviour |
| --- | --- |
| Android | `intent://pay?...#Intent;scheme=upi;package=<package>;S.browser_fallback_url=<payment URL>;end` |
| iPhone / iPad | App-specific URL schemes: `gpay://upi/pay`, `phonepe://pay`, `paytmmp://pay` |
| Windows / macOS / Linux | App buttons disabled; QR and copy/download/share remain available |
| ChromeOS / unknown | App buttons disabled with an explanation |

Android packages:

- Google Pay — `com.google.android.apps.nbu.paisa.user`
- PhonePe — `com.phonepe.app`
- Paytm — `net.one97.paytm`

### Honest limits of app launching

Browsers cannot reliably tell whether an app is installed. A button can fail
silently, open the app store, or show an OS prompt. The UI therefore:

- says "Open in …" rather than "Pay with …"
- never confirms that an app opened
- shows a fallback notice after a launch attempt
- always keeps the QR code, copy, and download actions available

Android intents include a browser fallback URL. iOS may block a custom scheme or
show an alert when the app is absent; the page explains this and recommends
Safari, the QR code, or another UPI app.

---

## Project structure

```
realupi/
├── app/
│   ├── layout.tsx              # Metadata, theme bootstrap, header/footer shell
│   ├── page.tsx                # Landing page
│   ├── api/turnstile/verify/route.ts  # Server-side Siteverify check
│   ├── pay/[upi]/page.tsx      # Dynamic payment route, amount parsing, metadata
│   ├── privacy/page.tsx
│   ├── disclaimer/page.tsx
│   ├── not-found.tsx           # Custom 404
│   ├── globals.css             # Design tokens, themes, component styles
│   ├── icon.svg
│   ├── manifest.ts
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── opengraph-image.tsx
│   └── twitter-image.tsx
├── components/
│   ├── hero-form.tsx           # UPI and amount inputs, CAPTCHA, validation
│   ├── turnstile.tsx           # Managed-mode Turnstile widget
│   ├── payment-view.tsx        # Payment page UI, amount editor, actions
│   ├── qr-code.tsx             # Client-side QR renderer
│   ├── site-chrome.tsx         # Header and footer
│   ├── theme-toggle.tsx
│   ├── toast.tsx
│   └── logo.tsx
├── lib/
│   ├── upi.ts                  # Validation, amount handling, URI/URL construction
│   ├── turnstile.ts            # Public widget config and browser types
│   ├── device.ts               # Testable platform detection
│   ├── payment-apps.ts         # App definitions, Android/iOS launch URLs
│   ├── qr.ts                   # PNG data URL and download helper
│   ├── clipboard.ts
│   ├── site.ts                 # Site identity, canonical origin, GitHub URL
│   ├── theme.ts
│   └── cn.ts
├── scripts/verify.ts           # 32 automated checks
├── netlify.toml
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
└── .env.example
```

---

## Netlify deployment

The site is designed for Netlify's **native Next.js integration**. Do not add
`@netlify/plugin-nextjs` manually, do not use `output: "export"`, and do not set
a `basePath`.

### One-time setup (already-configured repository)

1. Push this project to the GitHub repository connected to the Netlify site.
2. Netlify detects Next.js and installs its adapter automatically.
3. Confirm these settings in **Site configuration → Build & deploy**:

   | Setting | Value |
   | --- | --- |
   | Base directory | repository root (the app lives at the repository root) |
   | Build command | `npm run build` |
   | Publish directory | `.next` |
   | Node version | `22` (also pinned in `netlify.toml`) |

4. Add the two Turnstile environment variables described in
   [Cloudflare Turnstile setup](#cloudflare-turnstile-setup). They are required;
   the generator is blocked without them.
5. Trigger a deploy. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is inlined at build time,
   so redeploy whenever it changes.

### Optional environment variable

```bash
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

Only needed for forks or preview deployments that should generate links for a
different origin. The default is `https://upigenerator.netlify.app`.

### Verify after deployment

- `https://upigenerator.netlify.app/` loads.
- `https://upigenerator.netlify.app/pay/name%40okaxis` loads **directly**.
- `https://upigenerator.netlify.app/pay/name%40okaxis?amount=500.00` loads and
  shows ₹500.00.
- Refreshing that payment URL returns the same page (not a 404).
- An invalid payment URL, an invalid amount, and an unknown path all return the
  custom 404 page.
- Submitting the generator without completing Turnstile shows a verification
  error and creates no payment page.
- With the production keys configured, the Turnstile widget completes on
  desktop, Android and iOS, and the verified redirect reaches the payment page.
- A reused or expired token is rejected and the widget resets for a retry.
- The QR decodes to `upi://pay?pa=name%40okaxis&cu=INR` without an amount or
  `upi://pay?pa=name%40okaxis&am=500.00&cu=INR` with an amount.

`netlify.toml` also sets security headers (`X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, and a restrictive `Permissions-Policy`).

---

## Testing performed

Automated after the CAPTCHA integration:

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run verify` — **32/32** checks passed, covering validation, amount
  handling, encoding, route decoding, URL construction, app launch URLs, and
  platform detection

Turnstile integration check using Cloudflare's official always-pass test keys:

- The managed-mode widget rendered in the form and reported success.
- Submitting the form reached `/api/turnstile/verify`, which returned
  `/pay/captcha.test%40okaxis?amount=123.45`, and the browser navigated to that
  payment page with the correct amount.
- A missing token returned HTTP 400 and no payment link.
- An invalid amount returned HTTP 400 and no payment link.
- The always-pass test secret cannot exercise rejection paths such as
  `timeout-or-duplicate`; those are enforced by Cloudflare Siteverify and are
  mapped to a retryable error in the route.

The production build and headless Chrome checks below were completed before the
amount, branding and CAPTCHA updates. Re-run `npm run build` and repeat the
browser checks with production Turnstile keys before deploying this version.

Baseline browser checks:

- QR renders and decodes to `upi://pay?pa=name%40okaxis&cu=INR`
- The same URL produces an identical QR after a hard reload and in a fresh tab
- Android user agent receives three package-targeted `intent://` links
- iPhone/iPad user agents receive the three correct iOS schemes
- Desktop user agents receive disabled app buttons and the desktop notice
- Copy actions, PNG download, toast messages, and form validation behave correctly
- Theme toggle works, persists across reloads, and both themes were inspected
- No horizontal overflow at 390 px or 1024 px after the layout fix
- Custom 404 and invalid payment routes render correctly
- Direct, encoded, and raw payment URLs return HTTP 200; invalid routes return 404
- Production dependencies: `npm audit --omit=dev` reports 0 vulnerabilities

Lighthouse (headless Chrome, mobile defaults):

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 100 |
| `/pay/name%40okaxis` | 99 | 100 | 100 | 58* |

\* The payment page's SEO score is intentionally low because the page is marked
`noindex, nofollow` to keep UPI IDs out of search engines. This does not affect
real users or the landing page.

### Not tested here

- **Real Android and iPhone hardware.** App launches and the native share sheet
  were verified by inspecting generated URLs, not by opening a real app.
- **Actual UPI payments.** The project does not process payments, so no payment
  flow can be completed or confirmed.
- **Every UPI app version.** Custom schemes and intent handling are controlled
  by the apps and mobile OS and can change without notice.

The 14 moderate `npm audit` advisories in the full report come from ESLint's
development-only tooling and are not shipped to production.

---

## Privacy and security notes

- UPI QR Generator never asks for a UPI PIN, OTP, password, card number, or bank
  credentials.
- The UPI ID and optional amount travel in the URL. They can appear in browser
  history, messaging apps, and hosting access logs — that is inherent to a
  stateless link. The UI warns users to share links only with the intended payer.
- Payment pages set `noindex, nofollow, nocache` and `/pay/` is disallowed in
  `robots.txt`.
- The only `localStorage` value is the theme preference (`upiqr-theme`).
  UPI IDs and payment data are never stored there.
- The QR code is generated locally; the UPI URI is not sent to a server.
- The Turnstile token, UPI ID and optional amount are sent to this site's
  verification route. The token is checked with Cloudflare and is never stored.
- CAPTCHA verification is the only third-party script. No analytics, advertising
  pixels, or cross-site tracking scripts are loaded.
- Security headers are applied by `netlify.toml`.

---

## Limitations

1. **Format validation only.** A valid-looking UPI ID may be inactive, belong to
   someone else, or be mistyped. The payer must verify the recipient inside
   their UPI app before paying.
2. **No payment processing.** UPI QR Generator only prepares a UPI URI and QR code. It
   cannot confirm that a payment happened.
3. **App launch reliability is controlled by the device.** Installed-app
   detection is not exposed to websites. Buttons can fail silently or open a
   store page.
4. **iOS custom schemes may be blocked.** Some browsers and iOS versions prompt
   or refuse to open a scheme. Safari and the QR code are the reliable fallbacks.
5. **The URL is the state.** If a link is truncated or altered, the payment page
   cannot be reconstructed. Changing or removing `?amount=` changes the QR code.
   There is no server-side record to recover the original.
6. **UPI IDs and amounts in URLs are visible.** This is a deliberate trade-off
   for statelessness; do not use the service for IDs or amounts you consider
   secret.
7. **CAPTCHA requires Cloudflare.** If Turnstile is misconfigured or unavailable,
   the generator cannot create new payment links. Existing `/pay/...` links
   remain usable because they are reconstructed directly from the URL.

---

## License

This project is provided as-is for personal and commercial use. UPI QR Generator is an
independent utility and is not affiliated with NPCI, Google Pay, PhonePe, Paytm,
or any bank or payment provider.
