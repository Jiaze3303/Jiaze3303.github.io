/**
 * Gallery — Client-side gallery logic
 * Lazy loading, lightbox, theme switching, album filtering
 */

(function () {
    "use strict";

    const photos = window.__PHOTO_DATA__ || [];
    let currentIndex = 0;
    let filteredPhotos = [...photos];
    let currentAlbum = "all";

    // ── Theme ──
    function initTheme() {
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = saved || (prefersDark ? "dark" : "dark"); // default dark
        document.documentElement.setAttribute("data-theme", theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    }

    // ── Lazy Loading ──
    function initLazyLoad() {
        const images = document.querySelectorAll(".photo-img[data-src]");
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.onload = () => img.classList.add("loaded");
                            img.onerror = () => {
                                img.src =
                                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%231a1a1a"><rect width="400" height="300"/><text x="50%" y="50%" fill="%23555" text-anchor="middle" dy=".3em" font-size="14">加载失败</text></svg>';
                                img.classList.add("loaded");
                            };
                            observer.unobserve(img);
                        }
                    });
                },
                { rootMargin: "200px" }
            );
            images.forEach((img) => observer.observe(img));
        } else {
            // Fallback
            images.forEach((img) => {
                img.src = img.dataset.src;
                img.onload = () => img.classList.add("loaded");
            });
        }
    }

    // ── Album Filtering ──
    function initAlbumFilter() {
        const buttons = document.querySelectorAll(".album-btn");
        const cards = document.querySelectorAll(".photo-card");

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const album = btn.dataset.album;
                currentAlbum = album;
                buttons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                filteredPhotos = album === "all" ? [...photos] : photos.filter((p) => p.album === album);

                cards.forEach((card, i) => {
                    const photo = photos[i];
                    if (album === "all" || photo.album === album) {
                        card.style.display = "";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // ── Lightbox ──
    function openLightbox(index) {
        const lightbox = document.getElementById("lightbox");
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
        const lightbox = document.getElementById("lightbox");
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
        const img = document.getElementById("lightboxImg");
        img.classList.remove("visible");
    }

    function updateLightbox() {
        const photo = filteredPhotos[currentIndex];
        if (!photo) return;

        const img = document.getElementById("lightboxImg");
        img.classList.remove("visible");
        img.src = photo.src;
        img.onload = () => img.classList.add("visible");

        // Sidebar info
        setText("lbFilename", photo.filename);
        setMeta("lbDate", photo.date);
        setMeta("lbAlbum", photo.album);
        setMeta("lbCamera", photo.camera);
        setMeta("lbLens", photo.lens);
        setExif("lbAperture", photo.aperture);
        setExif("lbShutter", photo.shutter);
        setExif("lbISO", photo.iso);
        setExif("lbFocal", photo.focal);

        document.getElementById("lbCounter").textContent = `${currentIndex + 1} / ${filteredPhotos.length}`;
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value || "";
    }

    function setMeta(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        if (value) {
            el.classList.remove("hidden");
            el.querySelector(".meta-value").textContent = value;
        } else {
            el.classList.add("hidden");
        }
    }

    function setExif(id, value) {
        const el = document.getElementById(id);
        if (!el) return;
        if (value) {
            el.classList.remove("hidden");
            el.querySelector(".exif-value").textContent = value;
        } else {
            el.classList.add("hidden");
        }
    }

    function navigateLightbox(direction) {
        currentIndex = (currentIndex + direction + filteredPhotos.length) % filteredPhotos.length;
        updateLightbox();
    }

    // ── Event Listeners ──
    function initEvents() {
        // Theme toggle
        document.getElementById("themeToggle").addEventListener("click", toggleTheme);

        // Gallery click → lightbox
        document.getElementById("gallery").addEventListener("click", (e) => {
            const card = e.target.closest(".photo-card");
            if (!card) return;
            const index = parseInt(card.dataset.index, 10);
            // Find index in filteredPhotos
            const photo = photos[index];
            const filteredIndex = filteredPhotos.indexOf(photo);
            openLightbox(filteredIndex >= 0 ? filteredIndex : 0);
        });

        // Lightbox controls
        document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
        document.querySelector(".lightbox-backdrop").addEventListener("click", closeLightbox);
        document.getElementById("lbPrev").addEventListener("click", () => navigateLightbox(-1));
        document.getElementById("lbNext").addEventListener("click", () => navigateLightbox(1));

        // Keyboard
        document.addEventListener("keydown", (e) => {
            const lightbox = document.getElementById("lightbox");
            if (!lightbox.classList.contains("active")) return;

            switch (e.key) {
                case "Escape":
                    closeLightbox();
                    break;
                case "ArrowLeft":
                    navigateLightbox(-1);
                    break;
                case "ArrowRight":
                    navigateLightbox(1);
                    break;
            }
        });

        // Touch swipe
        let touchStartX = 0;
        const lightbox = document.getElementById("lightbox");
        lightbox.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
        });
        lightbox.addEventListener("touchend", (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                navigateLightbox(diff > 0 ? 1 : -1);
            }
        });
    }

    // ── Init ──
    function init() {
        initTheme();
        initLazyLoad();
        initAlbumFilter();
        initEvents();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
