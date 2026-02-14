/* =========================================
   MANAGE USERS - LOGIC CONNECTION
========================================= */

const DB_KEY = "adminUsers";

// ===============================================
// KEYBOARD NAVIGATION (ENTER KEY)
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
    // --- Login Fields ---
    const secUser = document.getElementById("secUser");
    const secPass = document.getElementById("secPass");

    if(secUser) {
        secUser.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { 
                e.preventDefault(); 
                secPass.focus(); // Jump to Password
            }
        });
    }
    if(secPass) {
        secPass.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { 
                e.preventDefault(); 
                verifySecurity(); // Submit Login
            }
        });
    }

    // --- Add New User Fields ---
    const newUsername = document.getElementById("newUsername");
    const newPassword = document.getElementById("newPassword");

    if(newUsername) {
        newUsername.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { 
                e.preventDefault(); 
                newPassword.focus(); // Jump to new password
            }
        });
    }
    if(newPassword) {
        newPassword.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { 
                e.preventDefault(); 
                createNewUser(); // Submit new user
            }
        });
    }
});

// 1. SECURITY VERIFICATION (RBAC)
function verifySecurity() {
    const userIn = document.getElementById("secUser").value.trim();
    const passIn = document.getElementById("secPass").value.trim();

    if(!userIn || !passIn) {
        alert("Please enter your Admin credentials.");
        return;
    }

    let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    const foundUser = users.find(u => u.u.toLowerCase() === userIn.toLowerCase() && u.p === passIn);

    if (foundUser) {
        const isPrimary = (foundUser.role === "primary" || foundUser.u.toLowerCase() === "tirth");

        if (isPrimary) {
            // Memory flag to stay logged in on refresh
            sessionStorage.setItem("primaryAdminVerified", "true");
            sessionStorage.setItem("adminUser", foundUser.u); 
            
            document.getElementById("securityScreen").classList.add("hidden");
            const panel = document.getElementById("managementPanel");
            panel.classList.add("active");
            loadUsers();
            
            // Auto focus on New Username input after successful login
            setTimeout(() => { document.getElementById("newUsername").focus(); }, 100);
        } else {
            alert("Access Denied: Only Primary Admins can access User Management.");
            document.getElementById("secPass").value = "";
            document.getElementById("secUser").focus();
        }
    } else {
        alert("Access Denied: Invalid Credentials");
        document.getElementById("secPass").value = "";
        document.getElementById("secUser").focus();
    }
}

// 2. Render the User List
function loadUsers() {
    let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    
    // Ensure Tirth always exists as Master Primary Admin
    if(users.length === 0 || !users.some(u => u.u.toLowerCase() === "tirth")) {
        users.unshift({ u: "Tirth", p: "Tirth2007", role: "primary" });
        localStorage.setItem(DB_KEY, JSON.stringify(users));
    }

    const list = document.getElementById("userList");
    const count = document.getElementById("count");
    const currentUser = sessionStorage.getItem("adminUser") || ""; 

    list.innerHTML = "";
    count.innerText = users.length;

    users.forEach((user, index) => {
        const isMe = (user.u === currentUser);
        const isPrimary = (user.role === "primary" || user.u.toLowerCase() === "tirth");
        
        const html = `
            <div class="user-row">
                <div>
                    <strong style="font-size: 1.1em; color: ${isPrimary ? '#D4AF37' : (isMe ? '#10b981' : 'white')}">
                        <i class="fas ${isPrimary ? 'fa-user-shield' : 'fa-user'}"></i> ${user.u} 
                        ${isPrimary ? '<span class="badge" style="border-color:#D4AF37; color:#D4AF37; background:rgba(212,175,55,0.1);">PRIMARY</span>' : '<span class="badge" style="border-color:#64748b; color:#cbd5e1; background:transparent;">NORMAL</span>'}
                        ${isMe ? '<span class="badge">YOU</span>' : ''}
                    </strong>
                    <br>
                    <span style="color: #64748b; font-size: 0.9em; margin-left: 20px;">
                        <i class="fas fa-key"></i> ${user.p}
                    </span>
                </div>
                
                ${user.u.toLowerCase() !== "tirth" ? `<button class="btn-delete" onclick="removeUser(${index})"><i class="fas fa-trash"></i> Remove</button>` : ''}
            </div>
        `;
        list.innerHTML += html;
    });
}

// 3. Add New User
function createNewUser() {
    const uInput = document.getElementById("newUsername");
    const pInput = document.getElementById("newPassword");
    
    const u = uInput.value.trim();
    const p = pInput.value.trim();

    if (u === "" || p === "") {
        alert("Please fill in both Username and Password.");
        return;
    }

    let selectedRole = "normal";
    const roleRadios = document.getElementsByName("adminRole");
    for (const radio of roleRadios) {
        if (radio.checked) {
            selectedRole = radio.value;
            break;
        }
    }

    let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];

    if (users.some(user => user.u.toLowerCase() === u.toLowerCase())) {
        alert("Error: Username '" + u + "' already exists!");
        return;
    }

    users.push({ u: u, p: p, role: selectedRole });
    localStorage.setItem(DB_KEY, JSON.stringify(users));

    uInput.value = "";
    pInput.value = "";
    document.querySelector('input[name="adminRole"][value="normal"]').checked = true;
    
    alert(`Success! ${selectedRole === 'primary' ? 'Primary' : 'Normal'} Admin '${u}' created.`);
    loadUsers();
    
    // Auto-focus back on username to quickly add another user
    uInput.focus();
}

// 4. Remove User
function removeUser(index) {
    let users = JSON.parse(localStorage.getItem(DB_KEY)) || [];
    const userToDelete = users[index];
    
    if (userToDelete.u.toLowerCase() === "tirth") {
        alert("Action Denied: The Master Admin cannot be deleted.");
        return;
    }

    if(confirm(`Are you sure you want to delete the ${userToDelete.role === 'primary' ? 'Primary' : 'Normal'} admin '${userToDelete.u}'?`)) {
        users.splice(index, 1);
        localStorage.setItem(DB_KEY, JSON.stringify(users));
        loadUsers();
    }
}

// 5. Logout Function
function logoutPrimary() {
    // Only remove login data so the animation memory stays intact
    sessionStorage.removeItem("primaryAdminVerified");
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminUser");
    
    // Refresh the current page to show the Security Login screen instantly
    location.reload();
}