// ================= 🔐 AUTH PROTECTION =================
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}

// ================= 📦 DATA =================
let users = JSON.parse(localStorage.getItem("users")) || [];
let employees = JSON.parse(localStorage.getItem("employees")) || [];
let walkins = JSON.parse(localStorage.getItem("walkins")) || [];

// ================= 🌱 SEED EMPLOYEE =================
if (employees.length === 0) {
    employees = [
        {
            id: 1,
            name: "John Barber",
            email: "employee@salon.com",
            password: "emp123",
            role: "employee"
        }
    ];
    localStorage.setItem("employees", JSON.stringify(employees));
}

// ================= 📊 STATS =================
let userCount = document.getElementById("userCount");
let employeeCount = document.getElementById("employeeCount");
let queueCount = document.getElementById("queueCount");

if (userCount) userCount.innerText = users.length;
if (employeeCount) employeeCount.innerText = employees.length;
if (queueCount) queueCount.innerText = walkins.length;


// ================= 👨‍💼 ADD EMPLOYEE =================
function addEmployee() {

    let name = document.getElementById("empName").value.trim();
    let email = document.getElementById("empEmail").value.trim();
    let password = document.getElementById("empPass").value;

    if (!name || !email || !password) {
        alert("Fill all fields");
        return;
    }

    let newEmp = {
        id: Date.now(),
        name,
        email,
        password,
        role: "employee"
    };

    employees.push(newEmp);
    localStorage.setItem("employees", JSON.stringify(employees));

    alert("Employee added!");
    location.reload();
}


// ================= ✏️ EDIT EMPLOYEE =================
function editEmployee(id) {

    let emp = employees.find(e => e.id === id);

    let newName = prompt("Edit name:", emp.name);
    let newEmail = prompt("Edit email:", emp.email);

    if (!newName || !newEmail) return;

    employees = employees.map(e =>
        e.id === id ? { ...e, name: newName, email: newEmail } : e
    );

    localStorage.setItem("employees", JSON.stringify(employees));
    location.reload();
}


// ================= ❌ DELETE EMPLOYEE =================
function deleteEmployee(id) {

    if (!confirm("Delete this employee?")) return;

    employees = employees.filter(e => e.id !== id);
    localStorage.setItem("employees", JSON.stringify(employees));

    location.reload();
}


// ================= ✏️ EDIT USER =================
function editUser(email) {

    let user = users.find(u => u.email === email);

    let newName = prompt("Edit name:", user.name);
    let newEmail = prompt("Edit email:", user.email);

    if (!newName || !newEmail) return;

    users = users.map(u =>
        u.email === email ? { ...u, name: newName, email: newEmail } : u
    );

    localStorage.setItem("users", JSON.stringify(users));
    location.reload();
}


// ================= ❌ DELETE USER =================
function deleteUser(email) {

    if (!confirm("Delete this user?")) return;

    users = users.filter(u => u.email !== email);
    localStorage.setItem("users", JSON.stringify(users));

    location.reload();
}


// ================= 🚶 ADD WALK-IN =================
function addWalkIn() {

    let name = document.getElementById("walkName").value.trim();
    let email = document.getElementById("walkEmail").value.trim();

    if (!name || !email) {
        alert("Fill all fields");
        return;
    }

    if (employees.length === 0) {
        alert("No employees available");
        return;
    }

    // 🔥 FIFO QUEUE NUMBER
    let code = "Q" + (walkins.length + 1);

    // 🔥 AUTO ASSIGN EMPLOYEE (ROUND ROBIN)
    let employee = employees[walkins.length % employees.length];

    let walkin = {
        id: Date.now(),
        name,
        email,
        code,
        employee: employee.name,
        status: "waiting",
        order: walkins.length + 1
    };

    walkins.push(walkin);
    localStorage.setItem("walkins", JSON.stringify(walkins));

    alert(`Queue: ${code} | Assigned to: ${employee.name}`);

    location.reload();
}


// ================= 👥 RENDER EMPLOYEES =================
let empDiv = document.getElementById("employeeList");

if (empDiv) {
    employees.forEach(e => {

        // count tasks
        let tasks = walkins.filter(w => w.employee === e.name);
        let completed = tasks.filter(t => t.status === "completed").length;

        empDiv.innerHTML += `
            <div class="card">
                <p><b>${e.name}</b></p>
                <p>${e.email}</p>

                <p>Total Tasks: ${tasks.length}</p>
                <p>Completed: ${completed}</p>

                <button onclick="editEmployee(${e.id})">Edit</button>
                <button onclick="deleteEmployee(${e.id})">Delete</button>
            </div>
        `;
    });
}


// ================= 👤 RENDER USERS =================
let userDiv = document.getElementById("userList");

if (userDiv) {
    users.forEach(u => {

        userDiv.innerHTML += `
            <div class="card">
                <p><b>${u.name}</b></p>
                <p>${u.email}</p>

                <button onclick="editUser('${u.email}')">Edit</button>
                <button onclick="deleteUser('${u.email}')">Delete</button>
            </div>
        `;
    });
}


// ================= 📋 RENDER QUEUE (VIEW ONLY FOR ADMIN) =================
let queueDiv = document.getElementById("walkinList");

if (queueDiv) {

    // FIFO ORDER
    walkins.sort((a, b) => a.order - b.order);

    walkins.forEach(w => {

        queueDiv.innerHTML += `
            <div class="card">
                <h3>${w.code}</h3>
                <p><b>${w.name}</b></p>
                <p>${w.email}</p>
                <p><b>Employee:</b> ${w.employee}</p>
                <p><b>Status:</b> ${w.status}</p>
            </div>
        `;
    });
}


// ================= 🚪 LOGOUT =================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}