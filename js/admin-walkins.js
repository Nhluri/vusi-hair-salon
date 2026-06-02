// ================= REQUIRE ADMIN =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}


// ================= DATA =================
let savedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
let walkins = JSON.parse(localStorage.getItem("walkins")) || [];
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];

const systemEmployees = [
    {
        id: 1,
        name: "John Barber",
        email: "employee@salon.com",
        password: "emp123",
        role: "employee",
        specialty: "Beard Grooming",
        availability: "Available",
        system: true
    }
];

const employees = systemEmployees.concat(savedEmployees);


// ================= HELPERS =================
function saveWalkins() {
    localStorage.setItem("walkins", JSON.stringify(walkins));
}

function saveUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

function getStatusClass(status) {
    if (status === "serving") return "status-serving";
    if (status === "completed") return "status-completed";
    return "status-waiting";
}

function getStatusLabel(status) {
    if (status === "serving") return "In progress";
    if (status === "completed") return "Completed";
    return "Waiting";
}

function getEmployeeActiveCount(employeeName) {
    const activeWalkins = walkins.filter(function (walkin) {
        return walkin.employee === employeeName && walkin.status !== "completed";
    });

    const activeBookings = bookings.filter(function (booking) {
        return booking.employee === employeeName && booking.status !== "completed";
    });

    return activeWalkins.length + activeBookings.length;
}

function getLeastBusyEmployee() {
    if (employees.length === 0) {
        return null;
    }

    const availableEmployees = employees.filter(function (employee) {
        return employee.availability !== "Off Duty";
    });

    const pool = availableEmployees.length > 0 ? availableEmployees : employees;

    return pool.sort(function (a, b) {
        return getEmployeeActiveCount(a.name) - getEmployeeActiveCount(b.name);
    })[0];
}

function addWalkinToCustomers(name, email) {
    const normalizedEmail = email.trim().toLowerCase();

    const exists = users.find(function (user) {
        return user.email && user.email.trim().toLowerCase() === normalizedEmail;
    });

    if (exists) {
        return;
    }

    users.push({
        id: Date.now(),
        name: name,
        email: normalizedEmail,
        password: "",
        role: "walk-in-customer",
        source: "walk-in"
    });

    saveUsers();
}

function getNextQueueCode() {
    const nextNumber = walkins.length + 1;
    return "Q" + String(nextNumber).padStart(3, "0");
}

function estimateWaitMinutes(waitingCount) {
    return waitingCount * 25;
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}


// ================= ADD WALK-IN =================
function addWalkIn() {
    const name = document.getElementById("walkName").value.trim();
    const email = document.getElementById("walkEmail").value.trim().toLowerCase();
    const service = document.getElementById("walkService").value;

    if (!name || !email || !service) {
        alert("Please fill all fields");
        return;
    }

    const employee = getLeastBusyEmployee();

    if (!employee) {
        alert("No employees available");
        return;
    }

    const code = getNextQueueCode();

    const walkin = {
        id: Date.now(),
        name: name,
        email: email,
        service: service,
        code: code,
        employee: employee.name,
        status: "waiting",
        order: walkins.length + 1,
        createdAt: new Date().toISOString()
    };

    walkins.push(walkin);
    saveWalkins();

    // Walk-ins are also customers
    addWalkinToCustomers(name, email);

    alert("Queue Number: " + code + " | Assigned to: " + employee.name);

    document.getElementById("walkinForm").reset();

    renderAll();
}


// ================= UPDATE WALK-IN STATUS =================
function updateWalkinStatus(id, status) {
    walkins = walkins.map(function (walkin) {
        if (walkin.id === id) {
            walkin.status = status;
        }

        return walkin;
    });

    saveWalkins();
    renderAll();
}


// ================= RENDER SUMMARY =================
function renderSummary() {
    const waitingWalkins = walkins.filter(function (walkin) {
        return walkin.status === "waiting";
    });

    const waitingCount = waitingWalkins.length;
    const estimate = estimateWaitMinutes(waitingCount);

    const queueStatus = document.getElementById("queueStatus");
    const queueSummary = document.getElementById("queueSummary");
    const waitingCountElement = document.getElementById("waitingCount");
    const waitEstimate = document.getElementById("waitEstimate");
    const walkinQueueBar = document.getElementById("walkinQueueBar");

    if (queueStatus) {
        if (waitingCount >= 20) {
            queueStatus.innerText = "Heavy";
        } else if (waitingCount >= 10) {
            queueStatus.innerText = "Busy";
        } else {
            queueStatus.innerText = "Calm";
        }
    }

    if (queueSummary) {
        queueSummary.innerText = waitingCount + " walk-in customers currently waiting.";
    }

    if (waitingCountElement) {
        waitingCountElement.innerText = waitingCount + " waiting";
    }

    if (waitEstimate) {
        waitEstimate.innerText = "Estimated total queue wait: about " + estimate + " minutes.";
    }

    if (walkinQueueBar) {
        walkinQueueBar.style.width = Math.min((waitingCount / 20) * 100, 100) + "%";
    }
}


// ================= FEATURE 02: EMPLOYEE QUEUE LOAD =================
function renderEmployeeLoad() {
    const container = document.getElementById("employeeQueueLoad");

    if (!container) return;

    container.innerHTML = "";

    if (employees.length === 0) {
        container.innerHTML = '<p class="empty-state">No employees available.</p>';
        return;
    }

    employees.forEach(function (employee) {
        const activeCount = getEmployeeActiveCount(employee.name);

        const item = document.createElement("article");
        item.className = "compact-item";

        item.innerHTML =
            "<div>" +
                "<strong>" + employee.name + "</strong>" +
                "<span>" + activeCount + " active clients</span>" +
            "</div>" +
            '<span class="status-pill ' + (activeCount >= 20 ? "status-serving" : "status-waiting") + '">' +
                (activeCount >= 20 ? "Heavy" : "OK") +
            "</span>";

        container.appendChild(item);
    });
}


// ================= CUSTOMER TOTALS =================
function renderCustomerTotals() {
    const container = document.getElementById("customerTotals");

    if (!container) return;

    const registeredCustomers = users.filter(function (user) {
        return user.role === "customer";
    }).length;

    const walkinCustomers = users.filter(function (user) {
        return user.role === "walk-in-customer" || user.source === "walk-in";
    }).length;

    const uniqueCustomerEmails = {};

    users.forEach(function (user) {
        if (user.email) {
            uniqueCustomerEmails[user.email.trim().toLowerCase()] = true;
        }
    });

    container.innerHTML =
        '<div class="breakdown-row"><span>Registered customers</span><strong>' + registeredCustomers + '</strong></div>' +
        '<div class="breakdown-row"><span>Walk-in customers</span><strong>' + walkinCustomers + '</strong></div>' +
        '<div class="breakdown-row"><span>Unique customer records</span><strong>' + Object.keys(uniqueCustomerEmails).length + '</strong></div>';
}


// ================= RENDER WALK-INS =================
function renderWalkins() {
    const walkContainer = document.getElementById("walkList");
    const filter = document.getElementById("walkinFilter");

    if (!walkContainer) return;

    const selectedFilter = filter ? filter.value : "all";

    const sortedWalkins = walkins.slice().sort(function (a, b) {
        return Number(a.order || 0) - Number(b.order || 0);
    });

    const visibleWalkins = sortedWalkins.filter(function (walkin) {
        return selectedFilter === "all" || walkin.status === selectedFilter;
    });

    walkContainer.innerHTML = "";

    if (visibleWalkins.length === 0) {
        walkContainer.innerHTML = '<p class="empty-state">No walk-ins found.</p>';
        return;
    }

    visibleWalkins.forEach(function (walkin) {
        const card = document.createElement("article");
        card.className = "task-card";

        card.innerHTML =
            '<div class="task-card-top">' +
                "<div>" +
                    "<span>Walk-in Customer</span>" +
                    "<h3>Queue Number: " + walkin.code + "</h3>" +
                "</div>" +
                '<span class="status-pill ' + getStatusClass(walkin.status) + '">' +
                    getStatusLabel(walkin.status) +
                "</span>" +
            "</div>" +

            '<div class="task-details">' +
                "<p><b>Name:</b> " + walkin.name + "</p>" +
                "<p><b>Email:</b> " + walkin.email + "</p>" +
                "<p><b>Service:</b> " + (walkin.service || "Walk-in") + "</p>" +
                "<p><b>Employee:</b> " + walkin.employee + "</p>" +
            "</div>" +

            '<div class="task-actions">' +
                (walkin.status === "waiting"
                    ? '<button type="button" class="button" onclick="updateWalkinStatus(' + walkin.id + ', \'serving\')">Start</button>'
                    : "") +
                (walkin.status === "serving"
                    ? '<button type="button" class="button" onclick="updateWalkinStatus(' + walkin.id + ', \'completed\')">Complete</button>'
                    : "") +
            "</div>";

        walkContainer.appendChild(card);
    });
}


// ================= RENDER BOOKINGS =================
function renderBookings() {
    const bookingContainer = document.getElementById("bookingList");

    if (!bookingContainer) return;

    bookingContainer.innerHTML = "";

    if (bookings.length === 0) {
        bookingContainer.innerHTML = '<p class="empty-state">No bookings found.</p>';
        return;
    }

    bookings.forEach(function (booking) {
        const card = document.createElement("article");
        card.className = "task-card";

        card.innerHTML =
            '<div class="task-card-top">' +
                "<div>" +
                    "<span>Scheduled Booking</span>" +
                    "<h3>" + booking.service + "</h3>" +
                "</div>" +
                '<span class="status-pill ' + getStatusClass(booking.status) + '">' +
                    getStatusLabel(booking.status) +
                "</span>" +
            "</div>" +

            '<div class="task-details">' +
                "<p><b>Name:</b> " + booking.customer + "</p>" +
                "<p><b>Email:</b> " + booking.email + "</p>" +
                "<p><b>Date:</b> " + booking.date + "</p>" +
                "<p><b>Time:</b> " + booking.time + "</p>" +
                "<p><b>Employee:</b> " + booking.employee + "</p>" +
            "</div>";

        bookingContainer.appendChild(card);
    });
}


// ================= RENDER ALL =================
function renderAll() {
    renderSummary();
    renderEmployeeLoad();
    renderCustomerTotals();
    renderWalkins();
    renderBookings();
}


// ================= EVENTS =================
const walkinForm = document.getElementById("walkinForm");
const walkinFilter = document.getElementById("walkinFilter");

if (walkinForm) {
    walkinForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addWalkIn();
    });
}

if (walkinFilter) {
    walkinFilter.addEventListener("change", renderWalkins);
}


// ================= INIT =================
renderAll();