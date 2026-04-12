// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBwRCQXILbIMjfbb-zhRXSRJXQHeKrxVkI",
    authDomain: "com-navithya.firebaseapp.com",
    projectId: "com-navithya",
    storageBucket: "com-navithya.firebasestorage.app",
    messagingSenderId: "20630095675",
    appId: "1:20630095675:web:1d74cca4a8e6ccdc58591e",
    measurementId: "G-0NEH12WEBL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// State Management
let currentUser = null;
let userRole = 'guest';
let currentActivePage = 'home';
const adminPhone = "94729929453"; // From footer/request

// App Initialization
window.addEventListener('load', () => {
    setupAuthObserver();
    renderNavbar();
    loadHomeData();
    populateDistricts();
});

function setupAuthObserver() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            // Fetch role from DB
            db.ref(`users/${user.uid}`).once('value', snapshot => {
                const userData = snapshot.val();
                if (userData) {
                    userRole = userData.role || 'customer';
                    if (userData.status === 'pending') {
                        const welcomeMsg = `🎉 BOHOMA ISTHUTHI APA SAMAGA EKATHU U OBATA ADWITHIYA SEWAWAK LABAGANNA PALAMU SATHI DEKA FREE\n\nThank you for joining us! To experience our unique service, your first 2.5 weeks are FREE. Please wait for admin approval.`;
                        alert(welcomeMsg);
                        logout();
                    } else {
                        updateUI();
                    }
                } else {
                    // Check if is the specific admin "Adithya"
                    if (user.uid === 'admin_adhithya_fixed_id' || user.email === 'admin@navithya.com') {
                        userRole = 'admin';
                    } else {
                        userRole = 'customer';
                    }
                    updateUI();
                }
            });
        } else {
            currentUser = null;
            userRole = 'guest';
            updateUI();
        }
    });
}

function updateUI() {
    renderNavbar();
    if (userRole === 'admin') navigate('admin-dashboard');
}

// Navigation Logic
const pages = {
    'home': ['Home', 'Gallery', 'Store', 'Reviews', 'Rate Us'],
    'admin': ['Home', 'Admin Dashboard', 'Provider Job', 'Gallery', 'Stores', 'Reviews', 'Rate Us', 'Notifications', 'Provider Plans'],
    'provider': ['Home', 'Provider Dashboard', 'Received Job', 'Gallery', 'Stores', 'Reviews', 'Rate Us', 'Notifications', 'Provider Plans'],
    'customer': ['Home', 'Customer Dashboard', 'Request Job', 'Gallery', 'Stores', 'Reviews', 'Rate Us', 'Notifications', 'Tracking Job']
};

function renderNavbar() {
    const navUl = document.getElementById('nav-links');
    navUl.innerHTML = '';

    const roleMap = {
        'admin': pages.admin,
        'developer': pages.admin,
        'provider': pages.provider,
        'customer': pages.customer,
        'guest': pages.home
    };

    const currentLinks = roleMap[userRole];

    currentLinks.forEach(link => {
        const li = document.createElement('li');
        const slug = link.toLowerCase().replace(/ /g, '-');
        li.innerHTML = `<button onclick="navigate('${slug}')">${link}</button>`;
        navUl.appendChild(li);
    });

    // Auth Button
    const authLi = document.createElement('li');
    if (currentUser) {
        authLi.innerHTML = `<button class="btn-outline" onclick="logout()">Logout</button>`;
    } else {
        authLi.innerHTML = `<button class="btn-primary" onclick="showAuthOverlay()">Login / Sign Up</button>`;
    }
    navUl.appendChild(authLi);
}

function navigate(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Show target page
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.remove('hidden');
        currentActivePage = pageId;
    } else {
        console.warn(`Page ${pageId} not found`);
        document.getElementById('page-home').classList.remove('hidden');
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Authentication Handlers
function showAuthOverlay() {
    document.getElementById('auth-overlay').classList.remove('hidden');
}

function hideAuthOverlay() {
    document.getElementById('auth-overlay').classList.add('hidden');
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('tab-login').className = 'btn-primary';
        document.getElementById('tab-signup').className = 'btn-outline';
    } else {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('tab-login').className = 'btn-outline';
        document.getElementById('tab-signup').className = 'btn-primary';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const phone = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    // Hardcoded Admin check as per request
    if (phone === "Adithya" && pass === "19980307") {
        userRole = 'admin';
        updateUI();
        hideAuthOverlay();
        navigate('admin-dashboard');
        return;
    }

    try {
        // Simple firebase email login (mocking phone as email for this demo structure)
        const email = `${phone}@navithya.com`;
        await auth.signInWithEmailAndPassword(email, pass);
        hideAuthOverlay();
    } catch (err) {
        alert("Login failed: " + err.message);
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const pass = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    const dist = document.getElementById('signup-district').value;
    const village = document.getElementById('signup-village').value;

    const email = `${phone}@navithya.com`;

    try {
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        await db.ref(`users/${cred.user.uid}`).set({
            name, phone, role, district: dist, village,
            status: 'pending', // Approval needed
            createdAt: Date.now()
        });
        
        if (role === 'provider') {
            await initializeProviderPlan(cred.user.uid);
        }

        alert('Signup successful! Please wait for admin approval.');
        logout();
    } catch (err) {
        alert("Signup failed: " + err.message);
    }
}

function logout() {
    auth.signOut();
    userRole = 'guest';
    updateUI();
    navigate('home');
}

// Data Loaders
function loadHomeData() {
    const grid = document.getElementById('home-services-grid');
    if (!grid) return;
    
    db.ref('services').on('value', snapshot => {
        grid.innerHTML = '';
        const services = snapshot.val();
        
        // Default services if none in DB
        const defaultServices = {
            'tv-repair': { name: 'TV & Radio Repair', icon: '📺', desc: 'Expert repair for all brands and models.', details: 'We use high-precision tools and original spare parts for all TV and radio brands.' },
            'washing-machine': { name: 'Washing Machine Repair', icon: '🌀', desc: 'Professional repair for automatic and semi-automatic machines.', details: 'Motor repairs, control board fixes, and seal replacements.' },
            'refrigerator': { name: 'Refrigerator Repair', icon: '❄️', desc: 'Gas refilling, motor repair, and cooling fixes.', details: 'Specialized in inverter and non-inverter models.' },
            'ac-service': { name: 'AC Installation & Service', icon: '❄️', desc: 'Beat the heat with expert AC maintenance.', details: 'Cleaning, gas refilling, and circuit repairs.' },
            'electrical': { name: 'Electrical Wiring', icon: '⚡', desc: 'New house wiring and diagnostic repairs.', details: 'Certified electricians for safe and durable wiring.' },
            'plumbing': { name: 'Plumbing & Water', icon: '🚰', desc: 'Leakage fixing and new pipe installations.', details: 'Pressure testing and bathroom fitting services.' },
            'mason-work': { name: 'Masonry & Construction', icon: '🧱', desc: 'High-quality basic construction and repair work.', details: 'Tiling, plastering, and foundation work.' },
            'cctv': { name: 'CCTV Security', icon: '🔍', desc: 'Protect your home with smart surveillance.', details: 'High-definition cameras with mobile remote view setup.' },
            'clothing': { name: 'Clothing & Tailoring', icon: '👕', desc: 'Custom stitching and vendor retail.', details: 'Premium fabrics and custom tailoring services.' },
            'cleaning': { name: 'Home & Office Cleaning', icon: '🧹', desc: 'Deep cleaning and sanitation services.', details: 'Professional cleaning with eco-friendly chemicals.' },
            'laptop-repair': { name: 'Laptop & PC Repair', icon: '💻', desc: 'Software and hardware troubleshooting.', details: 'OS installation, chip-level repairs, and upgrades.' },
            'transport': { name: 'Transport & Lorry', icon: '🚚', desc: 'Reliable transport for goods and moving.', details: 'Three-wheelers and Lorries available for hire.' }
        };

        const displayServices = services || defaultServices;

        Object.keys(displayServices).forEach(id => {
            const s = displayServices[id];
            const div = document.createElement('div');
            div.className = 'service-card';
            div.innerHTML = `
                <div style="font-size: 3rem; text-align: center; padding: 20px;">${s.icon || '🛠️'}</div>
                <div class="service-info">
                    <h3>${s.name}</h3>
                    <p>${s.desc}</p>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-primary" style="flex:1;" onclick="navigate('request-job')">Book</button>
                        <button class="btn-outline" style="flex:1;" onclick="showServiceDetail('${id}')">More Info</button>
                    </div>
                </div>
            `;
            grid.appendChild(div);
        });
    });
}

function showServiceDetail(id) {
    db.ref(`services/${id}`).once('value', snapshot => {
        let s = snapshot.val();
        if (!s) {
            // Fallback to defaults
             const defaultServices = {
                'tv-repair': { name: 'TV & Radio Repair', desc: 'Expert repair for all brands and models.', details: 'We use high-precision tools and original spare parts for all TV and radio brands. Circuit repairs, screen fixes, and sound issues handled.' },
                'washing-machine': { name: 'Washing Machine Repair', desc: 'Professional repair for automatic and semi-automatic machines.', details: 'Motor repairs, control board fixes, seal replacements, and drum cleaning.' },
                'refrigerator': { name: 'Refrigerator Repair', desc: 'Gas refilling, motor repair, and cooling fixes.', details: 'Specialized in inverter and non-inverter models. Fast cooling restoration and thermostat fixes.' },
                'ac-service': { name: 'AC Installation & Service', desc: 'Beat the heat with expert AC maintenance.', details: 'Cleaning, gas refilling, circuit repairs, and split unit installations.' },
                'electrical': { name: 'Electrical Wiring', desc: 'New house wiring and diagnostic repairs.', details: 'Certified electricians for safe and durable wiring. Fuse repairs, socket installations, and load balancing.' },
                'plumbing': { name: 'Plumbing & Water', desc: 'Leakage fixing and new pipe installations.', details: 'Pressure testing, bathroom fitting services, motor repairs, and water tank cleaning.' },
                'mason-work': { name: 'Masonry & Construction', desc: 'High-quality basic construction and repair work.', details: 'Tiling, plastering, foundation work, and wall construction.' },
                'cctv': { name: 'CCTV Security', desc: 'Protect your home with smart surveillance.', details: 'High-definition cameras with mobile remote view setup. Night vision and motion detection configurations.' },
                'clothing': { name: 'Clothing & Tailoring', desc: 'Custom stitching and vendor retail.', details: 'Premium fabrics and custom tailoring services for outfits, uniforms, and formal wear.' },
                'cleaning': { name: 'Home & Office Cleaning', desc: 'Deep cleaning and sanitation services.', details: 'Professional cleaning with eco-friendly chemicals. Office deep clean and home sanitation.' },
                'laptop-repair': { name: 'Laptop & PC Repair', desc: 'Software and hardware troubleshooting.', details: 'OS installation, chip-level repairs, upgrades, and data recovery services.' },
                'transport': { name: 'Transport & Lorry', desc: 'Reliable transport for goods and moving.', details: 'Three-wheelers and Lorries available for hire for home shifting or goods delivery.' }
            };
            s = defaultServices[id];
        }
        
        if (s) {
            document.getElementById('detail-title').textContent = s.name;
            document.getElementById('detail-description').textContent = s.details || s.desc;
            document.getElementById('detail-materials-list').innerHTML = `
                <li>Professional Diagnostics Toolkit</li>
                <li>Original Replacement Parts</li>
                <li>Certified Technician Labor</li>
            `;
            navigate('service-detail');
        }
    });
}

function addService(event) {
    event.preventDefault();
    const name = document.getElementById('new-service-name').value;
    const slug = name.toLowerCase().replace(/ /g, '-');
    db.ref(`services/${slug}`).set({
        name,
        desc: `Professional ${name} work.`,
        details: `Comprehensive ${name} services with verified experts.`,
        icon: '🛠️'
    });
    document.getElementById('new-service-name').value = '';
}

function populateDistricts() {
    const selects = [document.getElementById('signup-district'), document.getElementById('req-district')];
    const districts = ["Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"];
    
    selects.forEach(sel => {
        if (!sel) return;
        districts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            sel.appendChild(opt);
        });
    });
}

// Admin Logic
function loadAdminUsers() {
    const list = document.getElementById('admin-user-list');
    if (!list) return;
    
    db.ref('users').on('value', snapshot => {
        list.innerHTML = '';
        const users = snapshot.val();
        if (!users) return;

        Object.keys(users).forEach(uid => {
            const u = users[uid];
            const div = document.createElement('div');
            div.style.padding = "10px";
            div.style.background = "rgba(255,255,255,0.05)";
            div.style.marginBottom = "8px";
            div.style.borderRadius = "8px";
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${u.name}</strong> <span style="font-size:0.7rem; color:var(--primary)">${u.role.toUpperCase()}</span><br>
                        <small>${u.phone} | ${u.district}</small>
                    </div>
                    <div>
                        ${u.status === 'pending' ? 
                          `<button onclick="approveUser('${uid}')" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem;">Approve</button>` : 
                          `<span style="color: #22c55e; font-size: 0.8rem;">Active</span>`}
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    });
}

function approveUser(uid) {
    db.ref(`users/${uid}`).update({ status: 'active' })
        .then(() => alert('User approved successfully!'));
}

// Provider Dashboard Features
async function addEmployee(event) {
    event.preventDefault();
    const name = document.getElementById('emp-name').value;
    const pos = document.getElementById('emp-pos').value;
    
    if (!currentUser) return;
    
    const empId = Date.now();
    await db.ref(`users/${currentUser.uid}/employees/${empId}`).set({ name, pos });
    document.getElementById('emp-name').value = '';
    document.getElementById('emp-pos').value = '';
    loadEmployees();
}

function loadEmployees() {
    const list = document.getElementById('provider-emp-list');
    if (!list || !currentUser) return;

    db.ref(`users/${currentUser.uid}/employees`).on('value', snapshot => {
        list.innerHTML = '';
        const emps = snapshot.val();
        if (!emps) return;

        Object.keys(emps).forEach(id => {
            const e = emps[id];
            const div = document.createElement('div');
            div.className = 'card';
            div.style.padding = '10px';
            div.style.marginBottom = '5px';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <span>${e.name} - <small>${e.pos}</small></span>
                    <button onclick="deleteEmployee('${id}')" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
                </div>
            `;
            list.appendChild(div);
        });
    });
}

function deleteEmployee(id) {
    if (confirm('Delete employee?')) {
        db.ref(`users/${currentUser.uid}/employees/${id}`).remove();
    }
}

// Plan Management
async function savePlans() {
    const plans = {
        free: { price: 0, duration: '2.5 weeks' },
        weekly: { price: 250, duration: '1 week' },
        monthly: { price: 1000, duration: '1 month' },
        yearly: { price: 12000, duration: '1 year' }
    };
    await db.ref('settings/plans').set(plans);
    alert('Plans updated!');
}

async function sendBroadcast() {
    const msg = document.getElementById('broadcast-msg').value;
    if (!msg) return;
    await db.ref('broadcasts').push({ msg, time: Date.now() });
    alert('Message broadcasted to all users!');
    document.getElementById('broadcast-msg').value = '';
}

function listenForBroadcasts() {
    db.ref('broadcasts').limitToLast(1).on('child_added', snapshot => {
        const b = snapshot.val();
        if (Date.now() - b.time < 10000) { // Only show if recent
            showNotification(b.msg);
        }
    });
}

function showNotification(msg) {
    const list = document.getElementById('notification-list');
    const div = document.createElement('div');
    div.className = 'notification-item';
    div.innerHTML = `<strong>System:</strong> ${msg}`;
    list.prepend(div);
    
    const drawer = document.getElementById('notification-drawer');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('hidden'), 5000);
}

// Provider Search and Matching
async function updateProviderList() {
    const service = document.getElementById('req-service').value;
    const dist = document.getElementById('req-district').value;
    const select = document.getElementById('req-provider');
    
    select.innerHTML = '<option value="">Searching providers...</option>';
    
    db.ref('users').once('value', snapshot => {
        const users = snapshot.val();
        select.innerHTML = '<option value="">Choose a provider...</option>';
        
        if (!users) return;
        
        Object.keys(users).forEach(uid => {
            const u = users[uid];
            // Match provider role, service (if they have one), and district (auto-location logic)
            if (u.role === 'provider' && u.status === 'active' && u.district === dist) {
                const opt = document.createElement('option');
                opt.value = uid;
                opt.textContent = `${u.name} - Rating: ⭐⭐⭐⭐`; // Mock rating 1-5 as requested
                select.appendChild(opt);
            }
        });
    });
}

// Initial Call for Global Listeners
listenForBroadcasts();

// Extend navigate with hooks
function onNavigateHook(pageId) {
    if (pageId === 'admin-dashboard') loadAdminUsers();
    if (pageId === 'provider-dashboard') {
        loadEmployees();
        loadProviderJobs();
    }
    if (pageId === 'customer-dashboard') loadCustomerTracking();
    if (pageId === 'request-job') {
        const distSel = document.getElementById('req-district');
        if (distSel.options.length <= 1) populateDistricts();
    }
}

function loadCustomerTracking() {
    const list = document.getElementById('tracking-list');
    if (!list || !currentUser) return;
    
    db.ref('jobs').orderByChild('customerId').equalTo(currentUser.uid).on('value', snapshot => {
        list.innerHTML = '';
        const jobs = snapshot.val();
        if (!jobs) {
            list.innerHTML = '<p>No active jobs.</p>';
            return;
        }
        
        Object.keys(jobs).forEach(id => {
            const j = jobs[id];
            const div = document.createElement('div');
            div.className = 'card';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>Ticket: ${id}</strong><br>
                        <small>Service: ${j.service} | Status: <span style="color:var(--primary)">${j.status.toUpperCase()}</span></small>
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    });
}

// Advanced Flow: Job Completion & Payments
async function handleJobCompletion(jobId, paymentType) {
    if (!confirm(`Mark job ${jobId} as completed with ${paymentType} payment?`)) return;
    
    await db.ref(`jobs/${jobId}`).update({
        status: 'completed',
        paymentType,
        completedAt: Date.now()
    });

    if (paymentType === 'bank-advance') {
        const jobSnap = await db.ref(`jobs/${jobId}`).once('value');
        const job = jobSnap.val();
        sendBankDetailsToCustomer(job);
    }
    
    alert('Job completed!');
    loadProviderJobs();
}

async function sendBankDetailsToCustomer(job) {
    const providerSnap = await db.ref(`users/${job.providerId}`).once('value');
    const p = providerSnap.val();
    
    if (p && p.bank) {
        const msg = `Navithya Payment Details for Job ${job.jobId}:\nBank: ${p.bank.name}\nAccount: ${p.bank.acc}\nHolder: ${p.bank.holder}\nTotal Amount Due: Please check with admin.`;
        // Send to Admin for forwarding to customer as per request
        const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }
}

function loadProviderJobs() {
    const list = document.getElementById('provider-history');
    if (!list || !currentUser) return;
    
    db.ref('jobs').orderByChild('providerId').equalTo(currentUser.uid).on('value', snapshot => {
        list.innerHTML = '';
        const jobs = snapshot.val();
        if (!jobs) return;
        
        Object.keys(jobs).forEach(id => {
            const j = jobs[id];
            const div = document.createElement('div');
            div.className = 'card';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>${j.service}</strong> - ${id}<br>
                        <small>Customer: ${j.name} | Status: ${j.status.toUpperCase()}</small>
                    </div>
                    <div>
                        ${j.status === 'pending' ? `
                            <button onclick="handleJobCompletion('${id}', 'cash')" class="btn-primary" style="font-size:0.8rem;">Paid Cash</button>
                            <button onclick="handleJobCompletion('${id}', 'bank-advance')" class="btn-outline" style="font-size:0.8rem;">Bank/Advance</button>
                        ` : `<span>Completed ✅</span>`}
                    </div>
                </div>
            `;
            list.appendChild(div);
        });
    });
}

// Plan initialization on Signup
async function initializeProviderPlan(uid) {
    const expiryDate = Date.now() + (17.5 * 24 * 60 * 60 * 1000); // 2.5 weeks
    await db.ref(`users/${uid}/plan`).set({
        type: 'free-trial',
        expiry: expiryDate,
        status: 'active'
    });
}

// Monkey-patch navigate to include hooks
const originalNavigate = navigate;
navigate = function(pageId) {
    originalNavigate(pageId);
    onNavigateHook(pageId);
    renderNavbar(); // Update active state
};
