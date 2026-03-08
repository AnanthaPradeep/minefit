# MineFit Assets Setup

Use this structure to add your branding assets.

## Public asset folders

- `public/assets/images/` → photos, banners, hero images
- `public/assets/icons/` → app icons, small symbols, logo marks
- `public/assets/fonts/` → custom web fonts (`.woff2` preferred)

Because these are in `public`, use them directly by URL:

- `/assets/images/your-image.png`
- `/assets/icons/your-logo.svg`
- `/assets/fonts/YourFont-Regular.woff2`

## Recommended file names

- Logo: `public/assets/icons/logo.svg`
- Dark logo (optional): `public/assets/icons/logo-dark.svg`
- App mark: `public/assets/icons/app-mark.svg`
- Hero image: `public/assets/images/hero.jpg`

## Font wiring (example)

Add to `src/app/globals.css` after you place real files:

```css
@font-face {
  font-family: "BrandSans";
  src: url("/assets/fonts/BrandSans-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "BrandSans";
  src: url("/assets/fonts/BrandSans-SemiBold.woff2") format("woff2");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-brand: "BrandSans", Arial, Helvetica, sans-serif;
}

body {
  font-family: var(--font-brand);
}
```

## Optional imported assets

If you want TypeScript imports (`import logo from ...`) instead of public URLs, place files under `src/assets/` and import them from components.
