// Shared by every page. Each feature only runs if its elements are on the page.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $$(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

  // Scroll progress + nav state
  const bar = $(".progress span");
  const nav = $(".nav");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (nav) nav.classList.toggle("is-scrolled", scrollY > 10);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = $(".nav__toggle");
  const menu = $("#mobile-menu");
  if (toggle && menu) {
    const setMenu = (open) => {
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
    };
    toggle.addEventListener("click", () => setMenu(menu.hidden));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  // Reveal on scroll, staggered within each parent
  const reveals = $$(".reveal").filter((el) => el.getBoundingClientRect().top > innerHeight);
  reveals.forEach((el) => {
    const siblings = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
    el.classList.add("is-below");
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Count up stats
  const fmt = new Intl.NumberFormat("en-US");
  const countUp = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = fmt.format(target) + suffix; return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1600, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt.format(Math.round(target * eased)) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { countUp(e.target); statIO.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => statIO.observe(el));

  // Headings marked data-decode scramble into place when they scroll into view
  const decodeChars = "01ABCDEFGHKLNOPRSTUXYZ#/";
  const decodeIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      decodeIO.unobserve(e.target);
      const el = e.target, text = el.textContent;
      if (el.tagName !== "SPAN") el.setAttribute("aria-label", text);
      let frame = 0;
      const timer = setInterval(() => {
        frame++;
        el.textContent = [...text].map((c, n) => (n < frame / 2 || c === " " ? c : decodeChars[Math.floor(Math.random() * decodeChars.length)])).join("");
        if (frame / 2 >= text.length) { el.textContent = text; clearInterval(timer); }
      }, 45);
    });
  }, { threshold: 0.4 });
  if (!reduceMotion) $$("[data-decode]").forEach((el) => decodeIO.observe(el));

  // Glow on cards follows the pointer
  $$(".page-dark .channel-card, .page-dark .stack__item, .timeline__card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Scale the cropped Instagram grids to fit their cards
  $$(".ig-window").forEach((box) => {
    new ResizeObserver(([entry]) => {
      box.style.setProperty("--ig-scale", entry.contentRect.width / 980);
    }).observe(box);
    const frame = $("iframe", box);
    frame.addEventListener("load", () => setTimeout(() => frame.classList.add("is-loaded"), 1500));
  });

  // Page background: a drifting network of points that reaches toward the pointer
  const net = $("#net");
  if (net) {
    const ctx = net.getContext("2d");
    const touch = matchMedia("(pointer: coarse)").matches;
    let nodes = [], W = 0, H = 0;
    const pointer = { x: -999, y: -999 };
    const size = () => {
      W = innerWidth;
      H = innerHeight;
      // Draw at the screen's real resolution, or thin lines turn faint on phones
      const dpr = Math.min(devicePixelRatio || 1, 2);
      net.width = W * dpr;
      net.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length || !W) return;
      const count = Math.round(Math.min(90, Math.max(28, (W * H) / 14000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      }));
    };
    const line = (a, b, reach, alpha) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > reach) return;
      ctx.strokeStyle = `rgba(75, 104, 240, ${(1 - d / reach) * alpha})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach((n, i) => {
        n.x = (n.x + n.vx + W) % W;
        n.y = (n.y + n.vy + H) % H;
        for (let j = i + 1; j < nodes.length; j++) line(n, nodes[j], 140, touch ? 0.8 : 0.5);
        line(n, pointer, 200, 0.9);
        ctx.fillStyle = "#4b68f0";
        ctx.fillRect(n.x - 1.5, n.y - 1.5, 3, 3);
      });
    };
    addEventListener("resize", size);
    addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    // A finger lifting shouldn't leave lines reaching toward where it was
    if (touch) addEventListener("pointerup", () => { pointer.x = pointer.y = -999; }, { passive: true });
    size();
    if (reduceMotion) draw();
    else {
      let last = 0;
      const loop = (now) => {
        requestAnimationFrame(loop);
        if (document.hidden || now - last < 33) return;
        last = now;
        if (!nodes.length) size();
        draw();
      };
      requestAnimationFrame(loop);
    }
  }

  // Highlight the nav link for the section in view
  const links = $$(".nav__links a[href^='#']");
  if (links.length) {
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => sectionIO.observe(s));
  }

  // Mascot: squishes when poked and springs back after a drag
  const mascot = $("#mascot");
  if (mascot) {
    let drag = null;
    mascot.addEventListener("pointerdown", (e) => {
      drag = { x: e.clientX, y: e.clientY, moved: false };
      mascot.setPointerCapture(e.pointerId);
      mascot.style.cursor = "grabbing";
    });
    mascot.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      // On touch a vertical swipe scrolls the page, so the logo only follows sideways
      const dy = e.pointerType === "touch" ? 0 : e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 4) drag.moved = true;
      mascot.style.translate = `${dx}px ${dy}px`;
    });
    // A cancelled pointer means the finger is scrolling the page, so that isn't a poke
    const release = (e) => {
      if (!drag) return;
      if (!drag.moved && e.type === "pointerup") {
        mascot.classList.remove("is-squish");
        void mascot.offsetWidth;
        mascot.classList.add("is-squish");
      }
      mascot.style.transition = "translate .7s cubic-bezier(.3,1.6,.5,1)";
      mascot.style.translate = "0 0";
      setTimeout(() => (mascot.style.transition = ""), 700);
      mascot.style.cursor = "";
      drag = null;
    };
    mascot.addEventListener("pointerup", release);
    mascot.addEventListener("pointercancel", release);
    mascot.addEventListener("animationend", (e) => {
      if (e.animationName === "squish") mascot.classList.remove("is-squish");
    });
  }

  // Card tilt on hover (mouse only)
  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
        card.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  // Drag to scroll photo gallery. Capturing only after real movement keeps plain clicks on the photos.
  const gallery = $(".gallery");
  if (gallery) {
    let g = null;
    gallery.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") g = { x: e.clientX, left: gallery.scrollLeft, id: e.pointerId, moved: false };
    });
    gallery.addEventListener("pointermove", (e) => {
      if (!g) return;
      if (!g.moved && Math.abs(e.clientX - g.x) > 6) {
        g.moved = true;
        gallery.classList.add("is-dragging");
        gallery.setPointerCapture(g.id);
      }
      if (g.moved) gallery.scrollLeft = g.left - (e.clientX - g.x);
    });
    const endG = () => { g = null; gallery.classList.remove("is-dragging"); };
    gallery.addEventListener("pointerup", endG);
    gallery.addEventListener("pointercancel", endG);
  }

  // Full screen photo viewer with caption. The headshot joins in once the placeholder is replaced.
  const viewer = $("#photo-view");
  if (viewer) {
    const photos = $$(".gallery figure, .headshot").filter((f) => !$("img", f).src.includes("placeholder"));
    const big = $(".photo-view__stage img", viewer);
    const caption = $(".photo-view__caption", viewer);
    let at = 0;
    const show = (i) => {
      at = (i + photos.length) % photos.length;
      const img = $("img", photos[at]);
      big.src = img.src;
      big.alt = img.alt;
      big.classList.remove("is-zoomed");
      caption.textContent = $("figcaption", photos[at]).textContent;
    };
    photos.forEach((f, i) => {
      f.classList.add("is-zoomable");
      f.tabIndex = 0;
      f.setAttribute("role", "button");
      f.setAttribute("aria-label", `View full screen: ${$("figcaption", f).textContent}`);
      f.addEventListener("click", () => { show(i); viewer.showModal(); });
      f.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(i); viewer.showModal(); }
      });
    });
    // The zoom follows the pointer or finger, measured from the stage so the zoom itself doesn't skew it
    const stage = $(".photo-view__stage", viewer);
    const aim = (e) => {
      const s = stage.getBoundingClientRect();
      const pct = (offset, size) => Math.min(Math.max(offset / size + 0.5, 0), 1) * 100;
      const x = pct(e.clientX - (s.left + s.width / 2), big.offsetWidth);
      const y = pct(e.clientY - (s.top + s.height / 2), big.offsetHeight);
      big.style.transformOrigin = `${x}% ${y}%`;
    };
    big.addEventListener("click", (e) => {
      if (!big.classList.contains("is-zoomed")) aim(e);
      big.classList.toggle("is-zoomed");
    });
    big.addEventListener("pointermove", (e) => {
      if (big.classList.contains("is-zoomed")) aim(e);
    });
    $(".photo-view__close", viewer).addEventListener("click", () => viewer.close());
    $(".photo-view__prev", viewer).addEventListener("click", () => show(at - 1));
    $(".photo-view__next", viewer).addEventListener("click", () => show(at + 1));
    viewer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
    $(".photo-view__stage", viewer).addEventListener("click", (e) => {
      if (e.target !== big) viewer.close();
    });
  }

  // Contact form opens the visitor's email app with the message filled in.
  // The address is assembled here so it isn't sitting in the page for scrapers to collect.
  const form = $("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const to = ["lilyybiros", "gmail.com"].join("@");
      const subject = encodeURIComponent(`Portfolio inquiry from ${d.get("name")}`);
      const body = encodeURIComponent(`${d.get("message")}\n\n${d.get("name")} (${d.get("email")})`);
      location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      $("#form-note").textContent = "Your email app should open with this message ready to send.";
    });
  }
})();
