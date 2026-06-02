const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}

let gallery = getGallery();
let editingId = null;
let uploadedImageData = "";

const form = document.getElementById("galleryForm");
const list = document.getElementById("galleryAdminList");
const search = document.getElementById("gallerySearch");
const fileInput = document.getElementById("galleryFile");
const imageInput = document.getElementById("galleryImage");
const priceInput = document.getElementById("galleryPrice");
const preview = document.getElementById("uploadPreview");
const submitBtn = document.getElementById("gallerySubmitBtn");

function updateGalleryCount() {
    const count = document.getElementById("galleryCount");

    if (count) {
        count.textContent = gallery.length + " images";
    }
}

function resetForm() {
    editingId = null;
    uploadedImageData = "";
    form.reset();
    preview.src = "images/hair1.jpg";
    submitBtn.textContent = "Save Image";
}

fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];

    if (!file) {
        uploadedImageData = "";
        return;
    }

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

imageInput.addEventListener("input", function () {
    if (imageInput.value.trim()) {
        uploadedImageData = "";
        preview.src = imageInput.value.trim();
    }
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("galleryTitle").value.trim();
    const category = document.getElementById("galleryCategory").value;
    const price = document.getElementById("galleryPrice").value.trim();
    const imagePath = imageInput.value.trim();
    const finalImage = uploadedImageData || imagePath;

    if (!title || !category || !price || !finalImage) {
        alert("Please add a title, category, price, and photo.");
        return;
    }

    if (editingId) {
        gallery = gallery.map(function (item) {
            if (item.id === editingId) {
                return {
                    ...item,
                    title: title,
                    category: category,
                    price: price,
                    image: finalImage
                };
            }

            return item;
        });
    } else {
        gallery.push({
            id: Date.now(),
            title: title,
            category: category,
            price: price,
            image: finalImage
        });
    }

    saveContent("siteGallery", gallery);
    resetForm();
    renderGalleryAdmin(gallery);
    updateGalleryCount();
});

function editGalleryImage(id) {
    const item = gallery.find(function (image) {
        return image.id === id;
    });

    if (!item) return;

    editingId = id;
    uploadedImageData = item.image.startsWith("data:image") ? item.image : "";

    document.getElementById("galleryTitle").value = item.title;
    document.getElementById("galleryCategory").value = item.category;
    document.getElementById("galleryPrice").value = item.price || getDefaultPrice(item.category);
    document.getElementById("galleryImage").value = item.image.startsWith("data:image") ? "" : item.image;

    preview.src = item.image;
    submitBtn.textContent = "Update Image";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function deleteGalleryImage(id) {
    const confirmed = confirm("Delete this gallery image?");

    if (!confirmed) return;

    gallery = gallery.filter(function (item) {
        return item.id !== id;
    });

    saveContent("siteGallery", gallery);
    renderGalleryAdmin(gallery);
    updateGalleryCount();
}

function renderGalleryAdmin(items) {
    list.innerHTML = "";

    if (items.length === 0) {
        list.innerHTML = '<p class="empty-state">No gallery images found.</p>';
        return;
    }

    items.forEach(function (item) {
        const card = document.createElement("article");
        card.className = "employee-card";

        card.innerHTML =
            '<div class="employee-card-top">' +
                "<div>" +
                    "<span>" + item.category + "</span>" +
                    "<h3>" + item.title + "</h3>" +
                    "<p>" + (item.image.startsWith("data:image") ? "Uploaded from computer" : item.image) + "</p>" +
                    "<p><b>Price:</b> " + (item.price || getDefaultPrice(item.category)) + "</p>" +
                "</div>" +
                '<img src="' + item.image + '" alt="' + item.title + '" class="admin-thumb">' +
            "</div>" +

            '<div class="employee-actions">' +
                '<button class="button" type="button" onclick="editGalleryImage(' + item.id + ')">Edit</button>' +
                '<button class="button danger-button" type="button" onclick="deleteGalleryImage(' + item.id + ')">Delete</button>' +
            "</div>";

        list.appendChild(card);
    });
}

search.addEventListener("input", function () {
    const value = search.value.toLowerCase();

    const filtered = gallery.filter(function (item) {
        return item.title.toLowerCase().includes(value) ||
            item.category.toLowerCase().includes(value) ||
            String(item.price || "").toLowerCase().includes(value);
    });

    renderGalleryAdmin(filtered);
});

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

renderGalleryAdmin(gallery);
updateGalleryCount();