# Flame Gradient Favicon Pack

This pack was generated from your gradient flame icon (white→#f59f0a on charcoal).

## Included
- `favicon.ico` (16, 32, 48, 64)
- `favicon-16x16.png`
- `favicon-32x32.png`
- `favicon-48x48.png`
- `favicon-64x64.png`
- `apple-touch-icon.png` (180×180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `site.webmanifest`
- `flame-master-1024.png` (master source)

## Install (Next.js / Vercel)
Copy all files to your project's `public/` directory, then add the following to `<head>` or your `app/layout.tsx`:

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#111111">
```

Or with App Router `metadata`:
```ts
export const metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png" }]
  },
  manifest: "/site.webmanifest",
  themeColor: "#111111"
};
```
