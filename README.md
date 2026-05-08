# esaLab Portfolio — v2.0

Geocomputing portfolio for **Akpakli Edudzi** — spatial data analysis, GIS, Remote Sensing.

---

## Project structure

```
esalab/
├── index.html              # Home (globe hero + intro)
├── about.html              # Background, values, education
├── services.html           # Service offerings
├── projects.html           # Portfolio grid
├── contact.html            # Form + map
│
├── css/
│   └── main.css            # ← Single stylesheet for the entire site
│
├── js/
│   ├── site.js             # ← Shared vanilla JS (no jQuery): scroll-reveal,
│   │                       #   welcome rotator, active nav, copyright year
│   └── globe.bundle.js     # ← Built by webpack from src/globe.js (git-ignored output)
│
├── src/
│   └── globe.js            # ← Three.js globe source (webpack entry)
│
├── fonts/                  # Self-hosted Montserrat
├── img/                    # Globe textures (nasa_night_lights.jpg, earth-topology.png)
├── assets/                 # Favicons, site.webmanifest
├── services/               # Service sub-pages + images
├── projects/               # Project docs, images, videos
└── maps/                   # Leaflet map embeds
```

---

## Dependencies

| What | How | Why |
|------|-----|-----|
| Bootstrap 5 | CDN `<link>` | No local copy, no Sass duplication |
| Phosphor Icons | CDN `<link>` | Replaces 1.1 MB FontAwesome JS bundle |
| Three.js + three-globe | npm → webpack | Globe feature only |
| jQuery | **removed** | Was only used for class toggling and scroll events |
| file-loader | **removed** | Webpack 5 native asset modules used instead |
| sass_style.css (compiled Bootstrap) | **removed** | Was a duplicate 472 KB file |

---

## Getting started

```bash
npm install
npm run dev        # watch mode + webpack-dev-server on :3000
npm run build      # production bundle → js/globe.bundle.js
npm run serve      # static file server (no webpack, for quick local preview)
```

---

## Adding a new project

1. Add your image to `projects/images/`.
2. Copy any one of the existing `<article class="project-card">` blocks in `projects.html`.
3. Update the image `src`, `alt`, `<h2>` title, `<p>` description, and the `href` on the button.
4. Remove the "coming soon" placeholder card when slots are filled.

## Adding a new service

Same pattern in `services.html` — copy an `<article class="service-row">` block, fill in content.

---

## Contact form

The form in `contact.html` currently has `action="#"`. To make it functional, replace with
a [Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) endpoint:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

No backend required.

---

## Fonts

Montserrat is self-hosted in `fonts/montserrat/`. If you prefer to load from Google Fonts,
add this to the `<head>` of each page and remove the `@font-face` declarations from `main.css`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
```

---

## Deployment

This is a static site — deploy to **GitHub Pages**, **Netlify**, or **Vercel**:

1. Run `npm run build` to produce `js/globe.bundle.js`.
2. Push the repo (excluding `node_modules/`).
3. Point the host to the repo root.

For GitHub Pages, add a `.nojekyll` file to the root to prevent Jekyll processing.
