/* ==========================================================================
   Hamza Portfolio — main script
   Libraries (loaded in index.html): GSAP, ScrollTrigger, Lenis.
   Each feature lives in its own function; init() at the bottom runs them.
   ========================================================================== */

const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasMouse = matchMedia("(hover: hover)").matches;
const isDesktop = matchMedia("(min-width: 768px)").matches;
const RING_LENGTH = 339.3; // must match stroke-dasharray in style.css

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

/* ---------- Missing images -> gold placeholder ---------- */
function replaceWithPlaceholder(img) {
  const box = document.createElement("div");
  box.className = "ph";
  box.textContent = img.dataset.fallback;
  img.replaceWith(box);
}

function setupImageFallbacks() {
  $$("img[data-fallback]").forEach((img) => {
    const failed = img.complete && img.naturalWidth === 0;
    if (failed) replaceWithPlaceholder(img);
    else img.addEventListener("error", () => replaceWithPlaceholder(img), { once: true });
  });
}

/* ---------- Split text into words / letters ---------- */
function splitStatementIntoWords() {
  const statement = $("#statement");
  statement.innerHTML = statement.textContent
    .split(" ")
    .map((word) => `<span class="word">${word}</span>`)
    .join(" ");
}

function splitNameIntoLetters() {
  const name = $("#name");
  name.innerHTML = name.textContent
    .split("")
    .map((char) => `<span class="letter-wrap"><span class="letter">${char}</span></span>`)
    .join("");
}

/* ---------- Smooth scrolling (Lenis) ---------- */
function setupSmoothScroll() {
  if (!window.Lenis) return null;

  const lenis = new Lenis({ duration: 1.15 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Smooth anchor links (#about, #work ...)
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = $(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -40 });
    });
  });

  return lenis;
}

/* ---------- Intro: preloader counter, then hero reveal ---------- */
function playIntro(lenis) {
  const preloader = $("#preloader");
  const counter = $("#count");
  const count = { value: 0 };

  // Starting state of everything the intro animates in
  gsap.set(".hero-fade", { opacity: 0, y: 30 });
  gsap.set("#name .letter", { yPercent: 115 });
  gsap.set("#preline", { scaleX: 0 });
  lenis?.stop();

  gsap
    .timeline()
    .to(count, {
      value: 100,
      duration: 1.9,
      ease: "power2.inOut",
      onUpdate: () => (counter.textContent = Math.round(count.value)),
    })
    .to("#preline", { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0)
    .to(preloader, {
      yPercent: -100,
      duration: 1,
      ease: "power4.inOut",
      onStart: () => lenis?.start(),
    }, "+=0.15")
    .to("#name .letter", { yPercent: 0, duration: 1.3, stagger: 0.08, ease: "power4.out" }, "-=0.35")
    .to(".hero-fade", { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out" }, "-=0.9")
    .from("#heroimg .arch", { clipPath: "inset(100% 0 0 0)", duration: 1.4, ease: "power3.inOut" }, "-=1.6")
    .add(() => preloader.remove());
}

/* ---------- Hero ---------- */
function setupHeroMotion() {
  // Rotating skills badge
  gsap.to("#badge", { rotation: 360, duration: 16, repeat: -1, ease: "none", transformOrigin: "50% 50%" });

  // Portrait drifts upward while scrolling away
  gsap.to("#heroimg", {
    yPercent: -10,
    ease: "none",
    scrollTrigger: { trigger: "#heroimg", start: "top 60%", end: "bottom top", scrub: true },
  });
}

/* ---------- About: statement lights up word by word ---------- */
function setupStatementReveal() {
  gsap.to(".word", {
    opacity: 1,
    stagger: 0.1,
    ease: "none",
    scrollTrigger: { trigger: "#statement", start: "top 80%", end: "bottom 45%", scrub: true },
  });
}

/* ---------- Marquee: speeds up when you scroll fast ---------- */
function setupMarquee() {
  const marquee = gsap.to(".marquee-group", { xPercent: -100, repeat: -1, duration: 22, ease: "none" });

  ScrollTrigger.create({
    onUpdate: (self) => {
      const boost = Math.min(Math.abs(self.getVelocity()) / 400, 6);
      gsap.to(marquee, { timeScale: 1 + boost, duration: 0.3, overwrite: true });
      gsap.to(marquee, { timeScale: 1, duration: 1, delay: 0.3 });
    },
  });
}

/* ---------- Generic fade-up for anything with .reveal ---------- */
function setupRevealOnScroll() {
  $$(".reveal").forEach((element) => {
    gsap.from(element, {
      y: 50,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 88%" },
    });
  });
}

/* ---------- Stat rings and number counters ---------- */
function setupStats() {
  $$(".progress-arc").forEach((arc) => {
    gsap.to(arc, {
      strokeDashoffset: RING_LENGTH * (1 - Number(arc.dataset.progress)),
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: { trigger: arc, start: "top 90%" },
    });
  });

  $$(".count-up").forEach((element) => {
    const number = { value: 0 };
    gsap.to(number, {
      value: Number(element.dataset.target),
      duration: 1.8,
      ease: "power3.out",
      onUpdate: () => (element.textContent = Math.round(number.value)),
      scrollTrigger: { trigger: element, start: "top 90%" },
    });
  });
}

/* ---------- Projects: stacked cards shrink as the next one arrives ---------- */
function setupProjectStack() {
  if (!isDesktop) return;

  const cards = $$(".proj");
  cards.slice(0, -1).forEach((card, index) => {
    gsap.to(card, {
      scale: 0.93,
      opacity: 0.45,
      ease: "none",
      scrollTrigger: { trigger: cards[index + 1], start: "top 85%", end: "top 20%", scrub: true },
    });
  });
}

/* ---------- Experience timeline line draws while scrolling ---------- */
function setupTimeline() {
  gsap.to("#timeline-line", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: { trigger: "#timeline", start: "top 70%", end: "bottom 70%", scrub: true },
  });
}

/* ---------- Contact headline ---------- */
function setupContactHeadline() {
  gsap.set(".contact-line", { yPercent: 110 });
  gsap.to(".contact-line", {
    yPercent: 0,
    duration: 1.3,
    stagger: 0.12,
    ease: "power4.out",
    scrollTrigger: { trigger: "#contact", start: "top 65%" },
  });
}

/* ---------- Top scroll progress bar ---------- */
function setupScrollProgress() {
  gsap.to("#progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: true },
  });
}

/* ---------- Mouse-only effects: custom cursor + magnetic buttons ---------- */
function setupCursor() {
  const cursor = $("#cursor");
  const moveX = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3" });
  const moveY = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3" });

  addEventListener("mousemove", (event) => {
    moveX(event.clientX);
    moveY(event.clientY);
  });

  // Cursor grows into a "View" circle over project cards
  $$("[data-view]").forEach((card) => {
    card.addEventListener("mouseenter", () => cursor.classList.add("is-big"));
    card.addEventListener("mouseleave", () => cursor.classList.remove("is-big"));
  });
}

function setupMagneticButtons() {
  $$(".mag").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const box = button.getBoundingClientRect();
      gsap.to(button, {
        x: (event.clientX - box.left - box.width / 2) * 0.3,
        y: (event.clientY - box.top - box.height / 2) * 0.4,
        duration: 0.4,
      });
    });
    button.addEventListener("mouseleave", () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ---------- No animation (reduced motion, or GSAP failed to load) ---------- */
function showEverythingStatic() {
  $("#preloader")?.remove();
  $$(".word").forEach((word) => (word.style.opacity = 1));
  $$(".progress-arc").forEach((arc) => {
    arc.style.strokeDashoffset = RING_LENGTH * (1 - Number(arc.dataset.progress));
  });
  $$(".count-up").forEach((element) => (element.textContent = element.dataset.target));
  $("#timeline-line").style.transform = "scaleY(1)";
}

/* ---------- Start ---------- */
function init() {
  $("#year").textContent = new Date().getFullYear();
  setupImageFallbacks();
  splitStatementIntoWords();

  if (!window.gsap || prefersReducedMotion) {
    showEverythingStatic();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  splitNameIntoLetters();

  const lenis = setupSmoothScroll();
  playIntro(lenis);
  setupHeroMotion();
  setupStatementReveal();
  setupMarquee();
  setupRevealOnScroll();
  setupStats();
  setupProjectStack();
  setupTimeline();
  setupContactHeadline();
  setupScrollProgress();

  if (hasMouse) {
    setupCursor();
    setupMagneticButtons();
  }
}

init();