function getContent(key, fallback) {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Invalid JSON:", key);
    }
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function saveContent(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------------- SYSTEM CATEGORIES ---------------- */
const SERVICE_CATEGORIES = [
  "Training center",
  "Exam center",
  "Makeups center",
  "Nail station",
  "Tattoo station",
  "Hairdresser",
  "Barbar station",
  "Massage station"
];

/* ---------------- PRICES ---------------- */
function getDefaultPrice(category) {
  switch (category) {
    case "Nail station": return "From R80";
    case "Barbar station": return "From R40";
    case "Massage station": return "From R150";
    case "Tattoo station": return "From R200";
    case "Makeups center": return "From R120";
    case "Training center": return "From R300";
    case "Exam center": return "From R250";
    default: return "From R60";
  }
}

/* ---------------- GALLERY SOURCE ---------------- */
function getGallery() {
  return getContent("siteGallery", []);
}

/* ---------------- ABOUT ---------------- */
function getAboutDetails() {
  return getContent("siteAbout", {
    title: "More than a salon, an experience.",
    story: "Professional beauty and grooming services.",
    mission: "Helping clients look and feel confident.",
    founded: "2012",
    clients: "200+",
    looks: "15k+"
  });
}

/* ---------------- CONTACT ---------------- */
function getContactDetails() {
  return getContent("siteContact", {
    phone: "+27 11 456 7890",
    email: "bookings@vusisalon.co.za",
    address: "Johannesburg CBD"
  });
}

/* ---------------- SERVICE MAP ---------------- */
function galleryToService(item) {
  return item.category;
}
