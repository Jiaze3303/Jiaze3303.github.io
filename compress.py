#!/usr/bin/env python3
"""Compress large images before build."""

import os
from PIL import Image

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE_MB = 2
MAX_DIM = 2000
QUALITY = 80


def compress_images(base_dir):
    images_dir = os.path.join(base_dir, "images")
    if not os.path.isdir(images_dir):
        return

    for root, dirs, files in os.walk(images_dir):
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext not in IMAGE_EXTS:
                continue

            path = os.path.join(root, fname)
            size = os.path.getsize(path)

            if size <= MAX_SIZE_MB * 1024 * 1024:
                continue

            try:
                print(f"  压缩: {fname} ({size / 1024 / 1024:.1f}MB)")
                img = Image.open(path)

                if max(img.size) > MAX_DIM:
                    ratio = MAX_DIM / max(img.size)
                    new_size = (int(img.width * ratio), int(img.height * ratio))
                    img = img.resize(new_size, Image.LANCZOS)

                img.save(path, "JPEG", quality=QUALITY, optimize=True)
                new_size = os.path.getsize(path)
                print(f"    -> {new_size / 1024 / 1024:.1f}MB")
            except Exception as e:
                print(f"  跳过: {fname} ({e})")


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    print("🗜️  压缩大图...")
    compress_images(base_dir)
    print("✅ 压缩完成")
