// ================= REGISTER =================
function register() {
    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim().toLowerCase();
    let password = document.getElementById("password").value.trim();
    let confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let exists = users.find(u =>
        u.email && u.email.trim().toLowerCase() === email
    );

    if (exists) {
        alert("User already exists");
        return;
    }

    let newUser = {
        id: Date.now(),
        name: username,
        email: email,
        password: password,
        role: "customer"
    };

    users.push(newUser);

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    alert("Registered successfully!");
    window.location.href = "home.html";
}


// ================= LOGIN =================
function login() {
    let email = document.getElementById("email").value.trim().toLowerCase();
    let password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    // ================= SYSTEM USERS =================
    let systemUsers = [
        {
            name: "King",
            email: "kingofkings@gmail.com",
            password: "king30",
            role: "admin"
        },
        {
            name: "John Barber",
            email: "employee@salon.com",
            password: "emp123",
            role: "employee"
        }
    ];

    // ================= CHECK SYSTEM USERS =================
    let systemUser = systemUsers.find(u =>
        u.email &&
        u.password &&
        u.email.trim().toLowerCase() === email &&
        u.password.trim() === password
    );

    if (systemUser) {
        localStorage.setItem("currentUser", JSON.stringify(systemUser));

        alert("Login successful");

        if (systemUser.role === "admin") {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "employee.html";
        }

        return;
    }

    // ================= CHECK ADMIN ADDED EMPLOYEES =================
    let employeeUser = employees.find(e =>
        e.email &&
        e.password &&
        e.email.trim().toLowerCase() === email &&
        e.password.trim() === password
    );

    if (employeeUser) {
        localStorage.setItem("currentUser", JSON.stringify(employeeUser));

        alert("Login successful (Employee)");

        window.location.href = "employee.html";
        return;
    }

    // ================= CHECK CUSTOMERS =================
    let customer = users.find(u =>
        u.email &&
        u.password &&
        u.email.trim().toLowerCase() === email &&
        u.password.trim() === password
    );

    if (customer) {
        localStorage.setItem("currentUser", JSON.stringify(customer));

        alert("Login successful (Customer)");

        window.location.href = "home.html";
        return;
    }

    // ================= FAIL =================
    alert("Invalid email or password");
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}