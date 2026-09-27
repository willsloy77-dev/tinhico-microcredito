/*
 * TINHICO — HERO SLIDER
 * Handles:
 * - autoplay
 * - previous/next controls
 * - indicator buttons
 * - per-slide green frame state
 * - pause on hover/focus
 * - reduced-motion preference
 */

(() => {
    "use strict";

    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const previousButton = document.querySelector("[data-hero-prev]");
    const nextButton = document.querySelector("[data-hero-next]");
    const indicators = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const config = window.TinhicoConfig?.hero ?? {};

    if (!slides.length) return;

    let currentIndex = slides.findIndex((slide) =>
        slide.classList.contains("hero-slide--active")
    );

    if (currentIndex < 0) currentIndex = 0;

    let autoplayTimer = null;
    let isPaused = false;
    let resizeObserver = null;

    const mobileQuery = window.matchMedia("(max-width: 640px)");

    function isMobile() {
        return mobileQuery.matches;
    }

    // The slides are layered with position:absolute so inactive slides
    // never create blank vertical space. The slider height follows only
    // the active slide, including changes caused by responsive layout
    // or lazy-loaded images.
    function syncSliderHeight() {
        const activeSlide = slides[currentIndex];
        if (!activeSlide) return;

        const height = activeSlide.scrollHeight;
        if (height > 0) {
            slider.style.height = `${height}px`;
        }
    }

    function watchActiveSlide() {
        resizeObserver?.disconnect();

        const activeSlide = slides[currentIndex];
        if (!activeSlide || typeof ResizeObserver === "undefined") return;

        resizeObserver = new ResizeObserver(() => {
            syncSliderHeight();
        });
        resizeObserver.observe(activeSlide);
    }

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    function applyGreenFrame(slide) {
        const green = slide.dataset.greenFrame === "true";

        slide.classList.toggle("hero-slide--green", green);
        slide.classList.toggle("hero-slide--green-mobile", green);
    }

    function setActiveSlide(index, { resetAutoplay = true } = {}) {
        const normalizedIndex = isMobile()
            ? 0
            : (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
            const active = slideIndex === normalizedIndex;

            slide.classList.toggle("hero-slide--active", active);
            slide.setAttribute("aria-hidden", String(!active));

            if (active) {
                applyGreenFrame(slide);
            }
        });

        indicators.forEach((indicator, indicatorIndex) => {
            const active = indicatorIndex === normalizedIndex;

            indicator.classList.toggle("hero-indicator--active", active);
            indicator.setAttribute("aria-current", active ? "true" : "false");
        });

        currentIndex = normalizedIndex;

        // Wait one frame so the active slide has its final responsive
        // dimensions before measuring it.
        window.requestAnimationFrame(() => {
            syncSliderHeight();
            watchActiveSlide();
        });

        if (resetAutoplay) {
            restartAutoplay();
        }
    }

    function nextSlide() {
        setActiveSlide(currentIndex + 1);
    }

    function previousSlide() {
        setActiveSlide(currentIndex - 1);
    }

    function stopAutoplay() {
        if (autoplayTimer !== null) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function startAutoplay() {
        if (
            prefersReducedMotion ||
            config.autoplay === false ||
            slides.length < 2 ||
            isPaused ||
            isMobile()
        ) {
            return;
        }

        stopAutoplay();

        const interval =
            Number(config.interval) > 2000
                ? Number(config.interval)
                : 6000;

        autoplayTimer = window.setInterval(() => {
            nextSlide();
        }, interval);
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    function pauseSlider() {
        isPaused = true;
        stopAutoplay();
    }

    function resumeSlider() {
        isPaused = false;
        startAutoplay();
    }

    previousButton?.addEventListener("click", previousSlide);
    nextButton?.addEventListener("click", nextSlide);

    indicators.forEach((indicator) => {
        indicator.addEventListener("click", () => {
            const index = Number(indicator.dataset.heroDot);

            if (Number.isInteger(index)) {
                setActiveSlide(index);
            }
        });
    });

    slider.addEventListener("mouseenter", pauseSlider);
    slider.addEventListener("mouseleave", resumeSlider);

    slider.addEventListener("focusin", pauseSlider);
    slider.addEventListener("focusout", (event) => {
        if (!slider.contains(event.relatedTarget)) {
            resumeSlider();
        }
    });

    window.addEventListener("resize", () => {
        if (isMobile()) {
            stopAutoplay();
            setActiveSlide(0, { resetAutoplay: false });
        } else {
            syncSliderHeight();
            startAutoplay();
        }
    });

    mobileQuery.addEventListener?.("change", () => {
        if (isMobile()) {
            stopAutoplay();
            setActiveSlide(0, { resetAutoplay: false });
        } else {
            startAutoplay();
        }
    });

    window.addEventListener("load", () => {
        syncSliderHeight();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            restartAutoplay();
        }
    });

    setActiveSlide(currentIndex, { resetAutoplay: false });
    startAutoplay();
})();
