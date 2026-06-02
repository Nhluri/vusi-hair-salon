// ================= REQUIRE EMPLOYEE =================
const user = JSON.parse(localStorage.getItem("currentUser"));

if (!user || user.role !== "employee") {
    alert("Access denied");
    window.location.href = "login.html";
}


// ================= LOAD TASKS =================
let walkins = JSON.parse(localStorage.getItem("walkins")) || [];
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

const myWalkins = walkins.filter(function (walkin) {
    return walkin.employee === user.name;
});

const myBookings = bookings.filter(function (booking) {
    return booking.employee === user.name;
});

let allTasks = myWalkins.concat(myBookings);


// ================= HELPERS =================
function getTaskClient(task) {
    return task.name || task.customer || "Client";
}

function getTaskType(task) {
    return task.code ? "Walk-in" : "Booking";
}

function getTaskService(task) {
    return task.service || "Walk-in";
}

function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    return yyyy + "-" + mm + "-" + dd;
}

function getStatusLabel(status) {
    if (status === "serving") return "In progress";
    if (status === "completed") return "Completed";
    return "Waiting";
}

function getStatusClass(status) {
    if (status === "serving") return "status-serving";
    if (status === "completed") return "status-completed";
    return "status-waiting";
}


// ================= WELCOME =================
const employeeWelcome = document.getElementById("employeeWelcome");

if (employeeWelcome) {
    employeeWelcome.textContent = "Welcome, " + user.name + ".";
}


// ================= STATS =================
const waitingCount = allTasks.filter(function (task) {
    return task.status === "waiting";
}).length;

const servingCount = allTasks.filter(function (task) {
    return task.status === "serving";
}).length;

const completedCount = allTasks.filter(function (task) {
    return task.status === "completed";
}).length;

document.getElementById("totalTasks").innerText = allTasks.length;
document.getElementById("waitingTasks").innerText = waitingCount;
document.getElementById("servingTasks").innerText = servingCount;
document.getElementById("completedTasks").innerText = completedCount;


// ================= WORKLOAD =================
const workloadText = document.getElementById("workloadText");
const workloadBar = document.getElementById("workloadBar");
const workloadMessage = document.getElementById("workloadMessage");

if (workloadText && workloadBar && workloadMessage) {
    const workloadPercent = Math.min((waitingCount / 20) * 100, 100);

    workloadText.textContent = waitingCount + " waiting";
    workloadBar.style.width = workloadPercent + "%";

    if (waitingCount >= 20) {
        workloadMessage.textContent = "Heavy load. New customers should expect a wait.";
    } else if (waitingCount >= 12) {
        workloadMessage.textContent = "Busy shift. Keep the queue moving.";
    } else {
        workloadMessage.textContent = "Your schedule is manageable.";
    }
}


// ================= TODAY'S SCHEDULE FEATURE =================
const todayList = document.getElementById("todayList");
const todayDate = getTodayDate();

const todaysTasks = allTasks
    .filter(function (task) {
        return task.date === todayDate;
    })
    .sort(function (a, b) {
        return String(a.time || "").localeCompare(String(b.time || ""));
    });

if (todayList) {
    if (todaysTasks.length === 0) {
        todayList.innerHTML = '<p class="empty-state">No scheduled bookings for today.</p>';
    } else {
        todayList.innerHTML = "";

        todaysTasks.forEach(function (task) {
            const item = document.createElement("article");
            item.className = "compact-item";

            item.innerHTML =
                "<div>" +
                    "<strong>" + getTaskClient(task) + "</strong>" +
                    "<span>" + getTaskService(task) + " at " + (task.time || "-") + "</span>" +
                "</div>" +
                '<span class="status-pill ' + getStatusClass(task.status) + '">' +
                    getStatusLabel(task.status) +
                "</span>";

            todayList.appendChild(item);
        });
    }
}


// ================= SERVICE BREAKDOWN FEATURE =================
const serviceBreakdown = document.getElementById("serviceBreakdown");

if (serviceBreakdown) {
    const breakdown = {};

    allTasks.forEach(function (task) {
        const service = getTaskService(task);
        breakdown[service] = (breakdown[service] || 0) + 1;
    });

    const services = Object.keys(breakdown);

    if (services.length === 0) {
        serviceBreakdown.innerHTML = '<p class="empty-state">No service data yet.</p>';
    } else {
        serviceBreakdown.innerHTML = "";

        services.forEach(function (service) {
            const row = document.createElement("div");
            row.className = "breakdown-row";

            row.innerHTML =
                "<span>" + service + "</span>" +
                "<strong>" + breakdown[service] + "</strong>";

            serviceBreakdown.appendChild(row);
        });
    }
}


// ================= DISPLAY TASKS =================
const taskList = document.getElementById("taskList");
const statusFilter = document.getElementById("statusFilter");

function renderTasks(status) {
    if (!taskList) return;

    const selectedStatus = status || "all";

    const visibleTasks = allTasks.filter(function (task) {
        return selectedStatus === "all" || task.status === selectedStatus;
    });

    taskList.innerHTML = "";

    if (visibleTasks.length === 0) {
        taskList.innerHTML = '<p class="empty-state">No clients found for this filter.</p>';
        return;
    }

    visibleTasks.forEach(function (task) {
        const card = document.createElement("article");
        card.className = "task-card";

        const title = task.code ? "Queue: " + task.code : "Booking";

        card.innerHTML =
            '<div class="task-card-top">' +
                "<div>" +
                    "<span>" + getTaskType(task) + "</span>" +
                    "<h3>" + title + "</h3>" +
                "</div>" +
                '<span class="status-pill ' + getStatusClass(task.status) + '">' +
                    getStatusLabel(task.status) +
                "</span>" +
            "</div>" +

            '<div class="task-details">' +
                "<p><b>Client:</b> " + getTaskClient(task) + "</p>" +
                "<p><b>Service:</b> " + getTaskService(task) + "</p>" +
                "<p><b>Date:</b> " + (task.date || "-") + "</p>" +
                "<p><b>Time:</b> " + (task.time || "-") + "</p>" +
            "</div>" +

            '<div class="task-actions">' +
                (task.status === "waiting"
                    ? '<button type="button" class="button" onclick="updateStatus(' + task.id + ', \'serving\')">Start Service</button>'
                    : "") +
                (task.status === "serving"
                    ? '<button type="button" class="button" onclick="updateStatus(' + task.id + ', \'completed\')">Complete Service</button>'
                    : "") +
            "</div>";

        taskList.appendChild(card);
    });
}

renderTasks("all");

if (statusFilter) {
    statusFilter.addEventListener("change", function () {
        renderTasks(statusFilter.value);
    });
}


// ================= UPDATE STATUS =================
function updateStatus(id, status) {
    let savedWalkins = JSON.parse(localStorage.getItem("walkins")) || [];
    let savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];

    savedWalkins = savedWalkins.map(function (walkin) {
        if (walkin.id === id) {
            walkin.status = status;
        }

        return walkin;
    });

    savedBookings = savedBookings.map(function (booking) {
        if (booking.id === id) {
            booking.status = status;
        }

        return booking;
    });

    localStorage.setItem("walkins", JSON.stringify(savedWalkins));
    localStorage.setItem("bookings", JSON.stringify(savedBookings));

    location.reload();
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}