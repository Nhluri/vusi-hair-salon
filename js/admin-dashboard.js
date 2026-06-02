// ================= REQUIRE ADMIN =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}


// ================= DATA =================
const users = JSON.parse(localStorage.getItem("users")) || [];
const savedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
const walkins = JSON.parse(localStorage.getItem("walkins")) || [];
const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

const galleryItems = typeof getGallery === "function" ? getGallery() : [];
const aboutDetails = typeof getAboutDetails === "function" ? getAboutDetails() : null;
const contactDetails = typeof getContactDetails === "function" ? getContactDetails() : null;

const systemEmployees = [
    {
        id: 1,
        name: "John Barber",
        email: "employee@salon.com",
        password: "emp123",
        role: "employee"
    }
];

const employees = systemEmployees.concat(savedEmployees);


// ================= HELPERS =================
function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    return yyyy + "-" + mm + "-" + dd;
}

function getServiceName(item) {
    return item.service || "Walk-in";
}

function getClientName(item) {
    return item.customer || item.name || "Client";
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}


// ================= FIXED COUNTS =================
const totalCustomers = users.length + walkins.length;
const totalEmployees = employees.length;
const queueCount = walkins.length;
const bookingCount = bookings.length;

setText("usersCount", totalCustomers);
setText("employeeCount", totalEmployees);
setText("queueCount", queueCount);
setText("bookingCount", bookingCount);


// ================= TODAY SUMMARY =================
const todayDate = getTodayDate();

const todayBookings = bookings.filter(function (booking) {
    return booking.date === todayDate;
});

setText("todayBookingsCount", todayBookings.length + " bookings");

const todaySummaryText = document.getElementById("todaySummaryText");

if (todaySummaryText) {
    if (todayBookings.length === 0) {
        todaySummaryText.innerText = "No appointments scheduled today.";
    } else {
        todaySummaryText.innerText = "You have " + todayBookings.length + " scheduled appointments today.";
    }
}


// ================= FEATURE 01: QUEUE HEALTH =================
const waitingWalkins = walkins.filter(function (walkin) {
    return walkin.status === "waiting";
});

const waitingBookings = bookings.filter(function (booking) {
    return booking.status === "waiting";
});

const totalWaiting = waitingWalkins.length + waitingBookings.length;
const queueHealthPercent = Math.min((totalWaiting / 30) * 100, 100);

const queueHealthStatus = document.getElementById("queueHealthStatus");
const queueHealthBar = document.getElementById("queueHealthBar");
const queueHealthMessage = document.getElementById("queueHealthMessage");

if (queueHealthBar) {
    queueHealthBar.style.width = queueHealthPercent + "%";
}

if (queueHealthStatus && queueHealthMessage) {
    if (totalWaiting >= 30) {
        queueHealthStatus.innerText = "Critical";
        queueHealthMessage.innerText = "The salon is overloaded. Add staff support or slow new walk-ins.";
    } else if (totalWaiting >= 15) {
        queueHealthStatus.innerText = "Busy";
        queueHealthMessage.innerText = "Queue pressure is building. Watch employee workloads closely.";
    } else {
        queueHealthStatus.innerText = "Calm";
        queueHealthMessage.innerText = "The salon queue is under control.";
    }
}


// ================= FEATURE 02: POPULAR SERVICES =================
const popularServices = document.getElementById("popularServices");
const serviceCounts = {};

bookings.concat(walkins).forEach(function (item) {
    const service = getServiceName(item);
    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
});

if (popularServices) {
    const services = Object.keys(serviceCounts);

    if (services.length === 0) {
        popularServices.innerHTML = '<p class="empty-state">No service data yet.</p>';
    } else {
        popularServices.innerHTML = "";

        services
            .sort(function (a, b) {
                return serviceCounts[b] - serviceCounts[a];
            })
            .forEach(function (service) {
                const row = document.createElement("div");
                row.className = "breakdown-row";

                row.innerHTML =
                    "<span>" + service + "</span>" +
                    "<strong>" + serviceCounts[service] + "</strong>";

                popularServices.appendChild(row);
            });
    }
}


// ================= EMPLOYEE WORKLOAD =================
const employeeLoadList = document.getElementById("employeeLoadList");

if (employeeLoadList) {
    employeeLoadList.innerHTML = "";

    if (employees.length === 0) {
        employeeLoadList.innerHTML = '<p class="empty-state">No employees found.</p>';
    } else {
        employees.forEach(function (employee) {
            const assignedWalkins = walkins.filter(function (walkin) {
                return walkin.employee === employee.name && walkin.status !== "completed";
            });

            const assignedBookings = bookings.filter(function (booking) {
                return booking.employee === employee.name && booking.status !== "completed";
            });

            const assignedTotal = assignedWalkins.length + assignedBookings.length;

            const item = document.createElement("article");
            item.className = "compact-item";

            item.innerHTML =
                "<div>" +
                    "<strong>" + employee.name + "</strong>" +
                    "<span>" + assignedTotal + " active clients</span>" +
                "</div>" +
                '<span class="status-pill ' + (assignedTotal >= 20 ? "status-serving" : "status-waiting") + '">' +
                    (assignedTotal >= 20 ? "Heavy" : "OK") +
                "</span>";

            employeeLoadList.appendChild(item);
        });
    }
}


// ================= LATEST ACTIVITY =================
const latestActivity = document.getElementById("latestActivity");

if (latestActivity) {
    const activity = bookings.concat(walkins)
        .sort(function (a, b) {
            return Number(b.id || 0) - Number(a.id || 0);
        })
        .slice(0, 5);

    if (activity.length === 0) {
        latestActivity.innerHTML = '<p class="empty-state">No recent activity yet.</p>';
    } else {
        latestActivity.innerHTML = "";

        activity.forEach(function (item) {
            const row = document.createElement("article");
            row.className = "compact-item";

            row.innerHTML =
                "<div>" +
                    "<strong>" + getClientName(item) + "</strong>" +
                    "<span>" + getServiceName(item) + " with " + (item.employee || "Unassigned") + "</span>" +
                "</div>" +
                '<span class="status-pill status-waiting">' +
                    (item.code ? "Walk-in" : "Booking") +
                "</span>";

            latestActivity.appendChild(row);
        });
    }
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}