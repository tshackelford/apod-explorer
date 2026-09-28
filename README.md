# APOD Explorer

A small Next.js app for browsing NASA's Astronomy Picture of the Day (APOD).

- **Home** shows the 9 most recent pictures in a 3×3 grid, a date picker for any day in the past year, and a "Recently viewed" list.
- **Detail** (`/apod/YYYY-MM-DD`) shows one picture or video with its credit and full explanation.
- **History** remembers which pictures you opened. Entries drop off automatically once their date is more than a year old, and a "Clear history" button removes them all.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Vitest.
**Runtime dependencies:** `next`, `react` and `react-dom`. There are no others.

---

## Quick start

```bash
npm ci
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server (this is how you see ISR working) |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |

### Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `NASA_API_KEY` | No | Sent as `api_key` if set. The current APOD service works without one. Read only on the server; it's never prefixed with `NEXT_PUBLIC_`, so it can't reach the browser bundle. |

---

## Project structure

```
app/                         Routes only: data loading, ISR config, metadata
  layout.tsx                 Fonts + site shell (skip link, header, <main>, footer)
  page.tsx                   Home (ISR, revalidates hourly)
  not-found.tsx              Site-wide 404
  error.tsx                  Shown only if NASA fails and there's no cached page
  apod/[date]/
    page.tsx                 Detail (ISR; latest 9 pre-built, others built on first request)
    not-found.tsx            Invalid, out-of-range or unpublished date

components/
  ui/                        Generic building blocks; know nothing about APOD
    Button.tsx               Primary / secondary buttons (+ buttonClasses for links)
    TextLink.tsx             Inline link style; `newTab` adds safe rel + SR hint
    CardGrid.tsx             Responsive <ul> grid (1 / 2 / 3 columns)
    StatusMessage.tsx        Full-page message for 404 and error screens
  layout/                    Site chrome and page-level wrappers
    SiteHeader.tsx, SiteFooter.tsx, SkipLink.tsx
    PageTransition.tsx       Directional slide between pages (React <ViewTransition>)
  apod/                      Displaying APOD entries
    ApodCard.tsx             Card used by both the latest grid and history
    ApodDetail.tsx           Expanded detail view
    ApodDetailSkeleton.tsx   Placeholder while an uncached date loads
    ApodMedia.tsx            Image or video in a fixed-height frame
    ImageLightbox.tsx        (client) Click-to-enlarge image using native <dialog>
    DatePicker.tsx           (client) Native date input limited to the 1-year window
    DayNav.tsx               Previous / next day links on the detail page (not prefetched)
  history/                   The viewing-history feature
    HistorySection.tsx       (client) Recently viewed cards + Clear history
    RecordVisit.tsx          (client) Adds the current page to history; renders nothing

lib/                         Framework-free logic; each module has a *.test.ts beside it
  apod/
    client.ts                Server-only NASA client (fetching, caching, API key)
    normalize.ts             Raw API response -> Apod; the trust boundary
    types.ts                 The Apod type
    fixtures/                Trimmed real API responses used by tests
  assets.ts                  Allowlist for NASA media URLs
  dates.ts                   Date window, validation and formatting (no date library)
  history.ts                 localStorage-backed store for viewing history
  html.ts                    Converts the API's HTML fields to plain text
```

### Where new code goes

- **A new page** gets a folder under `app/`. Route files stay thin: validate params, load data, compose components.
- **A new feature** (for example favourites, or search) gets its own folder under `components/`, like `history/`. If it has client state or logic, that goes in `lib/` with a test beside it.
- **Anything that displays APOD data** belongs in `components/apod/`.
- **A generic, reusable element** (a badge, a modal, an input) goes in `components/ui/`. Those components take props only; they never import from `lib/apod` or know about APOD.
- **Site chrome** (header, footer, navigation, page wrappers) goes in `components/layout/`.
- **Styles:** use `Button` / `TextLink` and the theme tokens in `app/globals.css` rather than new colour classes, so the brand stays consistent. `className` props on the `ui/` components are for layout (spacing, alignment), not colours.
- **Imports:** direct file imports (`@/components/ui/Button`), no `index.ts` barrel files, so every import points straight at its source.

Most of the UI is **server components**. Only a handful of small components run in the browser (the ones marked *(client)* above, plus the error boundary), because they need browser-only features: routing on submit, `localStorage`, click handlers, and a modal dialog. Everything else ships as HTML with no JavaScript of its own.

---

## Rendering strategy: why ISR

APOD content changes **once a day**, and a past day's entry **never changes**. Visitors always get a cached page and, at most, once an hour the next request triggers a rebuild in the background. Pages regenerate hourly, but `lib/apod/client.ts` caches past dates in the Next.js data cache for **a day**, so regenerating a page usually costs no NASA call at all. Today's entry uses a 1-hour cache, since it may not be published yet.

- **`/apod/[date]`**: `generateStaticParams` pre-builds the 9 latest dates at build time, so clicking a card is instant. Any other date in the window is built on its first request and then cached.

---

## The NASA API

Base URL: `https://science.nasa.gov/wp-json/wp/v2/apod-basic`

### Documented vs. actual behaviour

The service is a WordPress REST route. When I tested it, the **documented** query parameters `date`, `start_date`, `end_date` and `count` were **silently ignored**: every request returned the latest 25 entries. The route's own discovery document (`GET https://science.nasa.gov/wp-json/`) lists what it actually accepts:

| Route | Params | Used for |
| --- | --- | --- |
| `GET /apod-basic` | `per_page` (max 25), `page`, `date_from`, `date_to` (`YYMMDD`) | Home: `?per_page=9` |
| `GET /apod-basic/{YYMMDD}` | none | Detail: one date, e.g. `/apod-basic/260911`. Returns `404 apod_basic_not_found` if there's no entry. |
| `GET /apod-basic/{YYMMDD}/html` | none | Not used |

`lib/apod/client.ts` uses only the routes that behave predictably. If the documented params start working later, only that file changes.

### Things worth knowing about the response

- `url` is the **article permalink**, not the image. The image is `hdurl`, which can be 4000–8000px wide. The app never sends it to the browser directly; `next/image` serves resized renditions.
- `hdurl` carries the source image's size as `?w=&h=` params. The client reads them for the frame's aspect ratio (so images don't cause layout shift), then strips the query string so the image allowlist can require an exact, query-free URL.
- `explanation`, `credit` and `copyright` contain **HTML** (links, `<b>`, entities). See Security for how that's handled.
- For **videos**, `hdurl` is a still frame and the actual `.mp4` exists only inside `basic_html`. The client extracts that one `<source src>` and validates it against the asset allowlist.
- `basic_html` is roughly 8 KB per entry. It's dropped during normalization, so it never reaches the page payload.

