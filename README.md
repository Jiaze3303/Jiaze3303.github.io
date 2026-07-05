# 📷 Photo Gallery

A minimal, ChronoFrame-inspired static photography gallery. Just upload images to GitHub — the site builds and deploys automatically.

## ✨ Features

- **Zero config** — drop images into `images/`, push, done
- **EXIF extraction** — camera, lens, aperture, shutter, ISO, focal length
- **Album support** — organize photos into subfolders
- **Masonry layout** — responsive grid, adapts to any screen
- **Lightbox** — full-screen view with EXIF sidebar, keyboard/touch navigation
- **Dark & light theme** — toggle with one click, defaults to dark
- **Lazy loading** — images load as you scroll
- **GitHub Pages** — free hosting, auto-deploy via Actions

## 🚀 Quick Start

### 1. Fork or clone this repo

### 2. Enable GitHub Pages
- Go to **Settings → Pages**
- Source: **GitHub Actions**

### 3. Add photos
Drop your images into the `images/` folder:

```
images/
├── 2024/
│   ├── sunset.jpg
│   └── portrait.jpg
├── 2025/
│   ├── street.jpg
│   └── landscape.jpg
└── random.jpg          ← root level = no album
```

### 4. Push
```bash
git add .
git commit -m "Add photos"
git push
```

The GitHub Action will automatically build and deploy your gallery.

## 📁 Folder Structure

```
photo-gallery/
├── images/              ← 📷 Put your photos here!
│   ├── 2024/            ← Subfolder = album name
│   │   └── photo.jpg
│   └── 2025/
│       └── photo.jpg
├── build.py             ← Build script (scans images, extracts EXIF)
├── index.html           ← HTML template
├── style.css            ← Styles
├── app.js               ← Client-side logic
├── favicon.svg          ← Site icon
└── .github/
    └── workflows/
        └── deploy.yml   ← Auto-build & deploy
```

## 🎨 Customization

### Change site title
Edit `index.html`, find `<h1 class="site-title">Gallery</h1>` and change `Gallery` to your title.

### Change accent color
In `style.css`, edit `--accent: #d4a574;` (warm gold) to any color you like.

### Supported formats
`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.avif`

## 📝 How It Works

1. You push images to the `images/` folder
2. GitHub Actions triggers `build.py`
3. `build.py` scans all images, extracts EXIF metadata
4. Generates a static `index.html` with embedded photo data
5. Deploys to GitHub Pages

No server, no database, no API keys. Just files.

## License

MIT
