function getContent(key, fallback) {
    const saved = localStorage.getItem(key);

    if (saved) {
        return JSON.parse(saved);
    }

    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
}

function saveContent(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function normalizeGalleryItems(items) {
    return items.map(function (item) {
        return {
            id: item.id,
            title: item.title,
            category: item.category,
            image: item.image,
            price: item.price || getDefaultPrice(item.category)
        };
    });
}

function getDefaultPrice(category) {
    if (category === "Nails") return "From R80";
    if (category === "Beard") return "From R40";
    return "From R60";
}

function getGallery() {
    const gallery = getContent("siteGallery", [
        {
            id: 1,
            title: "Signature Haircut",
            category: "Hair",
            image: "images/hair1.jpg",
            price: "From R60"
        },
        {
            id: 2,
            title: "Nail Studio Finish",
            category: "Nails",
            image: "images/nails1.jpg",
            price: "From R80"
        },
        {
            id: 3,
            title: "Beard Grooming",
            category: "Beard",
            image: "images/beard1.jpg",
            price: "From R40"
        }
    ]);

    const normalized = normalizeGalleryItems(gallery);
    saveContent("siteGallery", normalized);

    return normalized;
}

function getContactDetails() {
    return getContent("siteContact", {
        phone: "+27 11 456 7890",
        email: "bookings@vusisalon.co.za",
        address: "128 Commissioner Street, Johannesburg CBD",
        hours: "Mon-Fri 08:00-18:00 | Sat-Sun 09:00-17:00",
        whatsapp: "+27 72 000 0000"
    });
}

function getAboutDetails() {
    return getContent("siteAbout", {
        title: "More than a salon, an experience.",
        story: "Vusi's Hair Salon is built around clean execution, premium grooming, and personal confidence.",
        mission: "To help every client leave sharper, calmer, and more confident than they arrived.",
        founded: "2012",
        clients: "200+",
        looks: "15k+"
    });
}

function galleryToService(item) {
    if (item.category === "Nails") return "Nails";
    if (item.category === "Beard") return "Beard Trim";
    return "Haircut";
}

function selectService(service, imgPath) {
    localStorage.setItem("selectedService", service);
    localStorage.setItem("selectedImage", imgPath);

    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
        alert("Please create an account to book your appointment.");
        window.location.href = "register.html";
        return;
    }

    window.location.href = "home.html";
}