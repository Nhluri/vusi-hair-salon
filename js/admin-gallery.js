const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}

let gallery = getGallery();
let editingId = null;
let uploadedImageData = "";
let fallbackEditingImage = "";

const form = document.getElementById("galleryForm");
const list = document.getElementById("galleryAdminList");
const search = document.getElementById("gallerySearch");
const fileInput = document.getElementById("galleryFile");
const imageInput = document.getElementById("galleryImage");
const preview = document.getElementById("uploadPreview");
const submitBtn = document.getElementById("gallerySubmitBtn");
const categorySelect = document.getElementById("galleryCategory");
const formPanelTitle = document.getElementById("formPanelTitle");

const DEFAULT_BLANK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23aab4c4' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>";

/* =========================
   EXPLICIT LOGOUT ROUTINE
========================= */
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

/* =========================
   POPULATE CATEGORY DROPDOWN
========================= */
if (typeof SERVICE_CATEGORIES !== 'undefined' && Array.isArray(SERVICE_CATEGORIES)) {
    categorySelect.innerHTML = "";
    SERVICE_CATEGORIES.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
} else {
    const fallbacks = ["Haircut", "Beard", "Nails"];
    categorySelect.innerHTML = "";
    fallbacks.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

/* =========================
   VALIDATION
========================= */
function isValidCategory(category) {
    if (typeof SERVICE_CATEGORIES !== 'undefined' && Array.isArray(SERVICE_CATEGORIES)) {
        return SERVICE_CATEGORIES.includes(category);
    }
    return ["Haircut", "Beard", "Nails"].includes(category);
}

/* =========================
   COUNT
========================= */
function updateGalleryCount() {
    const count = document.getElementById("galleryCount");
    if (count) count.textContent = gallery.length + " images";
}

/* =========================
   RESET FORM
========================= */
function resetForm() {
    editingId = null;
    uploadedImageData = "";
    fallbackEditingImage = "";
    form.reset();
    preview.src = DEFAULT_BLANK_SVG;
    submitBtn.textContent = "Save Image";
    if (formPanelTitle) formPanelTitle.textContent = "Add gallery image";
}

/* =========================
   FILE UPLOAD
========================= */
fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        fileInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        uploadedImageData = reader.result;
        preview.src = uploadedImageData;
        imageInput.value = ""; 
    };

    reader.readAsDataURL(file);
});

/* =========================
   IMAGE URL INPUT
========================= */
imageInput.addEventListener("input", function () {
    if (imageInput.value.trim()) {
        uploadedImageData = "";
        fileInput.value = ""; 
        preview.src = imageInput.value.trim();
    }
});

/* =========================
   SUBMIT (ADD / EDIT)
========================= */
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("galleryTitle").value.trim();
    const category = categorySelect.value;
    const price = document.getElementById("galleryPrice").value.trim();
    const imagePath = imageInput.value.trim();
    
    const finalImage = uploadedImageData || imagePath || fallbackEditingImage;

    if (!title || !category || !price || !finalImage) {
        alert("Please complete all required data and make sure an image exists.");
        return;
    }

    if (!isValidCategory(category)) {
        alert("Invalid category selected");
        return;
    }

    if (editingId) {
        gallery = gallery.map(item =>
            item.id === editingId
                ? { ...item, title, category, price, image: finalImage }
                : item
        );
    } else {
        gallery.push({
            id: Date.now(),
            title,
            category,
            price,
            image: finalImage
        });
    }

    saveContent("siteGallery", gallery);
    resetForm();
    renderGalleryAdmin(gallery);
    updateGalleryCount();
});

/* =========================
   EDIT MODE TRIGGER
========================= */
function editGalleryImage(id) {
    const item = gallery.find(img => img.id === id);
    if (!item) return;

    editingId = id;
    fallbackEditingImage = item.image; 

    document.getElementById("galleryTitle").value = item.title;
    categorySelect.value = item.category;
    document.getElementById("galleryPrice").value = item.price;
    
    if (item.image.startsWith("data:image")) {
        document.getElementById("galleryImage").value = "";
    } else {
        document.getElementById("galleryImage").value = item.image;
    }

    fileInput.value = "";
    uploadedImageData = "";
    preview.src = item.image;
    submitBtn.textContent = "Update Image";
    if (formPanelTitle) formPanelTitle.textContent = "Edit current image";
}

/* =========================
   DELETE
========================= */
function deleteGalleryImage(id) {
    if (!confirm("Delete this image?")) return;

    gallery = gallery.filter(item => item.id !== id);

    saveContent("siteGallery", gallery);
    renderGalleryAdmin(gallery);
    updateGalleryCount();
}

/* =========================
   RENDER (CLEAN CATEGORY GROUPING)
========================= */
function renderGalleryAdmin(items) {
    list.innerHTML = "";

    if (!items || !items.length) {
        list.innerHTML = "<p class='empty-state' style='color:var(--muted); padding:2rem; text-align:center;'>No library visuals found.</p>";
        return;
    }

    const grouped = {};

    items.forEach(item => {
        const cat = item.category || "Unassigned";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    Object.keys(grouped).forEach(category => {
        const groupWrapper = document.createElement("div");
        groupWrapper.style.marginBottom = "2rem";

        const header = document.createElement("div");
        header.className = "category-group-title";
        header.textContent = category;
        groupWrapper.appendChild(header);

        grouped[category].forEach(item => {
            const card = document.createElement("article");
            card.className = "employee-card";
            card.style.marginBottom = "1rem";

            card.innerHTML = `
                <div class="employee-card-top" style="display:flex; justify-content:space-between; align-items:center; gap:1rem; width:100%;">
                    <div style="flex:1;">
                        <span style="font-size:0.75rem; text-transform:uppercase; color:var(--blue); font-weight:700;">${item.category}</span>
                        <h3 style="margin: 0.2rem 0; color:var(--cream); font-size:1.2rem;">${item.title}</h3>
                        <p style="margin:0; color:var(--muted); font-size:0.9rem;">${item.price}</p>
                    </div>
                    <img src="${item.image}" class="admin-thumb" alt="${item.title}" />
                </div>
                <div class="employee-actions" style="margin-top:1rem; display:flex; gap:0.5rem;">
                    <button class="button" style="padding: 0.4rem 1rem; font-size:0.85rem;" onclick="editGalleryImage(${item.id})">Edit</button>
                    <button class="button danger-button" style="padding: 0.4rem 1rem; font-size:0.85rem;" onclick="deleteGalleryImage(${item.id})">Delete</button>
                </div>
            `;
            groupWrapper.appendChild(card);
        });

        list.appendChild(groupWrapper);
    });
}

/* =========================
   SEARCH
========================= */
search.addEventListener("input", function () {
    const value = search.value.toLowerCase();

    const filtered = gallery.filter(item =>
        item.title.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value)
    );

    renderGalleryAdmin(filtered);
});

/* =========================
   INIT
========================= */
renderGalleryAdmin(gallery);
updateGalleryCount();