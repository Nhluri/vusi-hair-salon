// ================= REQUIRE ADMIN =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}


// ================= DATA =================
let users = JSON.parse(localStorage.getItem("users")) || [];
const bookings = JSON.parse(localStorage.getItem("bookings")) || [];


// ================= HELPERS =================
function save() {
    localStorage.setItem("users", JSON.stringify(users));
    render(users);
    renderSummary();
    renderLoyalClients();
    renderServiceDemand();
}

function getUserBookings(email) {
    return bookings.filter(function (booking) {
        return booking.email &&
            booking.email.trim().toLowerCase() === email.trim().toLowerCase();
    });
}

function getUserLatestBooking(email) {
    const userBookings = getUserBookings(email);

    if (userBookings.length === 0) {
        return null;
    }

    return userBookings.sort(function (a, b) {
        return Number(b.id || 0) - Number(a.id || 0);
    })[0];
}


// ================= EDIT =================
function editUser(email) {
    const user = users.find(function (item) {
        return item.email === email;
    });

    if (!user) {
        alert("User not found");
        return;
    }

    const newName = prompt("New name", user.name);
    const newEmail = prompt("New email", user.email);

    if (!newName || !newEmail) {
        return;
    }

    users = users.map(function (item) {
        if (item.email === email) {
            return {
                ...item,
                name: newName.trim(),
                email: newEmail.trim().toLowerCase()
            };
        }

        return item;
    });

    save();
}


// ================= DELETE =================
function deleteUser(email) {
    const user = users.find(function (item) {
        return item.email === email;
    });

    if (!user) {
        alert("User not found");
        return;
    }

    const confirmed = confirm("Delete " + user.name + "?");

    if (!confirmed) {
        return;
    }

    users = users.filter(function (item) {
        return item.email !== email;
    });

    save();
}


// ================= SEARCH =================
function searchUsers() {
    const searchValue = document.getElementById("searchUser").value.trim().toLowerCase();

    const filtered = users.filter(function (user) {
        return user.name.toLowerCase().includes(searchValue) ||
            user.email.toLowerCase().includes(searchValue);
    });

    render(filtered);
}


// ================= SUMMARY =================
function renderSummary() {
    const totalUsers = document.getElementById("totalUsers");
    const customerSummary = document.getElementById("customerSummary");

    if (totalUsers) {
        totalUsers.innerText = users.length + " customers";
    }

    if (customerSummary) {
        const usersWithBookings = users.filter(function (user) {
            return getUserBookings(user.email).length > 0;
        });

        customerSummary.innerText = usersWithBookings.length + " customers have made at least one booking.";
    }
}


// ================= FEATURE 01: LOYAL CLIENTS =================
function renderLoyalClients() {
    const container = document.getElementById("loyalClients");

    if (!container) return;

    const loyalty = users.map(function (user) {
        return {
            name: user.name,
            email: user.email,
            count: getUserBookings(user.email).length
        };
    }).filter(function (user) {
        return user.count > 0;
    }).sort(function (a, b) {
        return b.count - a.count;
    }).slice(0, 5);

    if (loyalty.length === 0) {
        container.innerHTML = '<p class="empty-state">No loyal clients yet.</p>';
        return;
    }

    container.innerHTML = "";

    loyalty.forEach(function (user) {
        const item = document.createElement("article");
        item.className = "compact-item";

        item.innerHTML =
            "<div>" +
                "<strong>" + user.name + "</strong>" +
                "<span>" + user.email + "</span>" +
            "</div>" +
            '<span class="status-pill status-serving">' +
                user.count + " bookings" +
            "</span>";

        container.appendChild(item);
    });
}


// ================= FEATURE 02: SERVICE DEMAND =================
function renderServiceDemand() {
    const container = document.getElementById("clientServiceDemand");

    if (!container) return;

    const demand = {};

    bookings.forEach(function (booking) {
        const service = booking.service || "Unknown";
        demand[service] = (demand[service] || 0) + 1;
    });

    const services = Object.keys(demand);

    if (services.length === 0) {
        container.innerHTML = '<p class="empty-state">No booking demand yet.</p>';
        return;
    }

    container.innerHTML = "";

    services.sort(function (a, b) {
        return demand[b] - demand[a];
    }).forEach(function (service) {
        const row = document.createElement("div");
        row.className = "breakdown-row";

        row.innerHTML =
            "<span>" + service + "</span>" +
            "<strong>" + demand[service] + "</strong>";

        container.appendChild(row);
    });
}


// ================= RENDER =================
function render(list) {
    const container = document.getElementById("userList");

    if (!container) return;

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = '<p class="empty-state">No users found.</p>';
        return;
    }

    list.forEach(function (user) {
        const userBookings = getUserBookings(user.email);
        const latestBooking = getUserLatestBooking(user.email);

        const card = document.createElement("article");
        card.className = "user-card";

        card.innerHTML =
            '<div class="user-card-top">' +
                "<div>" +
                    "<span>Customer</span>" +
                    "<h3>" + user.name + "</h3>" +
                    "<p>" + user.email + "</p>" +
                "</div>" +
                '<span class="status-pill status-waiting">' +
                    userBookings.length + " bookings" +
                "</span>" +
            "</div>" +

            '<div class="user-meta">' +
                "<p><b>Latest service:</b> " + (latestBooking ? latestBooking.service : "None yet") + "</p>" +
                "<p><b>Last appointment:</b> " + (latestBooking ? latestBooking.date || "-" : "-") + "</p>" +
            "</div>" +

            '<div class="employee-actions">' +
                '<button type="button" class="button" onclick="editUser(\'' + user.email + '\')">Edit</button>' +
                '<button type="button" class="button danger-button" onclick="deleteUser(\'' + user.email + '\')">Delete</button>' +
            "</div>";

        container.appendChild(card);
    });
}


// ================= EVENTS =================
const searchInput = document.getElementById("searchUser");

if (searchInput) {
    searchInput.addEventListener("input", searchUsers);
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}


// ================= INIT =================
render(users);
renderSummary();
renderLoyalClients();
renderServiceDemand();