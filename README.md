# Charlote Nano — Her Pink Space

A responsive, single-page portfolio built with plain HTML, CSS, and JavaScript. No build step or package installation is required.

## Run locally

Open `index.html` in a browser, or start a local static server from this folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Portrait

The hero and About sections use `CharloteNano_Icon.png`, a transparent cutout layered over a rounded color panel.

## Customize

- Replace the concept project previews in `index.html` with your own portfolio pieces and links.
- The Tools for Good Ideas section uses the skill logos in `assets/skills/`; update its labels and image paths in `index.html` as needed.
- The Works navigation and four creative-focus cards link to the matching sections in `creative-catalog.html`.
- Project cards open an in-page detail dialog. Replace their CSS concept previews with your project images and update each card's `data-project-*` attributes.
- Update the first three shared community stories and photo placeholders in `blogs-data.js`; they appear on both the homepage popups and the full blog page. Add additional posts in `blogs.html`.
- The contact form opens the visitor's default email app with a prepared message to `charlotenano29@gmail.com`; direct website-to-email delivery requires a configured email service or backend.
- The floating flower opens the shared “Give Cha a heart” counter. To connect it, run [`supabase-heart-counter.sql`](./supabase-heart-counter.sql) in the Supabase SQL Editor, then replace the two Supabase placeholders in `script.js` with your project URL and public anon/publishable key. Never use the service-role key in browser code.
- Adjust the typography, palette, and responsive layouts in `styles.css`.
