// ================= REQUIRE ADMIN =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}


// ================= DATA =================
let employees = JSON.parse(localStorage.getItem("employees")) || [];

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


// ================= HELPERS =================
function getAllEmployees() {
    return systemEmployees.concat(employees);
}

function getEmployeeActiveClients(employeeName) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const walkins = JSON.parse(localStorage.getItem("walkins")) || [];

    const activeBookings = bookings.filter(function (booking) {
        return booking.employee === employeeName && booking.status !== "completed";
    });

    const activeWalkins = walkins.filter(function (walkin) {
        return walkin.employee === employeeName && walkin.status !== "completed";
    });

    return activeBookings.length + activeWalkins.length;
}

function save() {
    localStorage.setItem("employees", JSON.stringify(employees));
    render(getAllEmployees());
    renderSummary();
    renderCoverage();
}

function clearForm() {
    document.getElementById("empName").value = "";
    document.getElementById("empEmail").value = "";
    document.getElementById("empPass").value = "";
    document.getElementById("empSpecialty").value = "Hair Styling";
    document.getElementById("empAvailability").value = "Available";
}


// ================= ADD =================
function addEmployee() {
    const name = document.getElementById("empName").value.trim();
    const email = document.getElementById("empEmail").value.trim().toLowerCase();
    const password = document.getElementById("empPass").value;
    const specialty = document.getElementById("empSpecialty").value;
    const availability = document.getElementById("empAvailability").value;

    if (!name || !email || !password || !specialty || !availability) {
        alert("Fill all fields");
        return;
    }

    const exists = getAllEmployees().find(function (employee) {
        return employee.email.toLowerCase() === email;
    });

    if (exists) {
        alert("Employee already exists");
        return;
    }

    employees.push({
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        role: "employee",
        specialty: specialty,
        availability: availability
    });

    clearForm();
    save();
}


// ================= EDIT =================
function editEmployee(id) {
    const emp = employees.find(function (employee) {
        return employee.id === id;
    });

    if (!emp) {
        alert("System employee cannot be edited here");
        return;
    }

    const newName = prompt("New name", emp.name);
    const newEmail = prompt("New email", emp.email);
    const newSpecialty = prompt("Specialty", emp.specialty || "Hair Styling");
    const newAvailability = prompt("Availability: Available, Busy, Off Duty", emp.availability || "Available");

    if (!newName || !newEmail || !newSpecialty || !newAvailability) {
        return;
    }

    employees = employees.map(function (employee) {
        if (employee.id === id) {
            return {
                ...employee,
                name: newName.trim(),
                email: newEmail.trim().toLowerCase(),
                specialty: newSpecialty.trim(),
                availability: newAvailability.trim()
            };
        }

        return employee;
    });

    save();
}


// ================= DELETE =================
function deleteEmployee(id) {
    const emp = employees.find(function (employee) {
        return employee.id === id;
    });

    if (!emp) {
        alert("System employee cannot be deleted");
        return;
    }

    const confirmed = confirm("Delete " + emp.name + "?");

    if (!confirmed) {
        return;
    }

    employees = employees.filter(function (employee) {
        return employee.id !== id;
    });

    save();
}


// ================= FEATURE 01: AVAILABILITY =================
function toggleAvailability(id) {
    employees = employees.map(function (employee) {
        if (employee.id === id) {
            let nextAvailability = "Available";

            if (employee.availability === "Available") {
                nextAvailability = "Busy";
            } else if (employee.availability === "Busy") {
                nextAvailability = "Off Duty";
            }

            return {
                ...employee,
                availability: nextAvailability
            };
        }

        return employee;
    });

    save();
}


// ================= SEARCH =================
function searchEmployee() {
    const val = document.getElementById("search").value.toLowerCase();

    const filtered = getAllEmployees().filter(function (employee) {
        return employee.name.toLowerCase().includes(val) ||
            employee.email.toLowerCase().includes(val) ||
            String(employee.specialty || "").toLowerCase().includes(val) ||
            String(employee.availability || "").toLowerCase().includes(val);
    });

    render(filtered);
}


// ================= SUMMARY =================
function renderSummary() {
    const teamCount = document.getElementById("teamCount");
    const teamSummary = document.getElementById("teamSummary");

    const allEmployees = getAllEmployees();
    const availableCount = allEmployees.filter(function (employee) {
        return employee.availability !== "Off Duty";
    }).length;

    if (teamCount) {
        teamCount.innerText = allEmployees.length + " employees";
    }

    if (teamSummary) {
        teamSummary.innerText = availableCount + " staff members are available or busy today.";
    }
}


// ================= FEATURE 02: SPECIALTY COVERAGE =================
function renderCoverage() {
    const container = document.getElementById("coverageList");

    if (!container) return;

    const coverage = {};

    getAllEmployees().forEach(function (employee) {
        const specialty = employee.specialty || "General";
        coverage[specialty] = (coverage[specialty] || 0) + 1;
    });

    const specialties = Object.keys(coverage);

    if (specialties.length === 0) {
        container.innerHTML = '<p class="empty-state">No staff coverage yet.</p>';
        return;
    }

    container.innerHTML = "";

    specialties.forEach(function (specialty) {
        const row = document.createElement("div");
        row.className = "breakdown-row";

        row.innerHTML =
            "<span>" + specialty + "</span>" +
            "<strong>" + coverage[specialty] + "</strong>";

        container.appendChild(row);
    });
}


// ================= RENDER =================
function render(list) {
    const container = document.getElementById("employeeList");

    if (!container) return;

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = '<p class="empty-state">No employees found.</p>';
        return;
    }

    list.forEach(function (employee) {
        const activeClients = getEmployeeActiveClients(employee.name);
        const isSystemEmployee = employee.system === true;

        const card = document.createElement("article");
        card.className = "employee-card";

        card.innerHTML =
            '<div class="employee-card-top">' +
                "<div>" +
                    "<span>" + (isSystemEmployee ? "System Employee" : "Staff Member") + "</span>" +
                    "<h3>" + employee.name + "</h3>" +
                    "<p>" + employee.email + "</p>" +
                "</div>" +
                '<span class="status-pill ' + getAvailabilityClass(employee.availability) + '">' +
                    (employee.availability || "Available") +
                "</span>" +
            "</div>" +

            '<div class="employee-meta">' +
                "<p><b>Specialty:</b> " + (employee.specialty || "General") + "</p>" +
                "<p><b>Active clients:</b> " + activeClients + "</p>" +
            "</div>" +

            '<div class="employee-actions">' +
                (isSystemEmployee
                    ? '<button type="button" class="button muted-button" disabled>System</button>'
                    : '<button type="button" class="button" onclick="editEmployee(' + employee.id + ')">Edit</button>' +
                      '<button type="button" class="button ghost-button" onclick="toggleAvailability(' + employee.id + ')">Toggle Status</button>' +
                      '<button type="button" class="button danger-button" onclick="deleteEmployee(' + employee.id + ')">Delete</button>'
                ) +
            "</div>";

        container.appendChild(card);
    });
}

function getAvailabilityClass(availability) {
    if (availability === "Busy") return "status-serving";
    if (availability === "Off Duty") return "status-completed";
    return "status-waiting";
}


// ================= EVENTS =================
const employeeForm = document.getElementById("employeeForm");
const searchInput = document.getElementById("search");

if (employeeForm) {
    employeeForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addEmployee();
    });
}

if (searchInput) {
    searchInput.addEventListener("input", searchEmployee);
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}


// ================= INIT =================
render(getAllEmployees());
renderSummary();
renderCoverage();