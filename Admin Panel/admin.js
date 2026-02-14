/* =========================================
   HOTEL ADMIN PANEL - LOCAL STORAGE VERSION
========================================= */

const DB_KEY = "adminUsers";
const BOOKING_KEY = "hotelBookings"; 

// 1. Initialize Default Admin
function initAdmins() {
    let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    if (users.length === 0 || !users.some(u => u.u.toLowerCase() === "tirth")) {
        users.unshift({ u: "Tirth", p: "Tirth2007", role: "primary" }); 
        localStorage.setItem(DB_KEY, JSON.stringify(users));
    }
}
initAdmins();

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// 2. LOGIN FUNCTION
function login() {
    const userIn = document.getElementById("adminUser").value.trim();
    const passIn = document.getElementById("adminPass").value.trim();

    if(!userIn || !passIn) {
        alert("Please enter Username and Password");
        return;
    }

    const users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    const validUser = users.find(a => a.u.toLowerCase() === userIn.toLowerCase() && a.p === passIn);

    if (validUser) {
        sessionStorage.setItem("adminLoggedIn", "true");
        sessionStorage.setItem("adminUser", validUser.u);
        showDashboard();
    } else {
        alert("Invalid Username or Password!");
    }
}

// 3. RESET PASSWORD
function updatePassword() {
    const user = document.getElementById("resetUser").value.trim();
    const pass = document.getElementById("newAdminPass").value.trim();

    if(!user || !pass) {
        alert("Please fill all fields");
        return;
    }

    let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    const accIndex = users.findIndex(a => a.u.toLowerCase() === user.toLowerCase());
    
    if (accIndex === -1) {
        alert("User not found!");
        return;
    }

    users[accIndex].p = pass;
    localStorage.setItem(DB_KEY, JSON.stringify(users));

    alert("Password updated!");
    toggleView("login");
}

// --- DASHBOARD ---
function showDashboard() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("dashboard").classList.remove("hidden");
    document.getElementById("activeUserDisplay").innerHTML = `<b>Welcome, ${sessionStorage.getItem("adminUser")}</b>`;
    loadData();
}

// 4. LOAD BOOKINGS
function loadData() {
    let bookings = JSON.parse(localStorage.getItem(BOOKING_KEY)) || [];
    const bookingTable = document.getElementById("bookingTable");
    bookingTable.innerHTML = "";
    let revenue = 0;

    bookings.forEach((b, i) => {
        revenue += parseFloat(b.totalAmount || 0);
        bookingTable.innerHTML += `
            <tr>
                <td>${b.id || '-'}</td>
                <td>${b.customerName}</td>
                <td>${b.customerEmail}</td>
                <td>${b.customerPhone}</td>
                <td>${formatDate(b.checkIn)}</td>
                <td>${formatDate(b.checkOut)}</td>
                <td>${b.type}</td>
                <td>${b.itemName}</td>
                <td>${b.guests}</td>
                <td>₹${b.totalAmount}</td>
                <td><button onclick="deleteBooking(${i})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button></td>
            </tr>`;
    });
    document.getElementById("totalBookings").innerText = bookings.length;
    document.getElementById("totalRevenue").innerText = revenue;
}

// 5. DELETE BOOKING
function deleteBooking(i) {
    if(confirm("Delete this booking?")) {
        let bookings = JSON.parse(localStorage.getItem(BOOKING_KEY)) || [];
        bookings.splice(i, 1);
        localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
        loadData();
    }
}

// 6. CLEAR ALL
function clearAll() {
    if (confirm("Delete ALL bookings?")) {
        localStorage.setItem(BOOKING_KEY, JSON.stringify([]));
        loadData();
    }
}

function logout() {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("primaryAdminVerified");
    location.reload();
}

function toggleView(v) {
    document.getElementById("loginFields").classList.add("hidden");
    document.getElementById("resetFields").classList.add("hidden");

    if (v === "login") {
        document.getElementById("loginFields").classList.remove("hidden");
        setTimeout(() => document.getElementById("adminUser").focus(), 100);
    } 
    else if (v === "reset") {
        document.getElementById("resetFields").classList.remove("hidden");
        setTimeout(() => document.getElementById("resetUser").focus(), 100);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("adminLoggedIn") === "true") {
        showDashboard();
    } else {
        const loginUser = document.getElementById("adminUser");
        const loginPass = document.getElementById("adminPass");

        if (loginUser) {
            loginUser.focus(); 
            loginUser.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); loginPass.focus(); }
            });
        }
        if (loginPass) {
            loginPass.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); login(); }
            });
        }

        const resetUser = document.getElementById("resetUser");
        const resetPass = document.getElementById("newAdminPass");

        if (resetUser) {
            resetUser.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); resetPass.focus(); }
            });
        }
        if (resetPass) {
            resetPass.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); updatePassword(); }
            });
        }
    }
});