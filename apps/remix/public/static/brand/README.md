# Instance brand assets

Place deployment-specific public brand assets in this directory, or host them at an external
`https://` URL. `avellino-logo.webp` is the logo used by the Avellino Tests deployment.

`default-icon.svg` is a neutral document glyph used only when no instance icon is configured.

Recommended files:

- `logo.png`: horizontal wordmark, transparent background, approximately 4:1. SVG also works on
  web pages, but PNG is recommended when the same logo must render in generated PDFs.
- `icon.png`: square favicon/PWA icon, at least 512×512.
- `opengraph.png`: social preview image, 1200×630.

Configure the files with root-relative paths:

```env
NEXT_PUBLIC_INSTANCE_LOGO_URL=/static/brand/logo.png
NEXT_PUBLIC_INSTANCE_ICON_URL=/static/brand/icon.png
NEXT_PUBLIC_INSTANCE_OPENGRAPH_IMAGE_URL=/static/brand/opengraph.png
```

Absolute `http://` and `https://` URLs are also accepted. Use versioned, publicly readable URLs so
browser, PDF, and social-preview rendering can retrieve the same asset. Unsafe URL schemes and
embedded URL credentials are rejected.
