// ================= REQUIRE ADMIN =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}


// ================= DATA =================
const savedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
const walkins = JSON.parse(localStorage.getItem("walkins")) || [];
const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

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
const allTasks = walkins.concat(bookings);

const container = document.getElementById("reportList");


// ================= HELPERS =================
function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}

function getEmployeeTasks(employeeName) {
    return allTasks.filter(function (task) {
        return task.employee === employeeName;
    });
}

function getPercent(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
}

function getServiceName(task) {
    return task.service || "Walk-in";
}

function getStatusCount(status) {
    return allTasks.filter(function (task) {
        return task.status === status;
    }).length;
}


// ================= TOTALS =================
const totalTasks = allTasks.length;
const completedTasks = getStatusCount("completed");
const waitingTasks = getStatusCount("waiting");
const servingTasks = getStatusCount("serving");
const completionRate = getPercent(completedTasks, totalTasks);

setText("totalTasksReport", totalTasks);
setText("completedTasksReport", completedTasks);
setText("waitingTasksReport", waitingTasks);
setText("servingTasksReport", servingTasks);
setText("overallCompletion", completionRate + "%");

const overallSummary = document.getElementById("overallSummary");

if (overallSummary) {
    overallSummary.innerText = completedTasks + " of " + totalTasks + " total tasks completed.";
}


// ================= GRAPH: SERVICE DEMAND =================
function renderServiceChart() {
    const chart = document.getElementById("serviceChart");

    if (!chart) return;

    const demand = {};

    allTasks.forEach(function (task) {
        const service = getServiceName(task);
        demand[service] = (demand[service] || 0) + 1;
    });

    const services = Object.keys(demand);

    if (services.length === 0) {
        chart.innerHTML = '<p class="empty-state">No service data yet.</p>';
        return;
    }

    const maxValue = Math.max.apply(null, services.map(function (service) {
        return demand[service];
    }));

    chart.innerHTML = "";

    services.sort(function (a, b) {
        return demand[b] - demand[a];
    }).forEach(function (service, index) {
        const width = getPercent(demand[service], maxValue);

        const row = document.createElement("div");
        row.className = "bar-row";

        row.innerHTML =
            '<div class="bar-label">' +
                "<span>" + service + "</span>" +
                "<strong>" + demand[service] + "</strong>" +
            "</div>" +
            '<div class="bar-track">' +
                '<div class="bar-fill bar-color-' + ((index % 4) + 1) + '" style="width: ' + width + '%"></div>' +
            "</div>";

        chart.appendChild(row);
    });
}


// ================= GRAPH: EMPLOYEE COMPLETION =================
function renderEmployeeChart() {
    const chart = document.getElementById("employeeChart");

    if (!chart) return;

    if (employees.length === 0) {
        chart.innerHTML = '<p class="empty-state">No employees found.</p>';
        return;
    }

    chart.innerHTML = "";

    employees.forEach(function (employee, index) {
        const tasks = getEmployeeTasks(employee.name);
        const completed = tasks.filter(function (task) {
            return task.status === "completed";
        }).length;

        const rate = getPercent(completed, tasks.length);

        const row = document.createElement("div");
        row.className = "bar-row";

        row.innerHTML =
            '<div class="bar-label">' +
                "<span>" + employee.name + "</span>" +
                "<strong>" + rate + "%</strong>" +
            "</div>" +
            '<div class="bar-track">' +
                '<div class="bar-fill bar-color-' + ((index % 4) + 1) + '" style="width: ' + rate + '%"></div>' +
            "</div>";

        chart.appendChild(row);
    });
}


// ================= FEATURE: TOP PERFORMER =================
function renderTopPerformer() {
    const container = document.getElementById("topPerformer");

    if (!container) return;

    const ranked = employees.map(function (employee) {
        const tasks = getEmployeeTasks(employee.name);
        const completed = tasks.filter(function (task) {
            return task.status === "completed";
        }).length;

        return {
            name: employee.name,
            completed: completed,
            total: tasks.length,
            rate: getPercent(completed, tasks.length)
        };
    }).sort(function (a, b) {
        return b.completed - a.completed || b.rate - a.rate;
    });

    if (ranked.length === 0 || ranked[0].total === 0) {
        container.innerHTML = '<p class="empty-state">No performer data yet.</p>';
        return;
    }

    const top = ranked[0];

    container.innerHTML =
        '<article class="compact-item">' +
            "<div>" +
                "<strong>" + top.name + "</strong>" +
                "<span>" + top.completed + " completed from " + top.total + " tasks</span>" +
            "</div>" +
            '<span class="status-pill status-serving">' + top.rate + "%</span>" +
        "</article>";
}


// ================= FEATURE: STATUS MIX DONUT =================
function renderStatusMix() {
    const container = document.getElementById("statusMix");

    if (!container) return;

    if (totalTasks === 0) {
        container.innerHTML = '<p class="empty-state">No task status data yet.</p>';
        return;
    }

    const completedPercent = getPercent(completedTasks, totalTasks);
    const servingPercent = getPercent(servingTasks, totalTasks);
    const waitingPercent = Math.max(0, 100 - completedPercent - servingPercent);

    container.innerHTML =
        '<div class="donut" style="--completed:' + completedPercent + '; --serving:' + servingPercent + '; --waiting:' + waitingPercent + ';">' +
            '<span>' + completionRate + "%</span>" +
        "</div>" +
        '<div class="donut-legend">' +
            '<span><i class="legend-completed"></i>Completed</span>' +
            '<span><i class="legend-serving"></i>In progress</span>' +
            '<span><i class="legend-waiting"></i>Waiting</span>' +
        "</div>";
}


// ================= RENDER REPORT CARDS =================
function render(list) {
    if (!container) return;

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = '<p class="empty-state">No reports found.</p>';
        return;
    }

    list.forEach(function (employee) {
        const walkinTasks = walkins.filter(function (walkin) {
            return walkin.employee === employee.name;
        });

        const completedWalkins = walkinTasks.filter(function (task) {
            return task.status === "completed";
        }).length;

        const bookingTasks = bookings.filter(function (booking) {
            return booking.employee === employee.name;
        });

        const completedBookings = bookingTasks.filter(function (booking) {
            return booking.status === "completed";
        }).length;

        const totalEmployeeTasks = walkinTasks.length + bookingTasks.length;
        const totalCompleted = completedWalkins + completedBookings;
        const employeeRate = getPercent(totalCompleted, totalEmployeeTasks);

        const card = document.createElement("article");
        card.className = "report-card";

        card.innerHTML =
            '<div class="report-card-top">' +
                "<div>" +
                    "<span>Employee Report</span>" +
                    "<h3>" + employee.name + "</h3>" +
                    "<p>" + (employee.email || "employee@salon.com") + "</p>" +
                "</div>" +
                '<span class="status-pill status-serving">' + employeeRate + "% complete</span>" +
            "</div>" +

            '<div class="report-metrics">' +
                "<p><b>Walk-ins:</b> " + walkinTasks.length + "</p>" +
                "<p><b>Bookings:</b> " + bookingTasks.length + "</p>" +
                "<p><b>Completed walk-ins:</b> " + completedWalkins + "</p>" +
                "<p><b>Completed bookings:</b> " + completedBookings + "</p>" +
                "<p><b>Total tasks:</b> " + totalEmployeeTasks + "</p>" +
                "<p><b>Total completed:</b> " + totalCompleted + "</p>" +
            "</div>";

        container.appendChild(card);
    });
}


// ================= SEARCH =================
function searchEmployee() {
    const val = document.getElementById("search").value.toLowerCase();

    const filtered = employees.filter(function (employee) {
        return employee.name.toLowerCase().includes(val) ||
            String(employee.email || "").toLowerCase().includes(val);
    });

    render(filtered);
}


// ================= EVENTS =================
const searchInput = document.getElementById("search");

if (searchInput) {
    searchInput.addEventListener("input", searchEmployee);
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}


// ================= INIT =================
render(employees);
renderServiceChart();
renderEmployeeChart();
renderTopPerformer();
renderStatusMix();