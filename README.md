# UPI Link

**Your UPI. One Link.**

UPI Link turns a UPI ID into a scannable payment QR code and a permanent,
shareable payment page. There is no account, no database, no payment
processing, and no stored payment data.

A payment page is reconstructed entirely from its URL:

```
https://upigenerator.netlify.app/pay/name%40okaxis
                          ↓
        /pay/name%40okaxis  →  name@okaxis  →  upi://pay?pa=name%40okaxis&cu=INR
                          ↓
              QR code rendered locally in the browser
```

The UPI ID in the path is the only state. Reopening the same URL — today,
tomorrow, or from a different browser — produces the same QR code.

---

## Features

- **UPI ID to QR in seconds** — enter a UPI ID, accept the disclaimer, and get
  a payment page.
- **Stateless payment links** — the UPI ID is encoded in the URL path and the
  QR code is rebuilt client-side. No database or backend storage.
- **No amount baked in** — the QR contains `cu=INR` and the payee address only.
  The payer enters the amount in their own UPI app.
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
| Hosting | Netlify with the native Next.js integration |
| Tests | `tsx` + Node assertions, plus headless Chrome verification |

No runtime backend, database, authentication, analytics, or advertising scripts
are used.

---

## Getting started

Requirements: **Node.js 20.9 or newer** (Node 22 is used on Netlify) and npm.

```bash
npm install
npm run dev
```

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
| `npm run verify` | Run the 24 deterministic unit checks |
| `npm run check` | Typecheck + lint + unit checks |

---

## Routes

| Route | Rendering | Description |
| --- | --- | --- |
| `/` | Static | Landing page and UPI link generator |
| `/pay/[upi]` | Dynamic (server-rendered) | Payment page reconstructed from the UPI ID |
| `/privacy` | Static | Privacy notice |
| `/disclaimer` | Static | Disclaimer and limitations |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | Generated | Crawler and app metadata |
| `/icon.svg`, `/opengraph-image`, `/twitter-image` | Generated | Favicon and social images |
| any unknown path | Dynamic | Custom 404 page |

`/pay/[upi]` is **not** statically exported. Direct visits and browser
refreshes are handled by Netlify's Next.js runtime.

---

## How the stateless link works

### 1. Validation

`lib/upi.ts` normalises invisible characters and surrounding whitespace, then
performs syntax checks only:

- exactly one `@`
- 1–64 characters before `@`
- 2–32 characters after `@`
- allowed character sets, with letters or digits at both ends
- no internal whitespace

A syntactically valid ID is **not** a verified ID. UPI Link cannot know whether
the handle exists, is active, or belongs to the intended recipient.

### 2. Encoding

The UPI ID is encoded exactly once as a URL path segment and exactly once
inside the UPI URI:

```ts
buildPaymentPath("name@okaxis") // "/pay/name%40okaxis"
buildUpiUri("name@okaxis")      // "upi://pay?pa=name%40okaxis&cu=INR"
```

### 3. Decoding

Next.js 15 supplies dynamic route params percent-encoded in this app's runtime,
so `readUpiRouteParam()` calls `decodeURIComponent` **once**, then validates.
Double-encoded input (`name%2540okaxis`) decodes to a literal `%40`, which fails
validation instead of being decoded a second time.

### 4. QR generation

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
upi-gener/
├── app/
│   ├── layout.tsx              # Metadata, theme bootstrap, header/footer shell
│   ├── page.tsx                # Landing page
│   ├── pay/[upi]/page.tsx      # Dynamic payment route + metadata
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
│   ├── hero-form.tsx           # UPI input, validation, disclaimer, navigation
│   ├── payment-view.tsx        # Payment page UI and actions
│   ├── qr-code.tsx             # Client-side QR renderer
│   ├── site-chrome.tsx         # Header and footer
│   ├── theme-toggle.tsx
│   ├── toast.tsx
│   └── logo.tsx
├── lib/
│   ├── upi.ts                  # Validation, URI/URL construction, route parsing
│   ├── device.ts               # Testable platform detection
│   ├── payment-apps.ts         # App definitions, Android/iOS launch URLs
│   ├── qr.ts                   # PNG data URL and download helper
│   ├── clipboard.ts
│   ├── site.ts                 # Site identity and canonical origin
│   ├── theme.ts
│   └── cn.ts
├── scripts/verify.ts           # 24 automated checks
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
   | Base directory | repository root, or `upi-gener` if the app is nested |
   | Build command | `npm run build` |
   | Publish directory | `.next` |
   | Node version | `22` (also pinned in `netlify.toml`) |

4. Trigger a deploy. No environment variables are required.

### Optional environment variable

```bash
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

Only needed for forks or preview deployments that should generate links for a
different origin. The default is `https://upigenerator.netlify.app`.

### Verify after deployment

- `https://upigenerator.netlify.app/` loads.
- `https://upigenerator.netlify.app/pay/name%40okaxis` loads **directly**.
- Refreshing that payment URL returns the same page (not a 404).
- An invalid payment URL and an unknown path both return the custom 404 page.
- The QR decodes to `upi://pay?pa=name%40okaxis&cu=INR`.

`netlify.toml` also sets security headers (`X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, and a restrictive `Permissions-Policy`).

---

## Testing performed

Automated:

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run verify` — **24/24** checks passed, covering validation, encoding,
  route decoding, URL construction, app launch URLs, and platform detection
- `npm run build` — production build succeeds

Headless Chrome checks against the production build:

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

- UPI Link never asks for a UPI PIN, OTP, password, card number, or bank
  credentials.
- The UPI ID travels in the URL path. It can appear in browser history,
  messaging apps, and hosting access logs — that is inherent to a stateless
  link. The UI warns users to share links only with the intended payer.
- Payment pages set `noindex, nofollow, nocache` and `/pay/` is disallowed in
  `robots.txt`.
- The only `localStorage` value is the theme preference (`upilink-theme`).
  UPI IDs and payment data are never stored there.
- The QR code is generated locally; the UPI URI is not sent to a server.
- No analytics, advertising pixels, or third-party tracking scripts are loaded.
- Security headers are applied by `netlify.toml`.

---

## Limitations

1. **Format validation only.** A valid-looking UPI ID may be inactive, belong to
   someone else, or be mistyped. The payer must verify the recipient inside
   their UPI app before paying.
2. **No payment processing.** UPI Link only prepares a UPI URI and QR code. It
   cannot confirm that a payment happened.
3. **App launch reliability is controlled by the device.** Installed-app
   detection is not exposed to websites. Buttons can fail silently or open a
   store page.
4. **iOS custom schemes may be blocked.** Some browsers and iOS versions prompt
   or refuse to open a scheme. Safari and the QR code are the reliable fallbacks.
5. **The URL is the state.** If a link is truncated or altered, the payment page
   cannot be reconstructed. There is no server-side record to recover it.
6. **UPI IDs in URLs are visible.** This is a deliberate trade-off for
   statelessness; do not use the service for IDs you consider secret.

---

## License

This project is provided as-is for personal and commercial use. UPI Link is an
independent utility and is not affiliated with NPCI, Google Pay, PhonePe, Paytm,
or any bank or payment provider.
