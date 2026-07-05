/**
 * 摄影集 — Enhanced Gallery Logic
 * Scroll reveal, cursor glow, lightbox, theme, lazy load, stats counter
 */

(function () {
    "use strict";

    const photos = window.__PHOTO_DATA__ || [];
    let currentIndex = 0;
    let filteredPhotos = [...photos];
    let currentAlbum = "all";
    let currentView = "masonry";

    // ── Hero Background ──
    function initHeroBg() {
        const heroBg = document.getElementById("heroBg");
        if (!heroBg || photos.length === 0) return;

        // Pick a random photo
        const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            heroBg.style.backgroundImage = `url(${randomPhoto.src})`;
            heroBg.classList.add("has-bg");
        };
        img.src = randomPhoto.src;
    }



    // ── Cursor Glow ──
    function initCursorGlow() {
        const glow = document.getElementById("cursorGlow");
        if (!glow || window.matchMedia("(max-width: 768px)").matches) return;

        let mx = 0, my = 0, gx = 0, gy = 0;
        document.addEventListener("mousemove", (e) => {
            mx = e.clientX;
            my = e.clientY;
        });

        function animate() {
            gx += (mx - gx) * 0.08;
            gy += (my - gy) * 0.08;
            glow.style.transform = `translate(${gx - 200}px, ${gy - 200}px)`;
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ── Hero Stats Counter ──
    function animateCounter(el, target) {
        const duration = 1200;
        const start = performance.now();
        const from = 0;

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
            el.textContent = Math.round(from + (target - from) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function initStats() {
        const cameras = new Set(photos.filter(p => p.camera).map(p => p.camera));
        const albums = new Set(photos.filter(p => p.album).map(p => p.album));

        setTimeout(() => {
            animateCounter(document.getElementById("statPhotos"), photos.length);
            animateCounter(document.getElementById("statAlbums"), albums.size);
            animateCounter(document.getElementById("statCameras"), cameras.size);
        }, 1400);
    }

    // ── Header Scroll ──
    function initHeader() {
        const header = document.getElementById("header");
        const hero = document.getElementById("hero");
        const backToTop = document.getElementById("backToTop");
        let heroHeight = hero ? hero.offsetHeight : 0;

        function onScroll() {
            const scrollY = window.scrollY;
            if (scrollY > heroHeight - 100) {
                header.classList.add("visible");
            } else {
                header.classList.remove("visible");
            }

            if (backToTop) {
                if (scrollY > 600) {
                    backToTop.classList.add("visible");
                } else {
                    backToTop.classList.remove("visible");
                }
            }
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        if (backToTop) {
            backToTop.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        // Hero scroll button
        const heroScroll = document.getElementById("heroScroll");
        if (heroScroll) {
            heroScroll.addEventListener("click", () => {
                const gallerySection = document.getElementById("gallerySection");
                if (gallerySection) {
                    gallerySection.scrollIntoView({ behavior: "smooth" });
                }
            });
        }

        // Recalculate on resize
        window.addEventListener("resize", () => {
            heroHeight = hero ? hero.offsetHeight : 0;
        });
    }

    // ── Scroll Reveal ──
    function initScrollReveal() {
        const cards = document.querySelectorAll(".photo-card");

        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("revealed");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { rootMargin: "50px 0px", threshold: 0.05 }
            );
            cards.forEach((card) => observer.observe(card));
        } else {
            cards.forEach((card) => card.classList.add("revealed"));
        }
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
                                img.src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="#1a1a1a"><rect width="400" height="300"/><text x="50%" y="50%" fill="#555" text-anchor="middle" dy=".3em" font-size="14">加载失败</text></svg>')}`;
                                img.classList.add("loaded");
                            };
                            observer.unobserve(img);
                        }
                    });
                },
                { rootMargin: "300px" }
            );
            images.forEach((img) => observer.observe(img));
        } else {
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
                        card.classList.remove("revealed");
                        requestAnimationFrame(() => card.classList.add("revealed"));
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // ── View Toggle ──
    function initViewToggle() {
        const buttons = document.querySelectorAll(".view-btn");
        const gallery = document.getElementById("gallery");

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const view = btn.dataset.view;
                currentView = view;
                buttons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                if (view === "grid") {
                    gallery.classList.add("grid-view");
                } else {
                    gallery.classList.remove("grid-view");
                }
            });
        });
    }

    // ── Lightbox ──
    // Image cache for preloading
    const imageCache = new Map();

    function preloadImage(src) {
        if (imageCache.has(src)) return imageCache.get(src);
        const img = new Image();
        img.src = src;
        const promise = new Promise((resolve) => {
            img.onload = () => resolve(img);
            img.onerror = () => resolve(img);
            if (img.complete) resolve(img);
        });
        imageCache.set(src, promise);
        return promise;
    }

    function preloadAdjacent() {
        const prev = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        const next = (currentIndex + 1) % filteredPhotos.length;
        if (filteredPhotos[prev]) preloadImage(filteredPhotos[prev].src);
        if (filteredPhotos[next]) preloadImage(filteredPhotos[next].src);
    }

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
        const loader = document.querySelector(".lightbox-loader");
        const backdrop = document.querySelector(".lightbox-backdrop");

        // Instant hide
        img.style.opacity = "0";
        loader.classList.add("active");

        // Set blurred background (use cached version if available)
        const cached = imageCache.get(photo.src);
        if (cached && cached.then) {
            cached.then(() => {
                backdrop.style.backgroundImage = `url(${photo.src})`;
            });
        } else {
            backdrop.style.backgroundImage = `url(${photo.src})`;
        }

        // Load and show image
        preloadImage(photo.src).then(() => {
            img.src = photo.src;
            loader.classList.remove("active");
            img.style.opacity = "1";
        });

        // Caption & counter
        const caption = document.getElementById("lightboxCaption");
        if (caption) caption.textContent = photo.filename;
        const counter = document.getElementById("lbCounter");
        if (counter) counter.textContent = `${currentIndex + 1} / ${filteredPhotos.length}`;

        // Preload adjacent images
        preloadAdjacent();
    }

    function navigateLightbox(direction) {
        currentIndex = (currentIndex + direction + filteredPhotos.length) % filteredPhotos.length;
        updateLightbox();
    }

    // ── Events ──
    function initEvents() {
        // Gallery click
        document.getElementById("gallery").addEventListener("click", (e) => {
            const card = e.target.closest(".photo-card");
            if (!card) return;
            const index = parseInt(card.dataset.index, 10);
            const photo = photos[index];
            const filteredIndex = filteredPhotos.indexOf(photo);
            openLightbox(filteredIndex >= 0 ? filteredIndex : 0);
        });

        // Lightbox controls
        document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
        document.querySelector(".lightbox-backdrop").addEventListener("click", closeLightbox);

        // Click on image-wrap area (not image itself) closes lightbox
        document.querySelector(".lightbox-image-wrap").addEventListener("click", (e) => {
            if (e.target === e.currentTarget || e.target === document.getElementById("lightboxCaption")) {
                closeLightbox();
            }
        });

        document.getElementById("lbPrev").addEventListener("click", (e) => { e.stopPropagation(); navigateLightbox(-1); });
        document.getElementById("lbNext").addEventListener("click", (e) => { e.stopPropagation(); navigateLightbox(1); });

        // Keyboard
        document.addEventListener("keydown", (e) => {
            const lightbox = document.getElementById("lightbox");
            if (!lightbox.classList.contains("active")) return;

            switch (e.key) {
                case "Escape": closeLightbox(); break;
                case "ArrowLeft": navigateLightbox(-1); break;
                case "ArrowRight": navigateLightbox(1); break;
            }
        });

        // Touch swipe
        let touchStartX = 0;
        const lightbox = document.getElementById("lightbox");
        lightbox.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        lightbox.addEventListener("touchend", (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) navigateLightbox(diff > 0 ? 1 : -1);
        });
    }

    // ── Init ──
    function preloadGalleryImages() {
        // Preload all gallery images in background for instant lightbox
        photos.forEach((photo, i) => {
            if (i < 20) preloadImage(photo.src); // Preload first 20
        });
    }

    function init() {
        initHeroBg();
        initCursorGlow();
        preloadGalleryImages();
        initHeader();
        initStats();
        initScrollReveal();
        initLazyLoad();
        initAlbumFilter();
        initViewToggle();
        initEvents();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
