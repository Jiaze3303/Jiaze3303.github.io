#!/usr/bin/env python3
"""
Static photo gallery builder.
Scans images/ folder, extracts EXIF data, generates static site.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow -q")
    from PIL import Image
    from PIL.ExifTags import TAGS, GPSTAGS

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def parse_exif(filepath: str) -> dict:
    """Extract EXIF metadata from an image file."""
    info = {}
    try:
        img = Image.open(filepath)
        exif_data = img._getexif()
        if not exif_data:
            return info

        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == "Model":
                info["camera"] = str(value).strip()
            elif tag == "LensModel":
                info["lens"] = str(value).strip()
            elif tag == "FNumber":
                if hasattr(value, "numerator"):
                    info["aperture"] = f"f/{value.numerator / value.denominator:.1f}"
                else:
                    info["aperture"] = f"f/{float(value):.1f}"
            elif tag == "ExposureTime":
                if hasattr(value, "numerator"):
                    num, den = value.numerator, value.denominator
                else:
                    num, den = value.as_integer_ratio()
                if num == 1:
                    info["shutter"] = f"1/{den}s"
                else:
                    info["shutter"] = f"{num}/{den}s"
            elif tag == "ISOSpeedRatings":
                info["iso"] = f"ISO {value}"
            elif tag == "FocalLength":
                if hasattr(value, "numerator"):
                    info["focal"] = f"{value.numerator / value.denominator:.0f}mm"
                else:
                    info["focal"] = f"{float(value):.0f}mm"
            elif tag == "DateTimeOriginal":
                try:
                    dt = datetime.strptime(str(value), "%Y:%m:%d %H:%M:%S")
                    info["date"] = dt.strftime("%Y-%m-%d")
                    info["datetime"] = dt.isoformat()
                    info["timestamp"] = int(dt.timestamp())
                except Exception:
                    pass
            elif tag == "GPSInfo":
                gps = {}
                for gps_tag, gps_value in value.items():
                    gps_tag_name = GPSTAGS.get(gps_tag, gps_tag)
                    gps[gps_tag_name] = gps_value
                lat = _convert_gps_coord(gps.get("GPSLatitude"), gps.get("GPSLatitudeRef"))
                lon = _convert_gps_coord(gps.get("GPSLongitude"), gps.get("GPSLongitudeRef"))
                if lat is not None and lon is not None:
                    info["lat"] = round(lat, 6)
                    info["lon"] = round(lon, 6)

        # Image dimensions
        info["width"], info["height"] = img.size
    except Exception as e:
        print(f"  Warning: Could not read EXIF from {filepath}: {e}")
    return info


def _convert_gps_coord(coord, ref):
    """Convert GPS coordinate tuple to decimal degrees."""
    if not coord or not ref:
        return None
    try:
        degrees = coord[0].numerator / coord[0].denominator if hasattr(coord[0], "numerator") else float(coord[0])
        minutes = coord[1].numerator / coord[1].denominator if hasattr(coord[1], "numerator") else float(coord[1])
        seconds = coord[2].numerator / coord[2].denominator if hasattr(coord[2], "numerator") else float(coord[2])
        decimal = degrees + minutes / 60 + seconds / 3600
        if ref in ("S", "W"):
            decimal = -decimal
        return decimal
    except Exception:
        return None


def scan_images(base_dir: str) -> list:
    """Scan images/ directory and build photo list."""
    images_dir = os.path.join(base_dir, "images")
    if not os.path.isdir(images_dir):
        print("Error: images/ directory not found!")
        sys.exit(1)

    photos = []
    for root, dirs, files in os.walk(images_dir):
        for fname in sorted(files):
            ext = os.path.splitext(fname)[1].lower()
            if ext not in IMAGE_EXTS:
                continue

            filepath = os.path.join(root, fname)
            rel_path = os.path.relpath(filepath, base_dir)
            # URL path (use forward slashes)
            url_path = "/" + rel_path.replace(os.sep, "/")

            # Determine album from folder structure
            rel_to_images = os.path.relpath(root, images_dir)
            album = rel_to_images if rel_to_images != "." else None

            # Extract EXIF
            print(f"  Processing: {rel_path}")
            meta = parse_exif(filepath)

            photo = {
                "src": url_path,
                "filename": fname,
                "album": album,
                **meta,
            }

            # Fallback date from file modification time
            if "date" not in photo:
                mtime = os.path.getmtime(filepath)
                dt = datetime.fromtimestamp(mtime)
                photo["date"] = dt.strftime("%Y-%m-%d")
                photo["timestamp"] = int(mtime)

            photos.append(photo)

    # Sort by date descending (newest first)
    photos.sort(key=lambda p: p.get("timestamp", 0), reverse=True)
    return photos


def copy_template(base_dir: str, output_dir: str):
    """Copy static assets to output."""
    import shutil
    for fname in ["style.css", "app.js", "favicon.svg"]:
        src = os.path.join(base_dir, fname)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(output_dir, fname))


def generate_html(base_dir: str, photos: list, output_dir: str):
    """Generate index.html from template."""
    template_path = os.path.join(base_dir, "index.html")
    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    # Build gallery items HTML
    items_html = []
    for i, photo in enumerate(photos):
        album_label = f'<span class="photo-album">{photo["album"]}</span>' if photo.get("album") else ""
        exif_parts = []
        if photo.get("camera"):
            exif_parts.append(photo["camera"])
        if photo.get("aperture"):
            exif_parts.append(photo["aperture"])
        if photo.get("shutter"):
            exif_parts.append(photo["shutter"])
        if photo.get("iso"):
            exif_parts.append(photo["iso"])
        if photo.get("focal"):
            exif_parts.append(photo["focal"])
        exif_text = " · ".join(exif_parts)

        date_str = photo.get("date", "")
        aspect = "landscape"
        if photo.get("width") and photo.get("height"):
            if photo["height"] > photo["width"]:
                aspect = "portrait"

        items_html.append(f'''
        <div class="photo-card" data-index="{i}" data-aspect="{aspect}">
            <img data-src="{photo['src']}" alt="{photo['filename']}" loading="lazy" class="photo-img">
            <div class="photo-overlay">
                <div class="photo-meta">
                    {album_label}
                    <span class="photo-date">{date_str}</span>
                </div>
                <div class="photo-exif">{exif_text}</div>
            </div>
        </div>''')

    gallery_html = "\n".join(items_html)

    # Build albums list
    albums = sorted(set(p["album"] for p in photos if p.get("album")))
    albums_html = '<button class="album-btn active" data-album="all">全部</button>\n'
    for album in albums:
        albums_html += f'        <button class="album-btn" data-album="{album}">{album}</button>\n'

    # Inject data
    data_json = json.dumps(photos, ensure_ascii=False, indent=None)
    html = template.replace("{{GALLERY_ITEMS}}", gallery_html)
    html = html.replace("{{ALBUMS}}", albums_html)
    html = html.replace("{{PHOTO_COUNT}}", str(len(photos)))
    html = html.replace("{{PHOTO_DATA}}", data_json)
    html = html.replace("{{BUILD_TIME}}", datetime.now().strftime("%Y-%m-%d %H:%M"))

    output_path = os.path.join(output_dir, "index.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  Generated: {output_path}")


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "_site")
    os.makedirs(output_dir, exist_ok=True)

    print("📷 Scanning images...")
    photos = scan_images(base_dir)
    print(f"\n  Found {len(photos)} photos\n")

    print("📝 Generating site...")
    generate_html(base_dir, photos, output_dir)
    copy_template(base_dir, output_dir)

    # Copy images directory
    import shutil
    images_src = os.path.join(base_dir, "images")
    images_dst = os.path.join(output_dir, "images")
    if os.path.exists(images_dst):
        shutil.rmtree(images_dst)
    if os.path.exists(images_src):
        shutil.copytree(images_src, images_dst)
        print(f"  Copied images/")

    print(f"\n✅ Site built! Output: {output_dir}")
    print(f"   {len(photos)} photos in gallery")


if __name__ == "__main__":
    main()
