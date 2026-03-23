// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDy5PXHDOWEASIxRd2bukF5FRscxFy9ZwQ",
    authDomain: "navithya-e33ae.firebaseapp.com",
    databaseURL: "https://navithya-e33ae-default-rtdb.firebaseio.com",
    projectId: "navithya-e33ae",
    storageBucket: "navithya-e33ae.firebasestorage.app",
    messagingSenderId: "753981072296",
    appId: "1:753981072296:web:a92cb922b52fcd1fabb39d",
    measurementId: "G-7YKLBE203D"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// App State
let users = [];
let requests = [];
let homeData = { title: "Welcome to Navithya", sub: "Cloud-Based Service Portal" };
let storeItems = [];
let galleryItems = [];
let pricingData = { week: 550, month: 1250, year: 11900 };
let jobPricingItems = [];
let systemRequestsItems = [];
let currentUser = null;
let cart = [];
let orders = [];
let trackingMaps = {}; // Store Leaflet map instances

// Sri Lanka Location Data (Districts & DS Divisions)
const SRI_LANKA_AREAS = {
    "Colombo": ["Colombo", "Dehiwala", "Homagama", "Kaduwela", "Kesbewa", "Kolonnawa", "Maharagama", "Moratuwa", "Padukka", "Ratmalana", "Seethawaka", "Sri Jayawardenepura Kotte", "Thimbirigasyaya"],
    "Gampaha": ["Attanagalla", "Biyagama", "Divulapitiya", "Dompe", "Gampaha", "Ja-Ela", "Katana", "Kelaniya", "Mahara", "Minuwangoda", "Mirigama", "Negombo", "Wattala"],
    "Kalutara": ["Agalawatta", "Bandaragama", "Beruwala", "Bulathsinhala", "Dodangoda", "Horana", "Ingiriya", "Ittapana", "Kalutara", "Madurawela", "Mathugama", "Millaniya", "Palindanuwara", "Panadura", "Walallavita"],
    "Kandy": ["Abagamuwa", "Akurana", "Alawatugoda", "Deltota", "Doluwa", "Ganga Ihala Korale", "Harispattuwa", "Hatharaliyadda", "Kandy", "Kundasale", "Medadumbara", "Minipe", "Panavila", "Pasbage Korale", "Pathadumbara", "Pathahewaheta", "Poojapitiya", "Ududumbara", "Udunuwara", "Yatinuwara"],
    "Matale": ["Ambanganga Korale", "Dambulla", "Galewela", "Laggala-Pallegama", "Madipola", "Matale", "Naula", "Pallepola", "Rattota", "Ukuwela", "Wilgamuwa", "Yatawatta"],
    "Nuwara Eliya": ["Ambagamuwa", "Hanguranketha", "Kothmale", "Nuwara Eliya", "Walapane"],
    "Galle": ["Akmeemana", "Ambalangoda", "Baddegama", "Balapitiya", "Benthota", "Bope-Poddala", "Elpitiya", "Galle", "Gonapinuwala", "Habaraduwa", "Hikkaduwa", "Imaduwa", "Karandeniya", "Nagoda", "Neluwa", "Niyagama", "Thawalama", "Welivitiya-Divitura", "Yakkalamulla"],
    "Matara": ["Akuressa", "Athuraliya", "Devinuwara", "Dickwella", "Hakmana", "Kamburupitiya", "Kirinda Puhulwella", "Kotapola", "Malimbada", "Matara", "Mulatiyana", "Pasgoda", "Pitabeddara", "Thihagoda", "Weligama", "Welipitiya"],
    "Hambantota": ["Ambalantota", "Angunakolapelessa", "Beliatta", "Hambantota", "Katuwana", "Lunugamvehera", "Okewela", "Sooriyawewa", "Tangalle", "Thissamaharama", "Walasmulla", "Weeraketiya"],
    "Jaffna": ["Chavakachcheri", "Delft", "Island North", "Island South", "Jaffna", "Karainagar", "Kopay", "Maruthankerney", "Nallur", "Point Pedro", "Sandilipay", "Tellippalai", "Uduvil", "Vadamaradchi South-West", "Valikamam East", "Valikamam North", "Valikamam South", "Valikamam South-West", "Valikamam West"],
    "Kilinochchi": ["Kandavalai", "Karachchi", "Pachchilaipalli", "Poonakary"],
    "Mannar": ["Madhu", "Mannar", "Manthai West", "Musalai", "Nanattan"],
    "Vavuniya": ["Vavuniya", "Vavuniya North", "Vavuniya South", "Vengalacheddikulam"],
    "Mullaitivu": ["Maritimepattu", "Oddusuddan", "Puthukudiyiruppu", "Thunukkai", "Welioya"],
    "Batticaloa": ["Batticaloa", "Eravur Pattu", "Eravur Town", "Kattankudy", "Koralai Pattu", "Koralai Pattu Central", "Koralai Pattu North", "Koralai Pattu South", "Koralai Pattu West", "Manmunai North", "Manmunai Pattu", "Manmunai S. and Eruvil Pattu", "Manmunai South-West", "Manmunai West", "Porativu Pattu"],
    "Ampara": ["Addalaichenai", "Akkaraipattu", "Alayadiwembu", "Ampara", "Damana", "Dehiattakandiya", "Irakkamam", "Kalmunai", "Kalmunai Muslim", "Karaitivu", "Lahugala", "Mahaoya", "Navithanveli", "Nintavur", "Padiyathalawa", "Pothuvil", "Sainthamaruthu", "Samanthurai", "Tirukkovil", "Uhana"],
    "Trincomalee": ["Gomarankadawala", "Kantale", "Kinniya", "Kuchchaveli", "Morawewa", "Muttur", "Padavi Sri Pura", "Seruvila", "Thampalakamam", "Trincomalee Town and Gravets", "Verugal"],
    "Kurunegala": ["Alawwa", "Bamunakotuwa", "Bingiriya", "Ehetuwewa", "Galatara", "Galigamuwa", "Galgamuwa", "Ganewatta", "Giribawa", "Ibbagamuwa", "Kobeigane", "Kotawehera", "Kuliyapitiya East", "Kuliyapitiya West", "Kurunegala", "Mahawa", "Mallawapitiya", "Maspotha", "Mawathagama", "Narammala", "Nikaweratiya", "Panduwasnuwara East", "Panduwasnuwara West", "Pannala", "Polgahawela", "Polpithigama", "Ridigama", "Udubaddawa", "Wariyapola", "Weerambugedara"],
    "Puttalam": ["Anamaduwa", "Arachchikattuwa", "Chilaw", "Dankotuwa", "Kalpitiya", "Karuwalagaswewa", "Madampe", "Mahakumbukkadawala", "Mahawewa", "Mundalama", "Nattandiya", "Nawagattegama", "Pallama", "Puttalam", "Vanathavilluwa", "Wennappuwa"],
    "Anuradhapura": ["Anuradhapura", "Galenbindunuwewa", "Galnewa", "Horowpothana", "Ipalogama", "Kahatagasdigiliya", "Kebithigollewa", "Kekirawa", "Mahavilachchiya", "Medawachchiya", "Mihintale", "Nachchaduwa", "Nochchiyagama", "Nuwaragam Palatha Central", "Nuwaragam Palatha East", "Padaviya", "Palagala", "Palugaswewa", "Rajanganaya", "Rambewa", "Thalawa", "Thambuttegama", "Thirappane"],
    "Polonnaruwa": ["Dimbulagala", "Elahera", "Hingurakgoda", "Lankapura", "Medirigiriya", "Polonnaruwa", "Thamankaduwa", "Welikanda"],
    "Badulla": ["Badulla", "Bandarawela", "Ella", "Haldummulla", "Hali-Ela", "Haputale", "Kandaketiya", "Lunugala", "Mahiyanganaya", "Meegahakivula", "Passara", "Rideemaliyadda", "Soranathota", "Uva Paranagama", "Welimada"],
    "Moneragala": ["Badalkumbura", "Bibile", "Buttala", "Kataragama", "Madulla", "Medagama", "Moneragala", "Sevanagala", "Siyambalanduwa", "Thanamalwila", "Wellawaya"],
    "Ratnapura": ["Ayagama", "Balangoda", "Eheliyagoda", "Elapatha", "Embilipitiya", "Godakawela", "Imbulpe", "Kahawatta", "Kuruwita", "Kiriella", "Kolonne", "Nivithigala", "Opanayaka", "Pelmadulla", "Ratnapura", "Weligepola"],
    "Kegalle": ["Aranayaka", "Bulathkohupitiya", "Dehiovita", "Deraniyagala", "Galigamuwa", "Kegalle", "Mawanella", "Rambukkana", "Ruwanwella", "Warakapola", "Yatiyanthota"]
};

// Realtime listeners
db.ref('users').on('value', (snapshot) => {
    const data = snapshot.val();
    users = data ? Object.values(data) : [];
    
    const now = Date.now();
    users.forEach(u => {
        if (u.role === 'provider' && u.plan && u.plan !== 'free' && u.subscriptionExpiry && now > u.subscriptionExpiry) {
            db.ref('users/' + u.id).update({ plan: 'free', subscription: 'disconnected', subscriptionExpiry: null });
        }
    });

    if (currentUser && currentUser.role === 'admin') updateAdminPanel();
});
db.ref('requests').on('value', (snapshot) => {
    const data = snapshot.val();
    requests = data ? Object.values(data).sort((a, b) => b.id - a.id) : [];
    if (currentUser) {
        if (currentUser.role === 'admin') updateAdminPanel();
        if (currentUser.role === 'provider' || currentUser.role === 'employee') updateProviderPanel();
        if (currentUser.role === 'customer') renderTrackingDashboard();
    }
});
db.ref('homeData').on('value', (snapshot) => {
    if (snapshot.val()) {
        homeData = snapshot.val();
        document.getElementById('home-title-display').innerHTML = homeData.title;
        document.getElementById('home-sub-display').innerHTML = homeData.sub;
    }
});
db.ref('pricingData').on('value', (snapshot) => {
    if (snapshot.val()) {
        pricingData = snapshot.val();
        
        // Update display securely (if elements exist)
        const dWeek = document.getElementById('display-price-week');
        const dMonth = document.getElementById('display-price-month');
        const dYear = document.getElementById('display-price-year');
        if (dWeek) dWeek.innerText = pricingData.week;
        if (dMonth) dMonth.innerText = pricingData.month;
        if (dYear) dYear.innerText = pricingData.year;
    }
});
db.ref('storeItems').on('value', snap => {
    storeItems = snap.val() ? Object.values(snap.val()) : [];
    renderStoreItems();
});

db.ref('gallery').on('value', snap => {
    galleryItems = snap.val() ? Object.values(snap.val()) : [];
    renderGallery();
});

db.ref('orders').on('value', snap => {
    orders = snap.val() ? Object.values(snap.val()) : [];
    if (currentUser && currentUser.role === 'admin') updateAdminPanel();
});

db.ref('jobPricing').on('value', snap => {
    jobPricingItems = snap.val() ? Object.values(snap.val()) : [];
    renderJobPricing();
});

db.ref('systemRequests').on('value', snap => {
    systemRequestsItems = snap.val() ? Object.values(snap.val()) : [];
    if (currentUser && currentUser.role === 'admin') updateAdminPanel();
});

// Seasonal Themes
function applySeasonalTheme() {
    const month = new Date().getMonth(); // 0 indexed, so May is 4
    if (month === 4) { // May - Wesak
        document.body.classList.add('theme-may-wesak');
    }
    // We can add more months here later
}
applySeasonalTheme();

// Constants
const ADMIN_USER = { username: 'ADITHYA', name: 'TEAM NAVITHYA', role: 'admin' };
const ADMIN_PASS = '19980307';
const WHATSAPP_NUM = '94769929453';

// Utility: File to Base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// DOM Elements
const authOverlay = document.getElementById('auth-overlay');
const appContainer = document.getElementById('app-container');

// Tabs setup
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const btns = document.querySelectorAll('.tab-btn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;

    if (username === ADMIN_USER.username && pass === ADMIN_PASS) {
        // Admin Login
        loginSuccess(ADMIN_USER);
        return;
    }

    // Normal Users
    const foundUser = users.find(u => u.phone === username || u.name === username);
    if (foundUser) {
        if (foundUser.pass !== pass) {
            alert('Invalid Password!');
            return;
        }
        if (foundUser.status === 'pending') {
            alert('Your account is pending admin approval.');
            return;
        }
        loginSuccess(foundUser);
    } else {
        // Check for Employee Login
        let employeeFound = null;
        users.forEach(u => {
            if (u.role === 'provider' && u.employees) {
                const emp = Object.values(u.employees).find(e => e.phone === username && e.pass === pass);
                if (emp) {
                    employeeFound = { ...emp, role: 'employee', providerId: u.id, providerName: u.name };
                }
            }
        });

        if (employeeFound) {
            loginSuccess(employeeFound);
        } else {
            alert('User not found or invalid credentials.');
        }
    }
}

async function handleForgetPassword() {
    const action = confirm("Would you like to Request a Name Change (OK) or Reset Password (Cancel)?");
    const phone = prompt("Enter your phone number:");
    if (!phone) return;
    
    if (action) {
        // Name Change
        const newName = prompt("Enter the New Company Name you want:");
        if (!newName) return;
        const id = Date.now();
        db.ref('systemRequests/' + id).set({ id, type: 'name_change', phone, newName, status: 'pending', date: new Date().toISOString() });
        alert('Name change request submitted! Admin will review it shortly.');
    } else {
        // Password Reset
        const id = Date.now();
        db.ref('systemRequests/' + id).set({ id, type: 'password_reset', phone, status: 'pending', date: new Date().toISOString() });
        alert('Password reset request submitted! Admin will reach out to you.');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const pass = document.getElementById('signup-password').value;
    const nic = document.getElementById('signup-nic').value;
    const email = document.getElementById('signup-email').value;
    const nationality = document.getElementById('signup-nationality').value;
    const birthday = document.getElementById('signup-birthday').value;
    const gender = document.getElementById('signup-gender').value;
    const sponsor = document.getElementById('signup-sponsor').value;
    const province = document.getElementById('signup-province').value;
    const district = document.getElementById('signup-district').value;
    const avatarFile = document.getElementById('signup-avatar').files[0];

    let avatarBase64 = null;
    if (avatarFile) {
        try {
            avatarBase64 = await fileToBase64(avatarFile);
        } catch (err) {
            console.error("Error converting avatar to base64", err);
        }
    }

    const villageRaw = document.getElementById('signup-village').value;
    const villageOther = document.getElementById('signup-village-other').value;
    const village = villageRaw === 'Other' ? villageOther : villageRaw;

    const newUser = {
        id: Date.now(),
        name,
        phone,
        pass,
        nic,
        email,
        nationality,
        birthday,
        gender,
        sponsor,
        province,
        district,
        village,
        avatar: avatarBase64,
        role: 'unassigned',
        status: 'pending',
        plan: 'free',
        subscription: 'disconnected'
    };

    try {
        await db.ref('users/' + newUser.id).set(newUser);

        // Send WhatsApp Alert to Admin
        const message = `New User Signup Pending Approval:\nName: ${name}\nPhone: ${phone}`;
        const waUrl = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        alert('Signup successful! Please wait for Admin approval.');
        switchAuthTab('login');
    } catch (error) {
        console.error("Signup error:", error);
        alert('Signup failed. Please try again.');
    }
}

// Signup Avatar Preview
document.getElementById('signup-avatar')?.addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name || 'No image selected';
    document.getElementById('signup-avatar-preview').innerText = fileName;
});

// UI Control
function showAuthOverlay() {
    authOverlay.classList.remove('hidden');
}

function hideAuthOverlay() {
    authOverlay.classList.add('hidden');
}

function loginSuccess(user) {
    currentUser = user;
    authOverlay.classList.add('hidden');

    // UI toggles
    document.getElementById('nav-login-btn').classList.add('hidden');
    document.getElementById('nav-logout-btn').classList.remove('hidden');
    document.getElementById('profile-nav').classList.remove('hidden');
    document.getElementById('verified-experts-section').classList.remove('hidden');

    if (user.role === 'admin' || user.role === 'developer') {
        document.getElementById('admin-nav').classList.remove('hidden');
        document.getElementById('gallery-upload-section').classList.remove('hidden');
        updateAdminPanel();
    } else if (user.role === 'provider') {
        document.getElementById('gallery-upload-section').classList.remove('hidden');
    } else {
        document.getElementById('gallery-upload-section').classList.add('hidden');
    }

    if (user.role === 'sponsor') {
        document.getElementById('sponsor-nav').classList.remove('hidden');
        updateSponsorPanel();
    }

    if (user.role === 'provider') {
        document.getElementById('provider-nav').classList.remove('hidden');
        updateProviderPanel();

        // One-time company setup for approved providers
        if (user.status === 'approved' && (!user.plan || user.plan === 'free')) {
            document.getElementById('company-setup-overlay').classList.add('hidden');
        } else if (user.status === 'approved' && !user.companyName) {
            document.getElementById('company-setup-overlay').classList.remove('hidden');
        }
        
        // Welcome newly approved providers who haven't seen the welcome message yet
        if (user.status === 'approved' && !user.hasSeenWelcome) {
            showWelcomeAnimation(user);
            db.ref('users/' + user.id).update({ hasSeenWelcome: true });
        }
    }

    const isEmployee = user.role === 'employee';
    const isProvider = user.role === 'provider';
    const isCustomer = user.role === 'customer';
    const isAdmin = user.role === 'admin' || user.role === 'developer';
    const isSponsor = user.role === 'sponsor';

    // Navigation Visibility Logic
    const navItems = {
        'home-nav': true, // Always show
        'services-nav': !isEmployee,
        'pricing-nav': isProvider || isAdmin || isSponsor, 
        'jobpricing-nav': !isEmployee,
        'gallery-nav': !isEmployee,
        'store-nav': !isEmployee,
        'rate-nav': !isEmployee,
        'cart-nav': !isEmployee,
        'profile-nav': true,
        'provider-nav': isProvider || isEmployee,
        'admin-nav': isAdmin,
        'sponsor-nav': isSponsor,
        'cctv-nav': isProvider && user.providerService === 'CCTV Installation'
    };

    Object.keys(navItems).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (navItems[id]) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });

    // Greeting update
    const greetingName = (user.plan && user.plan !== 'free' && user.companyName) ? user.companyName : user.name;
    document.getElementById('home-title-display').innerHTML = `Welcome to <span class="accent">${greetingName}</span>`;

    // Show tracking for customers
    renderTrackingDashboard();

    // Persist login
    localStorage.setItem('navithyaUser', JSON.stringify(user));

    if (user.role !== 'provider' || user.hasSeenWelcome) {
        if (!user.isTempPass) alert(`Welcome back, ${user.name}!`);
    }
}

window.handleInitialPasswordChange = function(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-password-input').value;
    const confirmPass = document.getElementById('confirm-password-input').value;

    if (newPass.length < 4) {
        alert("Password must be at least 4 characters long.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Passwords do not match!");
        return;
    }

    db.ref('users/' + currentUser.id).update({
        pass: newPass,
        isTempPass: false
    }).then(() => {
        alert("Password updated successfully!");
        document.getElementById('password-change-overlay').classList.add('hidden');
        currentUser.pass = newPass;
        currentUser.isTempPass = false;
        localStorage.setItem('navithyaUser', JSON.stringify(currentUser));
    });
};

function logout() {
    currentUser = null;

    // UI toggles
    document.getElementById('nav-login-btn').classList.remove('hidden');
    document.getElementById('nav-logout-btn').classList.add('hidden');
    document.getElementById('admin-nav').classList.add('hidden');
    document.getElementById('provider-nav').classList.add('hidden');
    document.getElementById('sponsor-nav').classList.add('hidden');
    document.getElementById('verified-experts-section').classList.add('hidden');

    // Reset nav visibility for guest
    const guestNavs = ['home-nav', 'services-nav', 'jobpricing-nav', 'gallery-nav', 'store-nav', 'rate-nav', 'cart-nav', 'nav-login-btn'];
    const allNavs = ['home-nav', 'services-nav', 'pricing-nav', 'jobpricing-nav', 'gallery-nav', 'store-nav', 'rate-nav', 'profile-nav', 'provider-nav', 'admin-nav', 'sponsor-nav', 'cart-nav', 'cctv-nav', 'nav-logout-btn'];

    allNavs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    guestNavs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    });

    localStorage.removeItem('navithyaUser');
    document.getElementById('home-title-display').innerHTML = `Welcome to <span class="accent">Navithya</span>`;

    // Clear forms
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();

    // Go back home if they are on a secured page
    navigate('home');
}

// Navigation
function navigate(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');

    if (pageId === 'admin' && (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'developer'))) {
        alert('Access Denied. Admins/Developers Only.');
        navigate('home');
        return;
    }

    if (pageId === 'profile') {
        renderProfilePage();
    }

    if (pageId === 'admin') {
        updateAdminPanel();
        document.getElementById('admin-home-title').value = homeData.title;
        document.getElementById('admin-home-sub').value = homeData.sub;
    }

    if (pageId === 'provider-jobs') {
        const tabs = document.getElementById('provider-tabs');
        if (currentUser && currentUser.role === 'employee') {
            tabs.classList.add('hidden');
        } else {
            tabs.classList.remove('hidden');
        }
        updateProviderPanel();
    }
    if (pageId === 'jobpricing') {
        if (currentUser && currentUser.role === 'provider' && (!currentUser.plan || currentUser.plan === 'free')) {
            alert('Job Pricing access is reserved for Premium Providers. Please upgrade your plan to access standard estimates.');
            navigate('home');
            return;
        }
    }

    if (pageId === 'provider-jobs') {
        updateProviderPanel();
    }

    if (pageId === 'gallery') {
        renderGallery();
    }
    
    if (pageId === 'pricing') {
        const canManagePricing = currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer');
        const adminControls = document.getElementById('pricing-admin-controls');
        if (canManagePricing) {
            adminControls.classList.remove('hidden');
            document.getElementById('edit-price-week').value = pricingData.week;
            document.getElementById('edit-price-month').value = pricingData.month;
            document.getElementById('edit-price-year').value = pricingData.year;
        } else {
            adminControls.classList.add('hidden');
        }
    }
    
    if (pageId === 'cart') {
        renderCart();
    }
    
    if (pageId === 'rate') {
        renderProvidersForRating();
        renderReviews();
    }

    if (pageId === 'sponsor') {
        updateSponsorPanel();
    }

    if (pageId === 'cctv-demo') {
        const canSeeCctv = currentUser && currentUser.role === 'provider' && currentUser.providerService === 'CCTV Installation';
        if (!canSeeCctv) {
            alert('Access Denied. CCTV Live is for CCTV Providers only.');
            navigate('home');
            return;
        }
        loadEzvizDemo('ezviz-home-container');
    }

    // Hide Plans for Customers
    const pricingNav = document.getElementById('pricing-nav');
    if (currentUser && currentUser.role === 'customer') {
        if (pricingNav) pricingNav.classList.add('hidden');
        if (pageId === 'pricing') {
            alert('Access Denied. Plans are for Providers only.');
            navigate('home');
            return;
        }
    } else {
        if (pricingNav) pricingNav.classList.remove('hidden');
    }
}

// Request Handling
function filterProviders() {
    const dist = document.getElementById('req-district').value;
    const serv = document.getElementById('req-service').value;

    const resultsDiv = document.getElementById('provider-results');
    const list = document.getElementById('provider-list');
    list.innerHTML = '';

    if (!serv) {
        resultsDiv.classList.add('hidden');
        return;
    }

    const matched = users.filter(u => {
        const isProvider = u.role === 'provider' && u.status === 'approved';
        const hasService = u.providerService === serv;
        const matchesDistrict = dist ? u.district === dist : true;
        return isProvider && hasService && matchesDistrict;
    });

    if (matched.length > 0) {
        matched.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:5px 0;">
                    <span>✅ ${p.name} (Verified)</span>
                    <button type="button" onclick="selectProvider('${p.id}', '${p.name}')" class="btn-outline" style="padding:2px 10px; font-size:0.8rem;">Select</button>
                </div>
            `;
            list.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "No verified providers available in this area yet. Our Admin will assign one manually.";
        li.style.color = '#666';
        list.appendChild(li);
    }

    resultsDiv.classList.remove('hidden');
}

window.selectProvider = function (id, name) {
    document.getElementById('selected-provider-id').value = id;
    alert(`Provider ${name} selected! Now click 'Book Service'.`);
};

function handleGalleryUpload(e) {
    e.preventDefault();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'developer')) return;

    const url = document.getElementById('gallery-url').value;
    const type = document.getElementById('gallery-type').value;
    const id = Date.now();

    db.ref('gallery/' + id).set({ id, url, type });
    document.getElementById('gallery-upload-form').reset();
    alert('Media uploaded successfully!');
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    galleryItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';

        if (item.type === 'video') {
            div.innerHTML = `<video src="${item.url}" controls></video>`;
        } else {
            div.innerHTML = `<img src="${item.url}" alt="Gallery Item">`;
        }

        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer')) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'Delete';
            delBtn.onclick = () => deleteGalleryItem(item.id);
            div.appendChild(delBtn);
        }
        grid.appendChild(div);
    });
}

function deleteGalleryItem(id) {
    if (confirm('Delete this item from gallery?')) {
        db.ref('gallery/' + id).remove();
    }
}

function handleServiceRequest(e) {
    e.preventDefault();
    if (!currentUser) {
        alert('You must be logged in to Request a Service!');
        showAuthOverlay();
        return;
    }

    const dist = document.getElementById('req-district').value;
    const serv = document.getElementById('req-service').value;
    const desc = document.getElementById('req-desc').value;
    const providerId = document.getElementById('selected-provider-id').value;
    let providerName = null;
    let providerPhone = null;

    if (providerId) {
        const p = users.find(u => u.id == providerId);
        if (p) {
            providerName = p.name;
            providerPhone = p.phone;
        }
    }

    const villageRaw = document.getElementById('req-village').value;
    const villageOther = document.getElementById('req-village-other').value;
    const village = villageRaw === 'Other' ? villageOther : villageRaw;

    const reqId = Date.now();
    const reqData = {
        id: reqId,
        userId: currentUser.id,
        userName: currentUser.name,
        userPhone: currentUser.phone,
        district: dist,
        village: village,
        service: serv,
        desc: desc,
        status: 'pending_admin', // ALWAYS starts as pending_admin for approval
        providerId: providerId || null,
        providerName: providerName || null,
        providerPhone: providerPhone || null
    };

    db.ref('requests/' + reqId).set(reqData);

    // Notify Admin via WhatsApp
    const adminMsg = `New Job Request Pending Approval:\nDistrict: ${dist}\nVillage: ${village}\nService: ${serv}\nCustomer: ${currentUser.name} (${currentUser.phone})\nDetails: ${desc}`;
    const adminWaUrl = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(adminMsg)}`;
    window.open(adminWaUrl, '_blank');

    // Notify Provider via WhatsApp (if selected)
    if (providerPhone) {
        const providerMsg = `New Potential Job (Awaiting Admin Approval):\nService: ${serv}\nDistrict: ${dist}\nDetails: ${desc}`;
        const providerWaUrl = `https://wa.me/${providerPhone}?text=${encodeURIComponent(providerMsg)}`;
        setTimeout(() => window.open(providerWaUrl, '_blank'), 1000);
    }

    alert('Request submitted! It is currently pending Admin Approval.');
    navigate('home');
    document.getElementById('service-request-form').reset();
    document.getElementById('selected-provider-id').value = '';
}

// Admin Panel Logic
function updateAdminPanel() {
    const canManage = currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer' || currentUser.role === 'provider');
    if (!canManage) return;

    document.getElementById('stat-users').innerText = users.length;
    document.getElementById('stat-requests').innerText = requests.length;
    document.getElementById('stat-orders').innerText = orders.length;

    const usersList = document.getElementById('admin-users-list');
    usersList.innerHTML = '';
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';

        const approveBtn = u.status === 'pending' ? `<button onclick="adminSetUserStatus(${u.id}, 'approved')" style="background:green;color:white;padding:5px;border:none;cursor:pointer;">Approve</button>` : `<span style="color:green;">Approved</span>`;
        const deleteBtn = `<button onclick="adminDeleteUser(${u.id})" style="background:red;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Delete</button>`;

        const roleSelect = `
            <select onchange="adminChangeRole(${u.id}, this.value)" style="padding:5px; margin-bottom: 5px; width: 100%;">
                <option value="unassigned" ${u.role === 'unassigned' ? 'selected' : ''}>Unassigned</option>
                <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Customer</option>
                <option value="provider" ${u.role === 'provider' ? 'selected' : ''}>Provider</option>
                <option value="developer" ${u.role === 'developer' ? 'selected' : ''}>Developer</option>
                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
            <br>
            <select onchange="adminChangeService(${u.id}, this.value)" style="padding:5px; width: 100%; display: ${u.role === 'provider' ? 'block' : 'none'};">
                <option value="" disabled ${!u.providerService ? 'selected' : ''}>Select Service Base</option>
                <optgroup label="Security & Electrical">
                    <option value="CCTV Installation & Maintenance" ${u.providerService === 'CCTV Installation & Maintenance' ? 'selected' : ''}>CCTV Installation & Maintenance</option>
                    <option value="CCTV Remote Monitoring Setup" ${u.providerService === 'CCTV Remote Monitoring Setup' ? 'selected' : ''}>CCTV Remote Monitoring Setup</option>
                    <option value="House Wiring & Rewiring" ${u.providerService === 'House Wiring & Rewiring' ? 'selected' : ''}>House Wiring & Rewiring</option>
                    <option value="Solar Panel Installation" ${u.providerService === 'Solar Panel Installation' ? 'selected' : ''}>Solar Panel Installation</option>
                    <option value="Electrical Repairs & Generator Setup" ${u.providerService === 'Electrical Repairs & Generator Setup' ? 'selected' : ''}>Electrical Repairs & Generator Setup</option>
                    <option value="Air Conditioner Installation & Repair" ${u.providerService === 'Air Conditioner Installation & Repair' ? 'selected' : ''}>Air Conditioner Installation & Repair</option>
                </optgroup>
                <optgroup label="Construction & Home Improvement">
                    <option value="House Construction (Full / Partial)" ${u.providerService === 'House Construction (Full / Partial)' ? 'selected' : ''}>House Construction (Full / Partial)</option>
                    <option value="Plumbing Services" ${u.providerService === 'Plumbing Services' ? 'selected' : ''}>Plumbing Services</option>
                    <option value="Tiling & Mason Work" ${u.providerService === 'Tiling & Mason Work' ? 'selected' : ''}>Tiling & Mason Work</option>
                    <option value="Ceiling (PVC / Gypsum)" ${u.providerService === 'Ceiling (PVC / Gypsum)' ? 'selected' : ''}>Ceiling (PVC / Gypsum)</option>
                    <option value="Painting (Interior & Exterior)" ${u.providerService === 'Painting (Interior & Exterior)' ? 'selected' : ''}>Painting (Interior & Exterior)</option>
                    <option value="Aluminium & Glass Work" ${u.providerService === 'Aluminium & Glass Work' ? 'selected' : ''}>Aluminium & Glass Work</option>
                </optgroup>
                <optgroup label="Agriculture & Landscaping">
                    <option value="Coconut / Tea / Rubber Plantation Setup" ${u.providerService === 'Coconut / Tea / Rubber Plantation Setup' ? 'selected' : ''}>Coconut / Tea / Rubber Plantation Setup</option>
                    <option value="Landscaping & Garden Design" ${u.providerService === 'Landscaping & Garden Design' ? 'selected' : ''}>Landscaping & Garden Design</option>
                    <option value="Garden Maintenance" ${u.providerService === 'Garden Maintenance' ? 'selected' : ''}>Garden Maintenance</option>
                    <option value="Irrigation Systems (Drip / Spray)" ${u.providerService === 'Irrigation Systems (Drip / Spray)' ? 'selected' : ''}>Irrigation Systems (Drip / Spray)</option>
                    <option value="Organic Farming Support" ${u.providerService === 'Organic Farming Support' ? 'selected' : ''}>Organic Farming Support</option>
                    <option value="Plant Nursery Supply" ${u.providerService === 'Plant Nursery Supply' ? 'selected' : ''}>Plant Nursery Supply</option>
                </optgroup>
                <optgroup label="Arts, Crafts & Gifts">
                    <option value="Handmade Jewelry" ${u.providerService === 'Handmade Jewelry' ? 'selected' : ''}>Handmade Jewelry</option>
                    <option value="Batik & Tie-Dye Products" ${u.providerService === 'Batik & Tie-Dye Products' ? 'selected' : ''}>Batik & Tie-Dye Products</option>
                    <option value="Wooden Crafts & Carvings" ${u.providerService === 'Wooden Crafts & Carvings' ? 'selected' : ''}>Wooden Crafts & Carvings</option>
                    <option value="Clay Pots & Pottery" ${u.providerService === 'Clay Pots & Pottery' ? 'selected' : ''}>Clay Pots & Pottery</option>
                    <option value="Handmade Soaps & Candles" ${u.providerService === 'Handmade Soaps & Candles' ? 'selected' : ''}>Handmade Soaps & Candles</option>
                    <option value="Custom Gift Items" ${u.providerService === 'Custom Gift Items' ? 'selected' : ''}>Custom Gift Items</option>
                </optgroup>
                <optgroup label="Tech & Electronic Repair">
                    <option value="Mobile Phone Repair" ${u.providerService === 'Mobile Phone Repair' ? 'selected' : ''}>Mobile Phone Repair</option>
                    <option value="Laptop & Computer Repair" ${u.providerService === 'Laptop & Computer Repair' ? 'selected' : ''}>Laptop & Computer Repair</option>
                    <option value="TV & Electronic Repair" ${u.providerService === 'TV & Electronic Repair' ? 'selected' : ''}>TV & Electronic Repair</option>
                    <option value="Refrigerator & Washing Machine Repair" ${u.providerService === 'Refrigerator & Washing Machine Repair' ? 'selected' : ''}>Refrigerator & Washing Machine Repair</option>
                </optgroup>
                <optgroup label="Transport & Logistics">
                    <option value="Three Wheel / Lorry Hire" ${u.providerService === 'Three Wheel / Lorry Hire' ? 'selected' : ''}>Three Wheel / Lorry Hire</option>
                    <option value="Moving & Packing Services" ${u.providerService === 'Moving & Packing Services' ? 'selected' : ''}>Moving & Packing Services</option>
                    <option value="Courier Services" ${u.providerService === 'Courier Services' ? 'selected' : ''}>Courier Services</option>
                </optgroup>
                <optgroup label="Other Services">
                    <option value="Home & Office Cleaning" ${u.providerService === 'Home & Office Cleaning' ? 'selected' : ''}>Home & Office Cleaning</option>
                    <option value="Graphic Designing" ${u.providerService === 'Graphic Designing' ? 'selected' : ''}>Graphic Designing</option>
                    <option value="Social Media Management" ${u.providerService === 'Social Media Management' ? 'selected' : ''}>Social Media Management</option>
                    <option value="Website Development" ${u.providerService === 'Website Development' ? 'selected' : ''}>Website Development</option>
                    <option value="Online Marketing (Facebook Ads)" ${u.providerService === 'Online Marketing (Facebook Ads)' ? 'selected' : ''}>Online Marketing (Facebook Ads)</option>
                </optgroup>
            </select>
        `;

        const bankDetailsBtn = u.role === 'provider' && u.bankName ? `<button onclick="adminViewBankDetails('${u.bankName}', '${u.bankBranch}', '${u.bankAccount}', '${u.bankHolder}')" style="background:#17a2b8;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Bank Info</button>` : '';

        let subBtn = '';
        if (u.role === 'provider' && u.status === 'approved') {
            const isSubbed = u.subscription === 'active';
            
            const planSelect = `
                <select onchange="adminChangePlan(${u.id}, this.value)" style="padding:5px; margin-top:5px; width:100%; font-size:0.8rem;">
                    <option value="free" ${u.plan === 'free' ? 'selected' : ''}>Free</option>
                    <option value="weekly" ${u.plan === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${u.plan === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="yearly" ${u.plan === 'yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            `;

            if (isSubbed) {
                subBtn = `<br><span style="color:blue; font-size:0.8rem;">Sub: Active (${u.plan || 'free'})</span>${planSelect}<br><button onclick="adminToggleSub(${u.id}, 'disconnected')" style="background:orange;color:white;padding:5px;border:none;cursor:pointer;margin-top:5px;font-size:0.8rem;">Disconnect Sub</button>`;
            } else {
                subBtn = `<br><span style="color:grey; font-size:0.8rem;">Sub: Disconnected</span>${planSelect}<br><button onclick="adminToggleSub(${u.id}, 'active')" style="background:#28a745;color:white;padding:5px;border:none;cursor:pointer;margin-top:5px;font-size:0.8rem;">Activate Sub</button>`;
            }
        }

        tr.innerHTML = `
            <td style="padding:10px;">${u.name}</td>
            <td style="padding:10px;">📞 ${u.phone}<br><small>🗺️ ${u.district || 'Any'}, ${u.province || ''}</small></td>
            <td style="padding:10px;">${u.status}</td>
            <td style="padding:10px; min-width:180px;">${roleSelect}</td>
            <td style="padding:10px;">${approveBtn} ${deleteBtn} ${bankDetailsBtn} ${subBtn}</td>
        `;
        usersList.appendChild(tr);
    });

    const reqsList = document.getElementById('admin-requests-list');
    reqsList.innerHTML = '';
    requests.slice().reverse().forEach(r => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';

        let actionBtns = '';
        if (r.status === 'pending_admin') {
            const providersForService = users.filter(u => u.role === 'provider' && u.status === 'approved' && u.providerService === r.service);
            let providerOptions = providersForService.map(p => `<option value="${p.id}" ${r.providerId == p.id ? 'selected' : ''}>${p.name}</option>`).join('');

            actionBtns = `
                <select onchange="adminAssignProvider(${r.id}, this.value)" style="padding:5px; margin-bottom: 5px;">
                    <option value="">Choose Provider</option>
                    ${providerOptions}
                </select>
                <button onclick="adminApproveJob(${r.id})" style="background:green;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Approve Job</button>
                <button onclick="adminRejectRequest(${r.id})" style="background:orange;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Reject</button>
            `;
        } else if (r.status === 'assigned') {
            actionBtns = `<span style="color:#2979ff;">Approved & Assigned to ${r.providerName || 'N/A'}</span>`;
        } else if (r.status === 'accepted') {
            actionBtns = `<span style="color:var(--primary);">Accepted</span>`;
        } else if (r.status === 'on_my_way') {
            actionBtns = `<span style="color:orange;">On My Way</span>`;
        } else if (r.status === 'at_location') {
            actionBtns = `<span style="color:green;">At Location</span>`;
        } else if (r.status === 'checking_issue') {
            actionBtns = `<span style="color:blue;">Checking Issue</span>`;
        } else if (r.status === 'completed') {
            actionBtns = `<span style="color:purple;">Completed</span>`;
        } else if (r.status === 'rejected') {
            actionBtns = `<span style="color:red;">Rejected</span>`;
        }
        actionBtns += `<button onclick="adminDeleteRequest(${r.id})" style="background:red;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Delete</button>`;


        let customerInfo = r.userName || r.customerName || 'N/A';
        let completionDetails = '';
        if (r.status === 'completed' && r.completionImage) {
            completionDetails = `<br><br><a href="${r.completionImage}" target="_blank"><img src="${r.completionImage}" style="max-width: 150px; border-radius: 4px; border: 1px solid #eee;"></a>`;
        }

        tr.innerHTML = `
            <td style="padding:10px;">${new Date(r.id).toLocaleString()}</td>
            <td style="padding:10px;">${customerInfo}</td>
            <td style="padding:10px;">${r.service}</td>
            <td style="padding:10px;">${r.district}</td>
            <td style="padding:10px;">${r.status || 'pending'}${completionDetails}</td>
            <td style="padding:10px;">${actionBtns}</td>
        `;
        reqsList.appendChild(tr);
    });

    const ordersList = document.getElementById('admin-orders-list');
    if(ordersList) {
        ordersList.innerHTML = '';
        orders.slice().reverse().forEach(o => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';
            
            let statusBadge = '';
            if(o.status === 'pending') statusBadge = '<span style="color:orange;">Pending</span>';
            if(o.status === 'completed') statusBadge = '<span style="color:green;">Completed</span>';
            
            let actionBtn = '';
            if(o.status === 'pending') {
                 actionBtn = `<button onclick="adminCompleteOrder(${o.id})" style="background:green;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Mark Completed</button>`;
            }
            actionBtn += `<button onclick="adminDeleteOrder(${o.id})" style="background:red;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Delete</button>`;

            let itemsDesc = o.items.map(i => `${i.name} (x${i.qty})`).join(', ');

            tr.innerHTML = `
                <td style="padding:10px;">${new Date(o.id).toLocaleString()}</td>
                <td style="padding:10px;">${o.userName} <br><small>📞 ${o.phone}</small></td>
                <td style="padding:10px;">${itemsDesc}</td>
                <td style="padding:10px;">Rs. ${o.total}</td>
                <td style="padding:10px;">${statusBadge} ${actionBtn}</td>
            `;
            ordersList.appendChild(tr);
        });
    }

    const storeList = document.getElementById('admin-store-products-list');
    if (storeList) {
        storeList.innerHTML = '';
        storeItems.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:10px;"><img src="${item.image || 'https://via.placeholder.com/50'}" width="50" height="50" style="object-fit:cover; border-radius:4px;"></td>
                <td style="padding:10px;">${item.name}</td>
                <td style="padding:10px;">${item.price}</td>
                <td style="padding:10px;"><button onclick="adminDeleteStoreItem(${item.id})" style="background:red;color:white;padding:5px;border:none;cursor:pointer;">Delete</button></td>
            `;
            storeList.appendChild(tr);
        });
    }

    const sysList = document.getElementById('admin-system-requests-list');
    if (sysList) {
        sysList.innerHTML = '';
        systemRequestsItems.forEach(req => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';
            
            let actionBtn = '';
            if (req.status === 'pending') {
                if (req.type === 'name_change') {
                    actionBtn = `<button onclick="adminApproveSystemReq(${req.id})" style="background:green;color:white;padding:5px;border:none;cursor:pointer;">Approve Name Change</button>`;
                } else if (req.type === 'password_reset') {
                    actionBtn = `<button onclick="adminApproveSystemReq(${req.id})" style="background:#17a2b8;color:white;padding:5px;border:none;cursor:pointer;">Mark Resolved</button>`;
                } else if (req.type === 'plan_upgrade') {
                    actionBtn = `<button onclick="adminApproveSystemReq(${req.id})" style="background:purple;color:white;padding:5px;border:none;cursor:pointer;">Approve Plan Selection</button>`;
                }
            } else {
                actionBtn = `<span style="color:green;">Resolved</span>`;
            }
            actionBtn += `<button onclick="adminDeleteSystemReq(${req.id})" style="background:red;color:white;padding:5px;border:none;cursor:pointer;margin-left:5px;">Delete</button>`;

            let desc = req.type === 'name_change' ? `Requested Name: ${req.newName}` : (req.type === 'plan_upgrade' ? `Requested Plan: ${req.reqPlan}` : `User requested password reset`);

            tr.innerHTML = `
                <td style="padding:10px;">${new Date(req.date || req.id).toLocaleString()}</td>
                <td style="padding:10px;">Phone: ${req.phone}</td>
                <td style="padding:10px;"><strong>${req.type.replace('_', ' ').toUpperCase()}</strong><br><small>${desc}</small></td>
                <td style="padding:10px;">${req.status}<br>${actionBtn}</td>
            `;
            sysList.appendChild(tr);
        });
    }
}

function adminSetUserStatus(id, status) {
    db.ref('users/' + id).update({ status: status });
    alert('User status updated');
}

function adminChangeRole(id, role) {
    db.ref('users/' + id).update({ role: role });
    alert('Role updated to ' + role);
}

function adminChangeService(id, service) {
    db.ref('users/' + id).update({ providerService: service });
    alert('Provider specialized service updated.');
}

function adminAcceptRequest(id) {
    db.ref('requests/' + id).update({ status: 'accepted' });
    alert('Job Accepted');
}

function adminUpdateHomeInfo(e) {
    e.preventDefault();
    const t = document.getElementById('admin-home-title').value;
    const s = document.getElementById('admin-home-sub').value;
    db.ref('homeData').set({ title: t, sub: s });
    alert('Home Info updated!');
}

window.handlePricingUpdate = function(e) {
    e.preventDefault();
    const w = document.getElementById('edit-price-week').value;
    const m = document.getElementById('edit-price-month').value;
    const y = document.getElementById('edit-price-year').value;
    db.ref('pricingData').set({ week: w, month: m, year: y }).then(() => {
        alert('Pricing constraints updated successfully!');
    });
};

window.adminAddJobPricing = function(e) {
    e.preventDefault();
    const category = document.getElementById('admin-job-category').value;
    const task = document.getElementById('admin-job-task').value;
    const cost = document.getElementById('admin-job-cost').value;
    const id = Date.now();
    
    db.ref('jobPricing/' + id).set({ id, category, task, cost }).then(() => {
        alert('Job Pricing added!');
        e.target.reset();
    });
};

window.adminDeleteJobPricing = function(id) {
    if(confirm('Delete this job pricing rule?')) {
        db.ref('jobPricing/' + id).remove();
    }
};

window.renderJobPricing = function() {
    const table = document.getElementById('job-pricing-list');
    if(!table) return;
    
    table.innerHTML = '';
    
    if(jobPricingItems.length === 0) {
        table.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 2rem;">No pricing estimations have been added yet. check back later!</td></tr>';
        return;
    }
    
    jobPricingItems.forEach(job => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        
        let actionBtn = '';
        if(currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer')) {
            actionBtn = `<br><button onclick="adminDeleteJobPricing(${job.id})" style="background:red; color:white; border:none; padding:3px 8px; border-radius:4px; font-size:0.75rem; margin-top:5px; cursor:pointer;">Delete Estimate</button>`;
        }
        
        tr.innerHTML = `
            <td style="padding:15px; font-weight: 500;">${job.category}</td>
            <td style="padding:15px;">${job.task} ${actionBtn}</td>
            <td style="padding:15px; color: var(--primary); font-weight: bold;">Rs. ${job.cost}</td>
        `;
        table.appendChild(tr);
    });
};

async function adminAddStoreItem(e) {
    e.preventDefault();
    const name = document.getElementById('admin-store-name').value;
    const desc = document.getElementById('admin-store-desc').value;
    const price = document.getElementById('admin-store-price').value;
    const imgFile = document.getElementById('admin-store-image').files[0];

    if (!imgFile) return alert('Please select a product image.');

    const imgBase64 = await fileToBase64(imgFile);
    const newItem = { id: Date.now(), name, desc, price, image: imgBase64 };
    
    db.ref('storeItems/' + newItem.id).set(newItem).then(() => {
        alert('Store item added!');
        e.target.reset();
    });
}

function renderStoreItems() {
    const grid = document.querySelector('.store-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (storeItems.length === 0) {
        grid.innerHTML = '<p>No items in store.</p>';
        return;
    }
    storeItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'store-item card';
        const canManage = currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer' || (currentUser.role === 'provider' && currentUser.plan && currentUser.plan !== 'free'));
        const imgUrl = item.image || 'https://via.placeholder.com/150';
        div.innerHTML = `
            <img src="${imgUrl}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:10px;">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <span class="price">${item.price}</span>
            <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                <button class="btn-outline" onclick="addToCart(${item.id})">Buy Now</button>
                ${canManage ?
                `<button onclick="adminEditStoreItem(${item.id})" style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Edit</button>
                     <button onclick="adminDeleteStoreItem(${item.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>` : ''}
            </div>
        `;
        grid.appendChild(div);
    });
}

window.adminEditStoreItem = function (id) {
    const item = storeItems.find(i => i.id == id);
    if (!item) return;

    const newName = prompt("Edit Item Name:", item.name);
    if (newName === null) return;
    const newDesc = prompt("Edit Description:", item.desc);
    if (newDesc === null) return;
    const newPrice = prompt("Edit Price (e.g. Rs. 5000):", item.price);
    if (newPrice === null) return;
    
    const updatePhoto = confirm("Would you like to change the product image?");
    if (updatePhoto) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async () => {
            if (fileInput.files[0]) {
                const base64 = await fileToBase64(fileInput.files[0]);
                db.ref('storeItems/' + id).update({
                    name: newName,
                    desc: newDesc,
                    price: newPrice,
                    image: base64
                }).then(() => alert('Store item updated with new image!'));
            }
        };
        fileInput.click();
    } else {
        db.ref('storeItems/' + id).update({
            name: newName,
            desc: newDesc,
            price: newPrice
        }).then(() => {
            alert('Store item updated successfully!');
        }).catch(err => {
            alert('Error updating item: ' + err.message);
        });
    }
};


// Admin Panel Helpers
window.adminDeleteUser = function (uid) {
    if (confirm('Permanently delete this user?')) {
        db.ref('users/' + uid).remove();
    }
};

window.adminToggleSub = function(uid, subStatus) {
    db.ref('users/' + uid).update({ subscription: subStatus });
};

window.adminChangePlan = function(id, newPlan) {
    let updates = { plan: newPlan };
    if (newPlan !== 'free') {
        updates.subscription = 'active';
        const now = Date.now();
        const DayMs = 86400000;
        let expiry = null;
        if (newPlan === 'weekly') expiry = now + (7 * DayMs);
        if (newPlan === 'monthly') expiry = now + (30 * DayMs);
        if (newPlan === 'yearly') expiry = now + (365 * DayMs);
        if (expiry) updates.subscriptionExpiry = expiry;
    } else {
        updates.subscription = 'disconnected';
        updates.subscriptionExpiry = null;
    }
    
    db.ref('users/' + id).update(updates);
    alert('Provider plan updated to ' + newPlan);
};

window.adminApproveSystemReq = function(reqId) {
    const req = systemRequestsItems.find(r => r.id === reqId);
    if (!req) return;
    
    const foundUser = req.userId ? users.find(u => u.id == req.userId) : users.find(u => u.phone === req.phone);
    if (!foundUser) {
        alert("User not found for this request.");
        return;
    }

    if (req.type === 'name_change') {
        db.ref('users/' + foundUser.id).update({ companyName: req.newName });
        const msg = `Your Company Name Change Request has been APPROVED!\nNew Name: ${req.newName}\nLog in now: ${window.location.href}`;
        const waUrl = `https://wa.me/${foundUser.phone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    } else if (req.type === 'plan_upgrade') {
        adminChangePlan(foundUser.id, req.reqPlan);
        const msg = `Your Plan Upgrade Request to ${req.reqPlan} has been APPROVED!\nLog in now: ${window.location.href}`;
        const waUrl = `https://wa.me/${foundUser.phone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    } else if (req.type === 'password_reset') {
        const tempPIN = Math.floor(100000 + Math.random() * 900000).toString();
        db.ref('users/' + foundUser.id).update({ 
            pass: tempPIN,
            isTempPass: true 
        });
        const msg = `Your Password Reset Request has been APPROVED!\nTemporary Password: ${tempPIN}\n\nPlease log in and change your password immediately.\nLog in now: ${window.location.href}`;
        const waUrl = `https://wa.me/${foundUser.phone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
    }

    db.ref('systemRequests/' + reqId).update({ status: 'resolved' });
    alert('Request Approved & Resolved!');
};

window.adminDeleteSystemReq = function(reqId) {
    if (confirm("Delete this request?")) {
        db.ref('systemRequests/' + reqId).remove();
    }
};

window.adminRejectRequest = function (rid) {
    if (confirm('Reject this job request?')) {
        db.ref('requests/' + rid).update({ status: 'rejected' });
    }
};

window.adminDeleteRequest = function (rid) {
    if (confirm('Permanently delete this job request?')) {
        db.ref('requests/' + rid).remove();
    }
};

window.adminAssignProvider = function (rid, pid) {
    if (!pid) return;
    const provider = users.find(u => u.id == pid);
    db.ref('requests/' + rid).update({
        providerId: pid,
        providerName: provider.name,
        providerPhone: provider.phone
    });
    alert('Provider ' + provider.name + ' selected for this job.');
};

window.adminSetUserStatus = function (id, status) {
    let updates = { status: status };
    if (status === 'approved') {
        const userToApprove = users.find(u => u.id === id);
        if (userToApprove && userToApprove.role === 'provider' && (!userToApprove.plan || userToApprove.plan === 'free') && !userToApprove.hasSeenWelcome) {
            updates.plan = 'trial';
            updates.subscription = 'active';
            updates.subscriptionExpiry = Date.now() + (14 * 86400000); // 2 weeks free trial
        }
    }
    db.ref('users/' + id).update(updates);
    alert('User status updated');
};

window.adminChangeRole = function (id, role) {
    db.ref('users/' + id).update({ role: role });
    alert('Role updated to ' + role);
};

window.adminChangeService = function (id, service) {
    db.ref('users/' + id).update({ providerService: service });
    alert('Provider specialized service updated.');
};

window.adminApproveJob = function (rid) {
    const job = requests.find(r => r.id == rid);
    if (!job.providerId) {
        alert("Please assign a provider before approving the job.");
        return;
    }

    db.ref('requests/' + rid).update({ status: 'assigned' });

    // Notify Provider via WhatsApp on official approval
    const msg = `Job Approved & Assigned to You!\nService: ${job.service}\nDistrict: ${job.district}\nCustomer: ${job.userName} (${job.userPhone})\nDetails: ${job.desc}`;
    const waUrl = `https://wa.me/${job.providerPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    alert('Job Approved and Assigned! WhatsApp notification sent to provider.');
};

window.adminDeleteStoreItem = function (id) {
    if (confirm('Delete this item from store?')) {
        db.ref('storeItems/' + id).remove();
    }
};

window.adminAcceptRequest = function (id) {
    db.ref('requests/' + id).update({ status: 'accepted' });
    alert('Job Accepted');
};

window.adminCompleteOrder = function (id) {
    db.ref('orders/' + id).update({ status: 'completed' });
};

window.adminDeleteOrder = function (id) {
    if (confirm("Delete this order?")) {
        db.ref('orders/' + id).remove();
    }
};

// Cart Logic
window.addToCart = function (itemId) {
    const item = storeItems.find(i => i.id == itemId);
    if (!item) return;

    const existing = cart.find(c => c.item.id == itemId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ item: item, qty: 1 });
    }
    
    updateCartCounter();
    alert(`${item.name} added to cart!`);
};

function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (!counter) return;
    const total = cart.reduce((sum, c) => sum + c.qty, 0);
    counter.innerText = total;
}

window.renderCart = function() {
    const container = document.getElementById('cart-content');
    const checkoutSec = document.getElementById('checkout-section');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. Go add some items from the store!</p>';
        checkoutSec.classList.add('hidden');
        return;
    }
    
    let totalValue = 0;
    
    cart.forEach(c => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '15px';
        div.style.background = '#fff';
        div.style.border = '1px solid #ccc';
        div.style.borderRadius = '8px';
        
        let numericPrice = parseInt(c.item.price.replace(/[^0-9]/g, '')) || 0;
        let lineTotal = numericPrice * c.qty;
        totalValue += lineTotal;
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <img src="${c.item.image || 'https://via.placeholder.com/50'}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                <div>
                    <h4 style="margin-bottom:5px;">${c.item.name}</h4>
                    <span style="color:var(--text-muted); font-size:0.9rem;">${c.item.price} x ${c.qty}</span>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="font-weight:bold;">Rs. ${lineTotal}</span>
                <button onclick="removeFromCart(${c.item.id})" class="btn-outline" style="padding:5px 10px; border-color:red; color:red;">Remove</button>
            </div>
        `;
        container.appendChild(div);
    });
    
    const totalDiv = document.createElement('div');
    totalDiv.style.textAlign = 'right';
    totalDiv.style.marginTop = '15px';
    totalDiv.innerHTML = `<h3 style="font-size:1.5rem; color:var(--primary);">Total: Rs. ${totalValue}</h3>`;
    container.appendChild(totalDiv);
    
    checkoutSec.classList.remove('hidden');
    if(currentUser) {
        document.getElementById('checkout-phone').value = currentUser.phone || '';
    }
};

window.removeFromCart = function(itemId) {
    cart = cart.filter(c => c.item.id != itemId);
    updateCartCounter();
    renderCart();
};

window.handleCheckout = function(e) {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty!");
    
    if (!currentUser) {
        alert("Please login to place an order.");
        showAuthOverlay();
        return;
    }
    
    const address = document.getElementById('checkout-address').value;
    const phone = document.getElementById('checkout-phone').value;
    
    const orderItems = cart.map(c => ({
        id: c.item.id,
        name: c.item.name,
        qty: c.qty,
        price: c.item.price
    }));
    
    let totalValue = 0;
    cart.forEach(c => {
        let numericPrice = parseInt(c.item.price.replace(/[^0-9]/g, '')) || 0;
        totalValue += numericPrice * c.qty;
    });

    const orderObj = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        address: address,
        phone: phone,
        items: orderItems,
        total: totalValue,
        status: 'pending'
    };
    
    db.ref('orders/' + orderObj.id).set(orderObj).then(() => {
        alert('Order Placed Successfully! We will contact you shortly.');
        cart = [];
        updateCartCounter();
        document.getElementById('checkout-form').reset();
        navigate('store');
    });
};

// Gallery Logic
window.handleGalleryUpload = async function (e) {
    e.preventDefault();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'developer')) return;

    const title = document.getElementById('gallery-title').value;
    const fileInput = document.getElementById('gallery-file');
    const type = document.getElementById('gallery-type').value;

    if (!fileInput.files[0]) return alert('Please choose a file to upload');

    const base64 = await fileToBase64(fileInput.files[0]);
    const id = Date.now();

    db.ref('gallery/' + id).set({ id, title, url: base64, type }).then(() => {
        document.getElementById('gallery-upload-form').reset();
        document.getElementById('gallery-file-name').innerText = 'No file chosen';
        alert('Media uploaded successfully!');
    });
};

window.renderGallery = function () {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';

    galleryItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.style.position = 'relative';

        let mediaHtml = '';
        if (item.type === 'video') {
            mediaHtml = `<video src="${item.url}" controls style="width:100%; border-radius:8px;"></video>`;
        } else {
            mediaHtml = `<img src="${item.url}" alt="${item.title}" style="width:100%; border-radius:8px; display:block;">`;
        }

        div.innerHTML = `
            ${mediaHtml}
            <div class="gallery-info" style="padding:10px 0;">
                <h4 style="margin:5px 0; color:var(--text);">${item.title || 'Project Image'}</h4>
            </div>
        `;

        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer')) {
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'Delete';
            delBtn.style.position = 'absolute';
            delBtn.style.top = '10px';
            delBtn.style.right = '10px';
            delBtn.onclick = () => deleteGalleryItem(item.id);
            div.appendChild(delBtn);
        }
        grid.appendChild(div);
    });
};

window.deleteGalleryItem = function (id) {
    if (confirm('Delete this item from gallery?')) {
        db.ref('gallery/' + id).remove();
    }
};

// AI Bot Logic
window.toggleChat = function () {
    const win = document.getElementById('ai-chat-window');
    win.classList.toggle('hidden');
};

window.sendMessage = function () {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user-msg');
    input.value = '';

    const lowerMsg = msg.toLowerCase();
    let reply = "I'm Navithya AI, powered by advanced logic. I'm currently learning more about your specific needs. Try asking about 'services', 'pricing', 'job status', or type 'human' to chat with our team.";

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        reply = "Hello! 👋 I am your Navithya AI Assistant. I can help you book services, check status, or explore our store. What's on your mind?";
    } else if (lowerMsg.includes('service') || lowerMsg.includes('offer') || lowerMsg.includes('help')) {
        reply = "Navithya provides expert solutions in: \n\n• **CCTV**: HD/4K Installation & Remote Mobile Viewing \n• **Solar**: High-efficiency Panel Setup & Savings \n• **Electrical**: House Wiring & Industrial Systems \n• **Networking**: Home/Office WiFi & LAN Setup \n• **PC/Laptop**: Repair, OS Installation & Upgrades \n• **Plumbing**: Leak Repairs & Full Installations. \n\nWhich one would you like to know more about?";
    } else if (lowerMsg.includes('cctv')) {
        reply = "Our CCTV packages include top-tier brands (Hikvision/Dahua), mobile app setup for 24/7 remote viewing, and 1-year warranty. Would you like to see a quote?";
    } else if (lowerMsg.includes('solar')) {
        reply = "Harness the sun with Navithya! We offer On-Grid and Off-Grid solar solutions tailored to your energy consumption. You can save up to 90% on electricity!";
    } else if (lowerMsg.includes('pc') || lowerMsg.includes('computer') || lowerMsg.includes('laptop')) {
        reply = "From slow performance to broken screens, we fix it all. We also specialize in software installations and custom PC builds.";
    } else if (lowerMsg.includes('status') || lowerMsg.includes('my job') || lowerMsg.includes('check')) {
        if (!currentUser) {
            reply = "Please **Log In** first to check your specific job status. Once you're in, I can pull up your latest updates instantly.";
        } else {
            const userReqs = requests.filter(r => r.userId === currentUser.id);
            if (userReqs.length > 0) {
                const latest = userReqs[userReqs.length - 1];
                let statusMsg = latest.status.toUpperCase().replace('_', ' ');
                reply = `Checking our database... 🔍 \n\nYour latest request for **${latest.service}** is currently: **${statusMsg}**. \nIs there anything else I can assist with?`;
            } else {
                reply = "I couldn't find any active service requests for your account. Head over to the 'Request Service' page to get started!";
            }
        }
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
        reply = "We offer competitive pricing! \n\n• Browse our **Store** for product prices. \n• For services, prices depend on your specific needs. Submit a request and we'll provide a free estimate!";
    } else if (lowerMsg.includes('human') || lowerMsg.includes('agent') || lowerMsg.includes('contact') || lowerMsg.includes('call')) {
        reply = `Need the human touch? You can chat directly with our Admin on WhatsApp: [Direct WhatsApp Link](https://wa.me/${WHATSAPP_NUM}?text=Hello%20Navithya%20Team,%20I%20am%20chatting%20with%20your%20AI%20and%20need%20further%20help.) \n\nOr call us: 0729929453.`;
    } else if (lowerMsg.includes('gemini') || lowerMsg.includes('who are you')) {
        reply = "I'm Navithya AI, a smart assistant designed to make your experience seamless. I'm built with Gemini-inspired logic to understand and help you better!";
    }

    // Typing Simulation
    const botMsgDiv = appendMessage("Thinking...", 'bot-msg');
    let i = 0;
    botMsgDiv.innerText = "";

    // Simple typing effect
    const typing = setInterval(() => {
        botMsgDiv.innerText = reply.substring(0, i);
        i++;
        if (i > reply.length) {
            clearInterval(typing);
            // Handle markdown-ish formatting for newlines
            botMsgDiv.innerHTML = botMsgDiv.innerText.replace(/\n/g, '<br>');
            const body = document.getElementById('chat-body');
            body.scrollTop = body.scrollHeight;
        }
    }, 15);
};

// --- NEW FEATURES ---

// Gemini AI Bot Logic
window.toggleGeminiBot = function() {
    const chat = document.getElementById('gemini-bot-chat');
    const container = document.getElementById('gemini-bot-container');
    chat.classList.toggle('hidden');
    container.classList.toggle('gemini-bot-closed');
    container.classList.toggle('gemini-bot-open');
};

window.handleGeminiKeyPress = function(e) {
    if (e.key === 'Enter') sendGeminiMessage();
};

window.sendGeminiMessage = function() {
    const input = document.getElementById('gemini-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendGeminiMessage(msg, 'user');
    input.value = '';

    // Simulate Gemini AI Response
    setTimeout(() => {
        let response = "I'm Navithya AI, your assistant. I can help you with services, tracking, or platform features. How can I help?";
        const lower = msg.toLowerCase();
        
        if (lower.includes('service')) {
            response = "We offer CCTV, Solar, Electrical, Networking, and more. Check the 'Request Service' page for the full list!";
        } else if (lower.includes('hosting')) {
            response = "For hosting your Navithya-based portal, we recommend Firebase Hosting for its speed and security.";
        } else if (lower.includes('cctv')) {
            response = "CCTV installations are our premium service. Verified CCTV providers can access live demos here.";
        } else if (lower.includes('contact')) {
            response = `You can call us at 0729929453 or WhatsApp at ${WHATSAPP_NUM}.`;
        }
        
        appendGeminiMessage(response, 'bot');
    }, 1000);
};

function appendGeminiMessage(text, sender) {
    const history = document.getElementById('gemini-chat-history');
    const div = document.createElement('div');
    div.className = `msg ${sender}-msg`;
    div.innerText = text;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

// Dynamic Home Page Provider Services
function updateHomePageServices() {
    const approvedProviders = users.filter(u => u.role === 'provider' && u.status === 'approved' && u.plan !== 'free');
    const container = document.getElementById('featured-services-container');
    if (!container) return;

    container.innerHTML = '';
    
    if (approvedProviders.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:2rem;">Looking for verified experts? Our partners are coming soon!</p>';
        return;
    }

    approvedProviders.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card service-card';
        card.style.textAlign = 'center';
        card.style.transition = 'transform 0.3s';
        card.innerHTML = `
            <img src="${p.avatar || 'https://via.placeholder.com/80'}" style="width:80px; height:80px; border-radius:50%; margin-bottom:1rem; object-fit:cover;">
            <h3>${p.companyName || p.name}</h3>
            <p style="color:var(--primary); font-weight:600; margin-bottom:0.5rem;">${p.providerService}</p>
            <p style="font-size:0.85rem; color:var(--text-muted);">${p.district}</p>
            <button onclick="selectProvider('${p.id}', '${p.providerService}')" class="btn-outline" style="margin-top:1rem; width:100%;">Book Service</button>
        `;
        container.appendChild(card);
    });
}

window.selectProvider = function(pid, service) {
    document.getElementById('req-service').value = service;
    onServiceChange(service);
    navigate('services');
    setTimeout(() => {
        const select = document.getElementById('req-provider');
        if (select) select.value = pid;
    }, 500);
};
// Call this after users data is loaded
db.ref('users').on('value', (snapshot) => {
    const data = snapshot.val();
    users = data ? Object.values(data) : [];
    updateHomePageServices();
    
    const now = Date.now();
    users.forEach(u => {
        if (u.role === 'provider' && u.plan && u.plan !== 'free' && u.subscriptionExpiry && now > u.subscriptionExpiry) {
            db.ref('users/' + u.id).update({ plan: 'free', subscription: 'disconnected', subscriptionExpiry: null });
        }
    });

    if (currentUser && currentUser.role === 'admin') updateAdminPanel();
    if (currentUser && (currentUser.role === 'provider' || currentUser.role === 'employee')) updateProviderPanel();
});

function appendMessage(text, className) {
    const body = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = className;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
}

window.renderTrackingDashboard = function() {
    const container = document.getElementById('customer-tracking-section');
    const list = document.getElementById('tracking-container');
    if (!container || !list) return;

    if (!currentUser || currentUser.role === 'admin' || currentUser.role === 'provider') {
        container.classList.add('hidden');
        return;
    }

    const myJobs = requests.filter(r => r.userId === currentUser.id && r.status !== 'completed' && r.status !== 'rejected');

    if (myJobs.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    
    // Instead of innerHTML = '', we update existing or add new to prevent map flickering
    const existingIds = Array.from(list.querySelectorAll('.tracking-job-card')).map(el => el.dataset.id);
    const currentJobIds = myJobs.map(j => j.id.toString());

    // Remove cards no longer active
    existingIds.forEach(id => {
        if (!currentJobIds.includes(id)) {
            const el = list.querySelector(`.tracking-job-card[data-id="${id}"]`);
            if (el) el.remove();
            if (trackingMaps[id]) {
                trackingMaps[id].remove();
                delete trackingMaps[id];
            }
        }
    });

    myJobs.forEach(job => {
        let jobCard = list.querySelector(`.tracking-job-card[data-id="${job.id}"]`);
        if (!jobCard) {
            jobCard = document.createElement('div');
            jobCard.className = 'card tracking-job-card';
            jobCard.dataset.id = job.id;
            jobCard.style.background = 'rgba(255,255,255,0.05)';
            jobCard.style.marginBottom = '1.5rem';
            jobCard.style.padding = '1.5rem';
            list.appendChild(jobCard);
        }

        const statusMap = {
            'pending_admin': 1,
            'assigned': 2,
            'accepted': 3,
            'on_my_way': 4,
            'at_location': 5,
            'checking_issue': 6,
            'completed': 7
        };
        const currentStep = statusMap[job.status] || 1;

        let stepperHtml = `
            <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem; position:relative;">
                <div style="position:absolute; top:12px; left:0; right:0; height:2px; background:#444; z-index:0;"></div>
                <div style="position:absolute; top:12px; left:0; width:${((currentStep-1)/6)*100}%; height:2px; background:var(--primary); z-index:0; transition: width 0.5s;"></div>
                ${['Approved', 'Assigned', 'Accepted', 'Coming', 'Arrived', 'Checking'].map((label, i) => `
                    <div style="z-index:1; text-align:center; flex:1;">
                        <div style="width:25px; height:25px; border-radius:50%; background:${currentStep > i ? 'var(--primary)' : '#444'}; margin:0 auto; border:2px solid #222; display:flex; align-items:center; justify-content:center; font-size:10px; color:white;">
                            ${currentStep > i ? '✓' : i + 1}
                        </div>
                        <div style="font-size:0.7rem; margin-top:5px; color:${currentStep > i ? 'white' : '#888'};">${label}</div>
                    </div>
                `).join('')}
            </div>
        `;

        let providerInfo = job.providerName ? `<p style="margin-top:1rem; font-size:0.9rem;"><strong>Provider:</strong> ${job.providerName} (${job.providerPhone})</p>` : '';
        
        let mapHtml = job.liveLocation ? `
            <div style="margin-top:1rem;">
                <div style="font-weight:bold; font-size:0.8rem; color:var(--primary); margin-bottom:5px;">📍 Live Provider Location</div>
                <div id="map-${job.id}" style="height:250px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);"></div>
                <div style="font-size:0.7rem; color:#aaa; margin-top:5px;">Last updated: ${new Date(job.liveLocation.lastUpdate).toLocaleTimeString()}</div>
            </div>
        ` : '<p style="color:#888; font-size:0.8rem; margin-top:1rem;">Provider location not yet shared.</p>';

        jobCard.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h3 style="color:white; font-size:1.1rem;">${job.service}</h3>
                <span style="background:var(--primary); color:white; padding:4px 10px; border-radius:20px; font-size:0.7rem;">${job.status.toUpperCase().replace('_', ' ')}</span>
            </div>
            ${stepperHtml}
            ${providerInfo}
            ${mapHtml}
        `;

        // Initialize or update map AFTER innerHTML is set
        if (job.liveLocation) {
            setTimeout(() => {
                const mapId = `map-${job.id}`;
                const lat = job.liveLocation.lat;
                const lng = job.liveLocation.lng;

                if (!trackingMaps[job.id]) {
                    const map = L.map(mapId).setView([lat, lng], 15);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap'
                    }).addTo(map);

                    const providerIcon = L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3004/3004613.png',
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    });

                    trackingMaps[job.id] = {
                        map: map,
                        marker: L.marker([lat, lng], { icon: providerIcon }).addTo(map)
                    };
                } else {
                    const mInfo = trackingMaps[job.id];
                    mInfo.map.setView([lat, lng]);
                    mInfo.marker.setLatLng([lat, lng]);
                }
            }, 100);
        }
    });
};

// Periodic update for tracking
setInterval(() => {
    if (currentUser && currentUser.role === 'customer') {
        renderTrackingDashboard();
    }
}, 10000);

// Provider Panel
window.updateProviderPanel = function () {
    const list = document.getElementById('provider-jobs-list');
    if (!list) return;
    list.innerHTML = '';

    const myJobs = requests.filter(r => {
        if (currentUser.role === 'provider') return r.providerId == currentUser.id;
        if (currentUser.role === 'employee') {
            // Show jobs only until they are completed or rejected
            return r.employeeId == currentUser.id && r.status !== 'completed' && r.status !== 'rejected';
        }
        return false;
    });

    if (myJobs.length === 0) {
        list.innerHTML = '<li>No jobs found.</li>';
    }

    myJobs.forEach(job => {
        const li = document.createElement('li');
        li.className = 'card';
        li.style.marginBottom = '15px';

        let employeeInfo = job.employeeName ? `<p style="color:var(--primary); font-size:0.85rem; margin-top:5px;"><strong>Staff assigned:</strong> ${job.employeeName}</p>` : '';
        
        let allocationHtml = '';
        if (currentUser.role === 'provider' && currentUser.employees) {
            const emps = Object.values(currentUser.employees);
            allocationHtml = `
                <div style="margin-top:10px; border-top:1px solid #eee; pt:10px;">
                    <label style="font-size:0.8rem; color:#888;">Assign to Employee:</label>
                    <select onchange="allocateJobToEmployee(${job.id}, this.value)" style="width:100%; padding:8px; margin-top:5px; border-radius:4px; border:1px solid #ddd;">
                        <option value="">Choose Staff...</option>
                        ${emps.map(e => `<option value="${e.id}" ${job.employeeId == e.id ? 'selected' : ''}>${e.name}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        li.innerHTML = `
            <h3>Job: ${job.service} (${job.id})</h3>
            <p><strong>Customer:</strong> ${job.userName} (${job.userPhone})</p>
            <p><strong>District:</strong> ${job.district}, ${job.village}</p>
            <p><strong>Status:</strong> ${job.status.toUpperCase().replace('_', ' ')}</p>
            ${employeeInfo}
            ${allocationHtml}
            <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                ${job.status === 'assigned' || job.status === 'assigned_to_employee' ? `<button onclick="updateJobStatus('${job.id}', 'accepted')" class="btn-primary">Accept Job</button>` : ''}
                ${job.status === 'accepted' ? `<button onclick="updateJobStatus('${job.id}', 'on_my_way')" style="background:orange; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer;">I am Coming</button>` : ''}
                ${job.status === 'on_my_way' ? `<button onclick="updateJobStatus('${job.id}', 'at_location')" style="background:green; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer;">I am at Location</button>` : ''}
                ${job.status === 'at_location' ? `<button onclick="updateJobStatus('${job.id}', 'checking_issue')" style="background:blue; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer;">Starting to Check Issue</button>` : ''}
                ${(job.status === 'checking_issue' || job.status === 'at_location') ? `<button onclick="completeJob('${job.id}')" class="btn-primary">Mark as Completed</button>` : ''}
                
                ${currentUser.role === 'provider' && job.status !== 'completed' ? `
                    <button onclick="shareProviderLocation('${job.id}')" style="background:purple; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer;">
                        ${job.liveLocation ? '🔴 Updating Live Location...' : '📍 Share Live Location'}
                    </button>
                ` : ''}
            </div>
        `;
        list.appendChild(li);
    });

    if (currentUser.role === 'provider') {
        const empList = document.getElementById('provider-employees-list');
        if (empList) {
            empList.innerHTML = '';
            const employees = currentUser.employees ? Object.values(currentUser.employees) : [];
            employees.forEach(e => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding:10px;">${e.name}</td>
                    <td style="padding:10px;">${e.phone}</td>
                    <td style="padding:10px;"><button onclick="providerDeleteEmployee('${e.id}')" style="background:red; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">Delete</button></td>
                `;
                empList.appendChild(tr);
            });
        }
    }
};

window.updateJobStatus = function(rid, status) {
    db.ref('requests/' + rid).update({ status: status }).then(() => {
        alert('Job status updated to: ' + status.replace('_', ' '));
        updateProviderPanel();
        updateAdminPanel();
    });
};

window.switchProviderTab = function(tab) {
    const jobsView = document.getElementById('provider-jobs-view');
    const empsView = document.getElementById('provider-employees-view');
    const btns = document.querySelectorAll('#provider-tabs .tab-btn');

    if (tab === 'jobs') {
        jobsView.classList.remove('hidden');
        empsView.classList.add('hidden');
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        jobsView.classList.add('hidden');
        empsView.classList.remove('hidden');
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
};

window.providerAddEmployee = function(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'provider') return;
    
    const name = document.getElementById('emp-name').value;
    const phone = document.getElementById('emp-phone').value;
    const pass = document.getElementById('emp-pass').value;
    const id = Date.now();
    
    db.ref(`users/${currentUser.id}/employees/${id}`).set({ id, name, phone, pass }).then(() => {
        alert('Employee added successfully!');
        e.target.reset();
        if (!currentUser.employees) currentUser.employees = {};
        currentUser.employees[id] = { id, name, phone, pass };
        updateProviderPanel();
    });
};

window.providerDeleteEmployee = function(empId) {
    if (confirm('Delete this employee?')) {
        db.ref(`users/${currentUser.id}/employees/${empId}`).remove().then(() => {
            alert('Employee deleted.');
            if (currentUser.employees) delete currentUser.employees[empId];
            updateProviderPanel();
        });
    }
};

window.allocateJobToEmployee = function(jobId, empId) {
    if (!empId) {
        db.ref(`requests/${jobId}`).update({
            employeeId: null,
            employeeName: null,
            employeePhone: null,
            status: 'assigned'
        });
        return;
    }
    const emp = Object.values(currentUser.employees || {}).find(e => e.id == empId);
    if (!emp) return;
    
    db.ref(`requests/${jobId}`).update({
        employeeId: empId,
        employeeName: emp.name,
        employeePhone: emp.phone,
        status: 'assigned_to_employee'
    }).then(() => {
        alert(`Job allocated to ${emp.name}`);
        updateProviderPanel();
    });
};

window.shareProviderLocation = function(rid) {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        db.ref('requests/' + rid).update({
            liveLocation: { lat: latitude, lng: longitude, lastUpdate: Date.now() }
        }).then(() => {
            alert("Location shared successfully! It will be visible to the customer.");
            updateProviderPanel();
        });
    }, (err) => {
        alert("Unable to retrieve location: " + err.message);
    }, { enableHighAccuracy: true });
};

window.completeJob = function (rid) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async () => {
        if (fileInput.files[0]) {
            const base64 = await fileToBase64(fileInput.files[0]);
            db.ref('requests/' + rid).update({
                status: 'completed',
                completionImage: base64
            }).then(() => {
                alert('Job completed with proof image!');
                updateProviderPanel();
                updateAdminPanel();
            });
        } else {
            alert("No image selected. Image proof is required to complete the job.");
        }
    };
    fileInput.click();
};

// Sponsor Panel Logic
window.updateSponsorPanel = function () {
    if (!currentUser || currentUser.role !== 'sponsor') return;

    document.getElementById('sponsor-welcome-msg').innerText = `Welcome, ${currentUser.name}! You can manage your sponsored team members here.`;

    const list = document.getElementById('sponsor-users-list');
    list.innerHTML = '';

    const mySponsored = users.filter(u => u.sponsor === currentUser.name || u.sponsor === currentUser.phone);

    if (mySponsored.length === 0) {
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1rem;">No users sponsored by you yet.</td></tr>';
        return;
    }

    mySponsored.forEach(u => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        tr.innerHTML = `
            <td style="padding:10px;">${u.name}</td>
            <td style="padding:10px;">${u.phone}</td>
            <td style="padding:10px;">${u.nic || 'N/A'}</td>
            <td style="padding:10px;">${u.status}</td>
            <td style="padding:10px;">
                <button onclick="editSponsoredUser(${u.id})" style="background:var(--primary); color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">Edit</button>
            </td>
        `;
        list.appendChild(tr);
    });
};

window.showSponsorAddUser = function () {
    alert("New users can sign up using the regular Sign Up form and entering your name/phone in the 'Sponsored By' field. Once they sign up, they will appear here.");
};

window.editSponsoredUser = function (uid) {
    const user = users.find(u => u.id == uid);
    if (!user) return;

    const newName = prompt("Edit Name:", user.name);
    if (newName) {
        db.ref('users/' + uid).update({ name: newName });
        alert("User name updated!");
    }
};

window.loadEzvizDemo = function(containerId) {
    const cid = containerId || 'ezviz-container';
    const container = document.getElementById(cid);
    if (!container) return;
    
    // Updated to the official open-demo URL which is more likely to be iframe-compatible
    container.innerHTML = `<iframe src="https://open.ezvizlife.com/open-demo/v3/video/live.html" style="width:100%; height:100%; border:none;" allowfullscreen></iframe>`;
    alert("Refreshing EZVIZ live feed...");
};

window.adminDeleteReview = function(rid) {
    if (confirm("Delete this review?")) {
        db.ref('reviews/' + rid).remove();
    }
};

window.onDistrictChange = function(district, villageSelectId) {
    const villageSelect = document.getElementById(villageSelectId);
    if (!villageSelect) return;

    villageSelect.innerHTML = '<option value="" disabled selected>Select Village/Area</option>';
    
    if (SRI_LANKA_AREAS[district]) {
        SRI_LANKA_AREAS[district].forEach(v => {
            const opt = document.createElement('option');
            opt.value = v;
            opt.textContent = v;
            villageSelect.appendChild(opt);
        });
        const otherOpt = document.createElement('option');
        otherOpt.value = "Other";
        otherOpt.textContent = "Other/Village (Manual entry)";
        villageSelect.appendChild(otherOpt);
    }
};

window.handleOtherVillage = function(select, inputId) {
    const input = document.getElementById(inputId);
    if (select.value === 'Other') {
        input.classList.remove('hidden');
        input.required = true;
    } else {
        input.classList.add('hidden');
        input.required = false;
    }
};

// Initial Nav call to set defaults
navigate('home');

// Check for persistent session
const savedUser = localStorage.getItem('navithyaUser');
if (savedUser) {
    loginSuccess(JSON.parse(savedUser));
}

// Profile Management
async function renderProfilePage() {
    if (!currentUser) return;

    const myCompletedJobs = requests.filter(r => r.providerId == currentUser.id && r.status === 'completed').length;
    let providerExtras = '';
    if (currentUser.role === 'provider') {
        let expiryDate = currentUser.subscriptionExpiry ? new Date(currentUser.subscriptionExpiry).toLocaleDateString() : 'N/A';
        providerExtras = `
            <div style="margin-top:20px; border-top:1px solid #eee; padding-top:20px;">
                <p><strong>Completed Jobs:</strong> ${myCompletedJobs}</p>
                <p><strong>Plan Expiry:</strong> <span style="color:var(--primary); font-weight:bold;">${expiryDate}</span></p>
                <button onclick="requestProviderMiniSite()" class="btn-primary" style="margin-top:10px; width:100%;">Request My Mini-Site</button>
            </div>
        `;
    }

    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-phone').value = currentUser.phone || '';
    document.getElementById('profile-nic').value = currentUser.nic || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    
    // Additional fields
    const nationality = document.getElementById('profile-nationality');
    if (nationality) nationality.value = currentUser.nationality || '';
    const birthday = document.getElementById('profile-birthday');
    if (birthday) birthday.value = currentUser.birthday || '';
    const gender = document.getElementById('profile-gender');
    if (gender) gender.value = currentUser.gender || '';
    const sponsor = document.getElementById('profile-sponsor');
    if (sponsor) sponsor.value = currentUser.sponsor || '';

    document.getElementById('profile-branch').value = currentUser.preferredBranch || 'Fort Branch';
    
    const salutationRadios = document.getElementsByName('profile-salutation');
    for (const radio of salutationRadios) {
        if (radio.value === (currentUser.salutation || 'Mr')) {
            radio.checked = true;
        }
    }

    const distSelect = document.getElementById('profile-district');
    distSelect.innerHTML = document.getElementById('signup-district').innerHTML;
    distSelect.value = currentUser.district || '';

    // Village in profile
    const villageContainer = document.getElementById('profile-village-container') || createProfileVillageField();
    const villageSelect = document.getElementById('profile-village');
    onDistrictChange(currentUser.district, 'profile-village');
    villageSelect.value = currentUser.village || '';

    const img = document.getElementById('profile-display-img');
    if (img) img.src = currentUser.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    const brandSection = document.getElementById('company-name-section');
    const bankSection = document.getElementById('provider-bank-details');
    if ((currentUser.role === 'provider' && currentUser.plan && currentUser.plan !== 'free') || currentUser.role === 'admin') {
        if (brandSection) brandSection.classList.remove('hidden');
        const companyDisplay = document.getElementById('current-company-name');
        if (companyDisplay) companyDisplay.innerText = currentUser.companyName || 'No Company Name Set';
        
        if (currentUser.role === 'provider' && bankSection) {
            bankSection.classList.remove('hidden');
            document.getElementById('profile-bank-name').value = currentUser.bankName || '';
            document.getElementById('profile-bank-branch').value = currentUser.bankBranch || '';
            document.getElementById('profile-bank-account').value = currentUser.bankAccount || '';
            document.getElementById('profile-bank-holder').value = currentUser.bankHolder || '';
        }
    } else {
        if (brandSection) brandSection.classList.add('hidden');
        if (bankSection) bankSection.classList.add('hidden');
    }

    // Injecting the job count and expiry into a placeholder
    let extrasContainer = document.getElementById('profile-provider-extras');
    if (!extrasContainer) {
        extrasContainer = document.createElement('div');
        extrasContainer.id = 'profile-provider-extras';
        const profileCard = document.querySelector('#page-profile .card');
        if (profileCard) profileCard.appendChild(extrasContainer);
    }
    if (extrasContainer) extrasContainer.innerHTML = providerExtras;
}

window.requestProviderMiniSite = function() {
    const siteUrl = `${window.location.origin}/provider-site.html?id=${currentUser.id}`;
    alert(`Your personalized site link: ${siteUrl}`);
    db.ref(`users/${currentUser.id}`).update({ miniSiteUrl: siteUrl });
};

async function handleProfilePhotoChange(input) {
    const file = input.files[0];
    if (file) {
        const base64 = await fileToBase64(file);
        document.getElementById('profile-display-img').src = base64;
        db.ref('users/' + currentUser.id).update({ avatar: base64 });
        currentUser.avatar = base64;
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const district = document.getElementById('profile-district').value;
    const nic = document.getElementById('profile-nic').value;
    const email = document.getElementById('profile-email').value;
    
    const nationality = document.getElementById('profile-nationality')?.value || currentUser.nationality || '';
    const birthday = document.getElementById('profile-birthday')?.value || currentUser.birthday || '';
    const gender = document.getElementById('profile-gender')?.value || currentUser.gender || '';
    const sponsor = document.getElementById('profile-sponsor')?.value || currentUser.sponsor || '';
    const preferredBranch = document.getElementById('profile-branch').value;
    
    const villageRaw = document.getElementById('profile-village').value;
    const villageOther = document.getElementById('profile-village-other').value;
    const village = villageRaw === 'Other' ? villageOther : villageRaw;

    let salutation = 'Mr';
    const salutationRadios = document.getElementsByName('profile-salutation');
    for (const radio of salutationRadios) {
        if (radio.checked) salutation = radio.value;
    }
    
    let updateData = { name, district, village, nic, email, preferredBranch, salutation, nationality, birthday, gender, sponsor };
    
    if (currentUser.role === 'provider') {
        const bankName = document.getElementById('profile-bank-name').value;
        const bankBranch = document.getElementById('profile-bank-branch').value;
        const bankAccount = document.getElementById('profile-bank-account').value;
        const bankHolder = document.getElementById('profile-bank-holder').value;
        
        updateData.bankName = bankName;
        updateData.bankBranch = bankBranch;
        updateData.bankAccount = bankAccount;
        updateData.bankHolder = bankHolder;
    }

    db.ref('users/' + currentUser.id).update(updateData).then(() => {
        alert('Profile Updated Successfully!');
        currentUser = { ...currentUser, ...updateData };
        localStorage.setItem('navithyaUser', JSON.stringify(currentUser));
        renderProfilePage();
    });
}

function createProfileVillageField() {
    const distSelect = document.getElementById('profile-district');
    if (!distSelect) return null;
    
    const container = document.createElement('div');
    container.id = 'profile-village-container';
    container.className = 'form-group';
    container.innerHTML = `
        <label>Village/Area</label>
        <select id="profile-village" onchange="handleOtherVillage(this, 'profile-village-other')"></select>
        <input type="text" id="profile-village-other" class="hidden" placeholder="Enter Village Name" style="margin-top:5px;">
    `;
    distSelect.parentElement.insertAdjacentElement('afterend', container);
    return container;
}

function submitInitialCompanyName() {
    const name = document.getElementById('new-company-name').value;
    if (!name) return alert('Please enter a name');
    
    db.ref('users/' + currentUser.id).update({ companyName: name }).then(() => {
        alert('Company Name Set!');
        currentUser.companyName = name;
        localStorage.setItem('navithyaUser', JSON.stringify(currentUser));
        document.getElementById('company-setup-overlay').classList.add('hidden');
        document.getElementById('home-title-display').innerHTML = `Welcome to <span class="accent">${name}</span>`;
    });
}

function requestCompanyNameChange() {
    const newName = prompt("Enter new company name for approval:");
    if (newName) {
        const id = Date.now();
        db.ref('systemRequests/' + id).set({ 
            id, type: 'name_change', phone: currentUser.phone, newName, status: 'pending', date: new Date().toISOString(), userId: currentUser.id 
        });
        alert('Name change request sent to Admin!');
    }
}
window.requestPlanUpgrade = function(plan) {
    if (!currentUser) {
        alert("Please login first to choose a plan.");
        showAuthOverlay();
        return;
    }
    if (currentUser.role !== 'provider') {
        alert("Only service providers can subscribe to these plans.");
        return;
    }
    const id = Date.now();
    db.ref('systemRequests/' + id).set({
        id, type: 'plan_upgrade', phone: currentUser.phone, reqPlan: plan, status: 'pending', date: new Date().toISOString(), userId: currentUser.id
    });
    alert('Upgrade to ' + plan + ' plan requested! Admin will review shortly with payment instructions.');
};

window.requestCompanyNameChange = requestCompanyNameChange;
window.adminChangePlan = adminChangePlan;

// Reviews & Ratings
let reviews = [];
db.ref('reviews').on('value', snap => {
    reviews = snap.val() ? Object.values(snap.val()) : [];
    if (!document.getElementById('page-rate').classList.contains('hidden')) {
        renderReviews();
    }
});

let ratingImages = [];
window.handleReviewImagePreview = async function(input) {
    const preview = document.getElementById('rate-image-preview');
    preview.innerHTML = '';
    ratingImages = [];
    
    if (input.files.length > 3) {
        alert("You can only select up to 3 images. Using first 3.");
    }
    
    const files = Array.from(input.files).slice(0, 3);
    for (const f of files) {
        const b64 = await fileToBase64(f);
        ratingImages.push(b64);
        const img = document.createElement('img');
        img.src = b64;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        preview.appendChild(img);
    }
};

window.submitReview = function(e) {
    e.preventDefault();
    if (!currentUser) {
        alert('Please login to submit a review.');
        return showAuthOverlay();
    }
    
    const pSelect = document.getElementById('rate-provider');
    if (pSelect.value === "") return alert("Please select a provider.");
    
    const pName = pSelect.options[pSelect.selectedIndex].text;
    const serv = document.getElementById('rate-service').value;
    const comment = document.getElementById('rate-comment').value;
    
    const reviewData = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        providerId: pSelect.value,
        providerName: pName,
        rating: serv,
        comment: comment,
        images: ratingImages,
        date: new Date().toISOString()
    };
    
    db.ref('reviews/' + reviewData.id).set(reviewData).then(() => {
        alert('Thank you! Your review has been published.');
        document.getElementById('rating-form').reset();
        document.getElementById('rate-image-preview').innerHTML = '';
        ratingImages = [];
    });
};

function renderProvidersForRating() {
    const select = document.getElementById('rate-provider');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Choose a Provider</option>';
    
    users.filter(u => u.role === 'provider' && u.status === 'approved').forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
    });
}

function renderReviews() {
    const container = document.getElementById('reviews-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (reviews.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); padding: 10px;">No reviews yet. Be the first!</p>';
        return;
    }
    
    reviews.slice().reverse().forEach(r => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.padding = '15px';
        
        let emoji = r.rating === 'good' ? '⭐⭐⭐⭐⭐ 😊' : '⭐ 😞';
        let imgsHtml = '';
        if (r.images && r.images.length > 0) {
            imgsHtml = '<div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">';
            r.images.forEach(i => {
                imgsHtml += `<a href="${i}" target="_blank"><img src="${i}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;"></a>`;
            });
        }
        
        // Hide provider phone in review display to match constraints
        let pNameText = r.providerName.split(' | ')[0];
        
        let deleteBtn = '';
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'developer')) {
            deleteBtn = `<button onclick="adminDeleteReview(${r.id})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem; margin-top:10px;">Delete Review</button>`;
        }
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div style="display:flex; align-items:center; gap: 10px; margin-bottom:10px;">
                    <div style="background:var(--primary); color:#fff; width:30px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:50%; font-weight:bold;">${r.userName.charAt(0).toUpperCase()}</div>
                    <div>
                        <h4 style="margin:0;">${r.userName}</h4>
                        <span style="font-size:0.8rem; color:var(--text-muted);">${new Date(r.date).toLocaleDateString()}</span>
                    </div>
                </div>
                ${deleteBtn}
            </div>
            <p style="font-size:0.9rem; margin-bottom:5px;"><strong>Provider:</strong> ${pNameText}</p>
            <p style="margin-bottom:10px;"><strong>Experience:</strong> ${emoji}</p>
            <p style="font-style:italic; color:#555;">"${r.comment}"</p>
            ${imgsHtml}
        `;
        container.appendChild(div);
    });
}

// Welcome Animation Linkage
function showWelcomeAnimation(user) {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;
    
    const info = document.getElementById('welcome-expiry-info');
    let expiryDate = "14 Days from now";
    if (user.subscriptionExpiry) {
        expiryDate = new Date(user.subscriptionExpiry).toLocaleDateString();
    }
    
    info.innerHTML = `<h3 style="margin-bottom:5px; color:#ffeb3b;">Your 2-Week Free Trial is Active!</h3><p>Valid Until: <strong>${expiryDate}</strong></p>`;
    
    overlay.classList.remove('hidden');
    
    // Trigger animation
    setTimeout(() => {
        const box = overlay.querySelector('.welcome-box');
        if (box) {
            box.style.transform = 'scale(1)';
            box.style.opacity = '1';
        }
    }, 50);
}

window.adminViewBankDetails = function(name, branch, acc, holder) {
    alert(`Bank Details:\nBank: ${name}\nBranch: ${branch}\nAccount No: ${acc}\nHolder: ${holder}`);
};

window.deleteGalleryItem = deleteGalleryItem;
window.toggleChat = toggleChat;
window.sendMessage = sendMessage;
window.updateProviderPanel = updateProviderPanel;
window.completeJob = completeJob;
window.navigate = navigate;
window.filterProviders = filterProviders;
window.adminDeleteUser = adminDeleteUser;
window.adminRejectRequest = adminRejectRequest;
window.adminDeleteRequest = adminDeleteRequest;
window.adminAssignProvider = adminAssignProvider;
window.adminSetUserStatus = adminSetUserStatus;
window.adminChangeRole = adminChangeRole;
window.adminChangeService = adminChangeService;
window.adminApproveJob = adminApproveJob;
window.selectProvider = selectProvider;
window.handleForgetPassword = handleForgetPassword;
window.login = handleLogin;
window.signup = handleSignup;
window.logout = logout;
window.switchAuthTab = switchAuthTab;
window.showAuthOverlay = showAuthOverlay;
window.hideAuthOverlay = hideAuthOverlay;
window.updateAdminPanel = updateAdminPanel;
window.handleProfileUpdate = handleProfileUpdate;
window.handleProfilePhotoChange = handleProfilePhotoChange;
window.submitInitialCompanyName = submitInitialCompanyName;
window.requestCompanyNameChange = requestCompanyNameChange;

