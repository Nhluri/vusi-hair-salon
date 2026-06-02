// ================= REQUIRE LOGIN =================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "customer") {
    alert("Please login as a customer");
    window.location.href = "login.html";
}


// ================= SELECTED SERVICE PREVIEW =================
const selectedService = localStorage.getItem("selectedService") || "Haircut";
const selectedImage = localStorage.getItem("selectedImage") || "images/hair1.jpg";

const serviceSelect = document.getElementById("service");
const previewImage = document.getElementById("bookingPreviewImage");
const previewTitle = document.getElementById("bookingPreviewTitle");

if (serviceSelect) {
    serviceSelect.value = selectedService;
}

if (previewImage) {
    previewImage.src = selectedImage;
    previewImage.alt = selectedService + " preview";
}

if (previewTitle) {
    previewTitle.textContent = selectedService;
}


// ================= LOAD EMPLOYEES =================
const systemEmployees = [
    {
        id: 1,
        name: "John Barber",
        email: "employee@salon.com",
        password: "emp123",
        role: "employee"
    }
];

const savedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
const employees = systemEmployees.concat(savedEmployees);

const empSelect = document.getElementById("employee");

if (empSelect) {
    empSelect.innerHTML = "";

    employees.forEach(function (employee) {
        const option = document.createElement("option");
        option.value = employee.name;
        option.textContent = employee.name;
        empSelect.appendChild(option);
    });
}


// ================= DATE MINIMUM =================
const dateInput = document.getElementById("date");

if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    dateInput.min = yyyy + "-" + mm + "-" + dd;
}


// ================= OPERATING HOURS =================
function isWithinOperatingHours(dateValue, timeValue) {
    const selectedDate = new Date(dateValue + "T" + timeValue);
    const day = selectedDate.getDay();

    const selectedMinutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();

    const weekdayOpen = 8 * 60;
    const weekdayClose = 18 * 60;

    const weekendOpen = 9 * 60;
    const weekendClose = 17 * 60;

    if (day >= 1 && day <= 5) {
        return selectedMinutes >= weekdayOpen && selectedMinutes <= weekdayClose;
    }

    return selectedMinutes >= weekendOpen && selectedMinutes <= weekendClose;
}

function getOperatingHoursMessage(dateValue) {
    const selectedDate = new Date(dateValue + "T00:00");
    const day = selectedDate.getDay();

    if (day >= 1 && day <= 5) {
        return "Operating hours are Monday to Friday, 08:00 to 18:00.";
    }

    return "Operating hours are Saturday to Sunday, 09:00 to 17:00.";
}


// ================= EMPLOYEE WAITING COUNT =================
function getEmployeeWaitingCount(employeeName) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const walkins = JSON.parse(localStorage.getItem("walkins")) || [];

    const waitingBookings = bookings.filter(function (booking) {
        return booking.employee === employeeName && booking.status === "waiting";
    });

    const waitingWalkins = walkins.filter(function (walkin) {
        return walkin.employee === employeeName && walkin.status === "waiting";
    });

    return waitingBookings.length + waitingWalkins.length;
}


// ================= BOOK FUNCTION =================
function book() {
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const employee = document.getElementById("employee").value;

    if (!service || !date || !time || !employee) {
        alert("Please complete all booking fields");
        return;
    }

    if (!isWithinOperatingHours(date, time)) {
        alert(getOperatingHoursMessage(date));
        return;
    }

    const employeeWaitingCount = getEmployeeWaitingCount(employee);

    if (employeeWaitingCount >= 20) {
        const continueBooking = confirm(
            employee + " already has " + employeeWaitingCount +
            " clients waiting. You may need to wait for a while. Do you still want to book with this employee?"
        );

        if (!continueBooking) {
            return;
        }
    }

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    const conflict = bookings.find(function (booking) {
        return booking.date === date &&
            booking.time === time &&
            booking.employee === employee;
    });

    if (conflict) {
        alert("This slot is already booked");
        return;
    }

    const newBooking = {
        id: Date.now(),
        customer: currentUser.name,
        email: currentUser.email,
        service: service,
        date: date,
        time: time,
        employee: employee,
        status: "waiting"
    };

    bookings.push(newBooking);

    localStorage.setItem("bookings", JSON.stringify(bookings));

    alert("Booking successful!");
    window.location.href = "home.html";
}


// ================= FORM EVENT =================
const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();
        book();
    });
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}