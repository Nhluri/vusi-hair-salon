/* Global content */
const gallery = getGallery();
const about = getAboutDetails();
const contact = getContactDetails();

let selectedCategory = "All";

/* =========================
   MENU
========================= */
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const toggle = document.querySelector(".menu-toggle");
  navLinks.classList.toggle("is-open");
  const isOpen = navLinks.classList.contains("is-open");
  toggle.setAttribute("aria-expanded", isOpen);
  toggle.textContent = isOpen ? "Close" : "Menu";
}

/* =========================
   HELPERS
========================= */
function getRandomItems(arr, count) {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* =========================
   FILTER SETUP
========================= */
function setupFilter() {
  const filter = document.getElementById("serviceFilter");
  if (!filter) return;

  filter.innerHTML = `<option value="All">Select a category</option>`;
  SERVICE_CATEGORIES.forEach(cat => {
    filter.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  filter.addEventListener("change", function () {
    selectedCategory = this.value;
    renderServices();
    renderLandingGallery();
  });
}

/* =========================
   SERVICES (CAROUSEL)
========================= */
function renderServices() {
  const wrap = document.getElementById("servicesCarouselWrap");
  const track = document.getElementById("servicesCarousel");
  const dots = document.getElementById("servicesDots");
  const prev = document.getElementById("servicesPrev");
  const next = document.getElementById("servicesNext");

  if (!track) return;

  track.innerHTML = "";

  let items = selectedCategory === "All"
    ? getRandomItems(gallery, 8)
    : gallery.filter(g => g.category === selectedCategory);

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "carousel-card";
    card.innerHTML = `
      <button class="service-button" onclick="selectService('${item.category}','${item.image}')">
        <img src="${item.image}" alt="${item.title}">
        <div class="carousel-info">
          <h3>${item.title}</h3>
          <p>${item.category} • ${item.price || getDefaultPrice(item.category)}</p>
        </div>
      </button>
    `;
    track.appendChild(card);
  });

  setupCarousel(wrap, track, dots, prev, next);
}

/* =========================
   LANDING GALLERY (CAROUSEL)
========================= */
function renderLandingGallery() {
  const wrap = document.getElementById("galleryCarouselWrap");
  const track = document.getElementById("galleryCarousel");
  const dots = document.getElementById("galleryDots");
  const prev = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");

  if (!track) return;

  track.innerHTML = "";

  let items = selectedCategory === "All"
    ? getRandomItems(gallery, 12)
    : gallery.filter(g => g.category === selectedCategory);

  items.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "carousel-card";
    btn.onclick = () => selectService(item.category, item.image);
    btn.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div class="carousel-info">
        <h3>${item.title}</h3>
        <p>${item.category}</p>
      </div>
    `;
    track.appendChild(btn);
  });

  setupCarousel(wrap, track, dots, prev, next);
}

/* =========================
   UNIFIED CAROUSEL SETUP
   - Adds dots, updates active dot on scroll
   - Prev/Next buttons page by page
========================= */
function setupCarousel(wrap, track, dotsEl, prevBtn, nextBtn) {
  if (!wrap || !track || !dotsEl) return;

  // Build dots (one dot per “page”)
  const cardWidth = track.querySelector(".carousel-card")?.getBoundingClientRect().width || 280;
  const gapPx = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "16");
  const viewportWidth = wrap.getBoundingClientRect().width;
  const perPage = Math.max(1, Math.floor((viewportWidth + gapPx) / (cardWidth + gapPx)));
  const totalCards = track.children.length;
  const totalPages = Math.max(1, Math.ceil(totalCards / perPage));

  dotsEl.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Go to page ${i + 1}`);
    dot.addEventListener("click", () => {
      const scrollTo = i * (cardWidth + gapPx) * perPage;
      track.scrollTo({ left: scrollTo, behavior: "smooth" });
    });
    dotsEl.appendChild(dot);
  }

  function updateDotsAndArrows() {
    const scrollLeft = track.scrollLeft;
    const approxPage = Math.round(scrollLeft / ((cardWidth + gapPx) * perPage));
    const active = clamp(approxPage, 0, totalPages - 1);

    [...dotsEl.children].forEach((d, i) => {
      d.classList.toggle("is-active", i === active);
    });

    if (prevBtn) prevBtn.disabled = active <= 0;
    if (nextBtn) nextBtn.disabled = active >= totalPages - 1;
  }

  updateDotsAndArrows();

  track.addEventListener("scroll", () => {
    // Throttle via rAF for performance
    if (track._scrolling) return;
    track._scrolling = true;
    requestAnimationFrame(() => {
      updateDotsAndArrows();
      track._scrolling = false;
    });
  });

  function pageBy(delta) {
    const currentLeft = track.scrollLeft;
    const step = (cardWidth + gapPx) * perPage;
    const target = currentLeft + delta * step;
    track.scrollTo({ left: target, behavior: "smooth" });
  }

  if (prevBtn) prevBtn.onclick = () => pageBy(-1);
  if (nextBtn) nextBtn.onclick = () => pageBy(1);

  // Initialize first dot
  const firstDot = dotsEl.querySelector(".carousel-dot");
  if (firstDot) firstDot.classList.add("is-active");

  // Recompute on resize to keep dots accurate
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setupCarousel(wrap, track, dotsEl, prevBtn, nextBtn);
    }, 200);
  }, { passive: true });
}

/* =========================
   SITE CONTENT
========================= */
function applySiteContent() {
  if (about) {
    document.getElementById("about-title").textContent = about.title;
    document.getElementById("aboutStoryText").textContent = about.story;
    document.getElementById("heroStory").textContent = about.mission;
    document.getElementById("clientsStat").textContent = about.clients;
    document.getElementById("looksStat").textContent = about.looks;
    document.getElementById("foundedStat").textContent = about.founded;
  }

  if (contact) {
    document.getElementById("footerText").textContent =
      "Vusi's Hair Salon — " + contact.address;
  }

  if (gallery.length > 0) {
    document.getElementById("heroImage").src = gallery[0].image;
  }
}

/* =========================
   BOOKING FLOW
========================= */
function selectService(category, imgPath) {
  localStorage.setItem("selectedService", category);
  localStorage.setItem("selectedImage", imgPath);

  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    alert("Please register to continue.");
    window.location.href = "register.html";
    return;
  }

  window.location.href = "home.html";
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Menu toggle button hookup
  const menuBtn = document.getElementById("menuToggle");
  if (menuBtn) {
    menuBtn.addEventListener("click", toggleMenu);
  }

  setupFilter();
  applySiteContent();
  renderServices();
  renderLandingGallery();

  // Explore services button scrolls to services section
  const exploreBtn = document.getElementById("exploreServicesBtn");
  const servicesSection = document.getElementById("services");
  if (exploreBtn && servicesSection) {
    exploreBtn.addEventListener("click", () => {
      servicesSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});
