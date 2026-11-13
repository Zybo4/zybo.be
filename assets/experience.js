(() => {
  "use strict";

  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const { gsap, ScrollTrigger } = window;
  const intro = [...document.querySelectorAll("[data-intro]")];
  const reveals = [...document.querySelectorAll("[data-reveal]")];
  const smooth = "cubic-bezier(.2, .65, .2, 1)";
  const nativeAnimations = new Set();
  const canAnimate = typeof Element.prototype.animate === "function";
  const scanHeadings = [...document.querySelectorAll("[data-scan]")];
  const processTracks = [...document.querySelectorAll("[data-process]")];
  const canObserve = "IntersectionObserver" in window;
  const observer = canAnimate && "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (!preference.matches) playNative(target, 0, 28);
    }
  }, { threshold: .16 }) : null;
  let effects;

  function playNative(node, delay, distance) {
    const animation = node.animate(
      [{ opacity: .2, transform: `translateY(${distance}px)` }, { opacity: 1, transform: "translateY(0)" }],
      { duration: 660, delay, easing: smooth, fill: "backwards" },
    );
    nativeAnimations.add(animation);
    animation.finished.then(() => nativeAnimations.delete(animation), () => nativeAnimations.delete(animation));
  }

  if (!preference.matches) {
    if (gsap) {
      effects = gsap.context(() => {
        gsap.from(intro, {
          yPercent: (_index, node) => node.closest(".hero-line") ? 105 : 24,
          opacity: 0, duration: .9, ease: "power3.out", stagger: .09, clearProps: "transform,opacity",
        });
        if (ScrollTrigger) {
          gsap.registerPlugin(ScrollTrigger);
          for (const node of reveals) {
            gsap.from(node, {
              y: 28, opacity: .2, duration: .75, ease: "power2.out", clearProps: "transform,opacity",
              scrollTrigger: { trigger: node, start: "top 92%", once: true },
            });
          }
        } else {
          reveals.forEach(node => observer?.observe(node));
        }
      });
    } else if (canAnimate) {
      intro.forEach((node, index) => playNative(node, index * 85, node.closest(".hero-line") ? 66 : 20));
      reveals.forEach(node => observer?.observe(node));
    }
  }

  function printHeading(heading) {
    if (preference.matches) return;
    heading.classList.add("is-printing");
  }

  for (const heading of scanHeadings) {
    heading.addEventListener("animationend", event => {
      if (event.animationName === "scan-solid") heading.classList.remove("is-printing");
    });
  }
  if (canObserve) {
    const scans = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) printHeading(target);
        else target.classList.remove("is-printing");
      }
    }, { rootMargin: "0px 0px -9% 0px" });
    scanHeadings.forEach(heading => scans.observe(heading));
    const processObserver = new IntersectionObserver(entries => {
      for (const entry of entries) entry.target.classList.toggle("has-signal", entry.isIntersecting);
    }, { threshold: .1 });
    processTracks.forEach(track => processObserver.observe(track));
  } else {
    processTracks.forEach(track => track.classList.add("has-signal"));
  }

  preference.addEventListener("change", () => {
    if (!preference.matches) return;
    effects?.revert();
    observer?.disconnect();
    for (const animation of nativeAnimations) animation.cancel();
    scanHeadings.forEach(heading => heading.classList.remove("is-printing"));
  });

  const pointerArea = document.querySelector("[data-pointer-area]");
  if (pointerArea) {
    const text = pointerArea.querySelector("[data-pointer-text]");
    let frame = 0;

    pointerArea.addEventListener("pointermove", event => {
      if (!finePointer.matches || preference.matches || event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = text.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100));
        if (event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
          text.style.setProperty("--cursor", percent + "%");
        } else {
          text.style.removeProperty("--cursor");
        }
      });
    }, { passive: true });

    function resetPointer() {
      cancelAnimationFrame(frame);
      text.style.removeProperty("--cursor");
    }

    pointerArea.addEventListener("pointerleave", resetPointer);
    preference.addEventListener("change", resetPointer);
  }

  for (const button of document.querySelectorAll(".magnetic")) {
    const label = button.querySelector("span");
    const xTo = gsap?.quickTo(label, "x", { duration: .35, ease: "power3" });
    const yTo = gsap?.quickTo(label, "y", { duration: .35, ease: "power3" });

    function position(x, y) {
      if (xTo && yTo) {
        xTo(x);
        yTo(y);
      } else {
        label.style.translate = x + "px " + y + "px";
      }
    }

    button.addEventListener("pointermove", event => {
      if (!finePointer.matches || preference.matches || event.pointerType === "touch") return;
      const rect = button.getBoundingClientRect();
      position((event.clientX - rect.left - rect.width / 2) * .11, (event.clientY - rect.top - rect.height / 2) * .16);
    }, { passive: true });
    button.addEventListener("pointerleave", () => {
      if (!preference.matches) position(0, 0);
    });
    preference.addEventListener("change", () => {
      if (!preference.matches) return;
      xTo?.tween.pause(0);
      yTo?.tween.pause(0);
      label.style.removeProperty("transform");
      label.style.removeProperty("translate");
    });
  }

  for (const browser of document.querySelectorAll("[data-service-browser]")) {
    const preview = browser.querySelector("[data-service-preview]");
    const links = browser.querySelectorAll("[data-service]");
    const panels = new Map([...preview.querySelectorAll("[data-preview]")].map(panel => [panel.dataset.preview, panel]));
    let active = [...links].find(link => link.dataset.service === preview.dataset.active);
    if (active) active.dataset.previewActive = "";
    for (const link of links) {
      const activate = () => {
        if (active === link) return;
        panels.get(preview.dataset.active)?.classList.remove("is-active");
        if (active) delete active.dataset.previewActive;
        preview.dataset.active = link.dataset.service;
        panels.get(preview.dataset.active)?.classList.add("is-active");
        link.dataset.previewActive = "";
        active = link;
      };
      link.addEventListener("pointerenter", activate);
      link.addEventListener("focus", activate);
    }
  }

  for (const carousel of document.querySelectorAll("[data-carousel]")) {
    const rail = carousel.querySelector(".service-slides");
    const controls = carousel.querySelector(".gallery-controls");
    const position = controls.querySelector("[data-slide-position]");
    const slides = [...rail.querySelectorAll("[data-slide]")];
    let active = 0;
    let pending;

    function update() {
      const center = rail.scrollLeft + rail.clientWidth / 2;
      active = slides.reduce((nearest, slide, index) => {
        const distance = card => Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
        return distance(slide) < distance(slides[nearest]) ? index : nearest;
      }, 0);
      slides.forEach((slide, index) => slide.classList.toggle("is-current", index === active));
      const value = String(active + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
      if (position.value !== value) position.value = value;
    }

    function move(direction) {
      const index = ((pending ?? active) + direction + slides.length) % slides.length;
      const slide = slides[index];
      pending = index;
      rail.scrollTo({
        left: slide.offsetLeft - (rail.clientWidth - slide.offsetWidth) / 2,
        behavior: preference.matches ? "instant" : "smooth",
      });
    }

    for (const button of controls.querySelectorAll("[data-slide-direction]")) {
      button.addEventListener("click", () => move(Number(button.dataset.slideDirection)));
    }
    rail.addEventListener("scroll", update, { passive: true });
    rail.addEventListener("scrollend", () => { pending = undefined; });
    rail.addEventListener("pointerdown", () => { pending = undefined; });
    rail.addEventListener("keydown", event => {
      if (event.target !== rail || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    });
    if ("ResizeObserver" in window) new ResizeObserver(update).observe(rail);
    controls.hidden = false;
    update();
  }
})();
