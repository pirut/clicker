# Favicon Generation

This directory contains scripts for generating favicons and other assets.

## Generating Favicons

To generate favicon.ico, apple-icon.png, icon.png, and og-image.png from the SVG favicons:

1. Install the required dependency:
```bash
npm install --save-dev sharp
```

2. Run the generation script:
```bash
npm run generate-favicons
```

This will create:
- `src/app/favicon.ico` - Standard favicon for browsers
- `src/app/apple-icon.png` - Apple touch icon (180x180)
- `src/app/icon.png` - PWA icon (512x512)
- `public/og-image.png` - Open Graph image for social sharing (1200x630)

The SVG favicons (`public/favicon.svg` and `public/favicon-dark.svg`) are already in place and will be used by modern browsers automatically.

