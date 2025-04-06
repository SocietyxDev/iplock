// Discord OAuth Configuration
const DISCORD_CLIENT_ID = "1345573828956520528";
const DISCORD_REDIRECT_URI = window.location.href.includes('localhost') ? 
    "http://localhost:8000" : "https://iplock-three.vercel.app/";
const DISCORD_SCOPES = ["identify"];

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboard = document.getElementById('dashboard');
const discordLoginBtn = document.getElementById('discordLogin');
const userAvatar = document.getElementById('userAvatar');
const usernameSpan = document.getElementById('username');
const profileMenu = document.getElementById('profileMenu');
const logoutBtn = document.getElementById('logoutBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationPopup = document.getElementById('notificationPopup');
const notificationClose = document.getElementById('notificationClose');
const overlay = document.getElementById('overlay');
const prevNotification = document.getElementById('prevNotification');
const nextNotification = document.getElementById('nextNotification');
const notificationBadge = document.getElementById('notificationBadge');
const notificationContent = document.getElementById('notificationContent');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const profileLink = document.getElementById('profileLink');
const profileModal = document.getElementById('profileModal');
const profileModalClose = document.getElementById('profileModalClose');
const profileSaveBtn = document.getElementById('profileSaveBtn');
const currentAvatar = document.getElementById('currentAvatar');
const avatarUpload = document.getElementById('avatarUpload');
const nicknameInput = document.getElementById('nickname');
const discordWebhookInput = document.getElementById('discordWebhook');
const avatarPreview = document.getElementById('avatarPreview');

// Enhanced Notification System
let currentNotificationIndex = 0;
const notifications = [
    {
        title: "New Update Available",
        time: "2 hours ago",
        message: "Version 2.5.0 is now available with new features and bug fixes. Check out the changelog for details!"
    },
    {
        title: "Maintenance Scheduled",
        time: "1 day ago",
        message: "Server maintenance planned for tomorrow at 3 AM UTC. Expected downtime: 30 minutes."
    },
    {
        title: "Welcome to IMMORTAL",
        time: "3 days ago",
        message: "Thank you for joining our community! Get started by exploring the dashboard."
    },
    {
        title: "Security Alert",
        time: "Just now",
        message: "We've detected a new security patch available. Please update your client as soon as possible."
    }
];

// Initialize notification display
function updateNotificationDisplay() {
    const notification = notifications[currentNotificationIndex];
    notificationContent.innerHTML = `
        <div class="notification-item">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-time">${notification.time}</div>
            <div class="notification-message">${notification.message}</div>
        </div>
    `;
    
    // Update button states
    prevNotification.disabled = currentNotificationIndex === 0;
    nextNotification.disabled = currentNotificationIndex === notifications.length - 1;
    
    // Update badge if viewing the last notification
    if (currentNotificationIndex === notifications.length - 1) {
        notificationBadge.textContent = '0';
        notificationBadge.style.display = 'none';
    } else {
        notificationBadge.textContent = (notifications.length - currentNotificationIndex - 1).toString();
        notificationBadge.style.display = 'flex';
    }
}

// Notification event handlers
notificationBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    notificationPopup.classList.add('show');
    overlay.classList.add('show');
    updateNotificationDisplay();
});

notificationClose.addEventListener('click', function() {
    notificationPopup.classList.remove('show');
    overlay.classList.remove('show');
});

prevNotification.addEventListener('click', function() {
    if (currentNotificationIndex > 0) {
        currentNotificationIndex--;
        updateNotificationDisplay();
    }
});

nextNotification.addEventListener('click', function() {
    if (currentNotificationIndex < notifications.length - 1) {
        currentNotificationIndex++;
        updateNotificationDisplay();
    }
});

// Profile dropdown functionality
userAvatar.addEventListener('click', function(e) {
    e.stopPropagation();
    profileMenu.classList.toggle('show');
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.profile-dropdown') && profileMenu.classList.contains('show')) {
        profileMenu.classList.remove('show');
    }
});

// Profile modal functionality
profileLink.addEventListener('click', function(e) {
    e.preventDefault();
    profileMenu.classList.remove('show');
    showProfileModal();
});

function showProfileModal() {
    // Load saved data
    const userData = JSON.parse(localStorage.getItem('discordUser') || '{}');
    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
    
    // Set current values
    currentAvatar.src = userAvatar.src;
    nicknameInput.value = profileData.nickname || userData.username || '';
    discordWebhookInput.value = profileData.discordWebhook || '';
    avatarPreview.classList.remove('has-new-avatar');
    
    // Show modal
    profileModal.classList.add('show');
    overlay.classList.add('show');
}

profileModalClose.addEventListener('click', function() {
    profileModal.classList.remove('show');
    overlay.classList.remove('show');
});

// Handle avatar upload
avatarUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentAvatar.src = event.target.result;
            avatarPreview.classList.add('has-new-avatar');
        };
        reader.readAsDataURL(file);
    }
});

// Save profile changes
profileSaveBtn.addEventListener('click', function() {
    const profileData = {
        nickname: nicknameInput.value.trim(),
        discordWebhook: discordWebhookInput.value.trim(),
        customAvatar: avatarPreview.classList.contains('has-new-avatar') ? currentAvatar.src : null
    };
    
    // Validate webhook URL if provided
    if (profileData.discordWebhook && !profileData.discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
        alert('Please enter a valid Discord webhook URL');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData));
    
    // Update UI
    if (profileData.nickname) {
        usernameSpan.textContent = profileData.nickname;
    }
    
    if (profileData.customAvatar) {
        userAvatar.src = profileData.customAvatar;
    }
    
    // Close modal
    profileModal.classList.remove('show');
    overlay.classList.remove('show');
    
    // Add success notification
    const successNotification = {
        title: "Profile Updated",
        time: "Just now",
        message: "Your profile changes have been saved successfully!"
    };
    notifications.unshift(successNotification);
    currentNotificationIndex = 0;
    
    // Show notification
    notificationPopup.classList.add('show');
    overlay.classList.add('show');
    updateNotificationDisplay();
});

// Logout functionality
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    // Clear authentication data but keep profile settings
    localStorage.removeItem('discordUser');
    localStorage.removeItem('sidebarCollapsed');
    
    // Return to login page
    dashboard.style.display = 'none';
    loginPage.style.display = 'flex';
    
    // Reset UI
    userAvatar.src = '';
    usernameSpan.textContent = 'User';
    
    // Close any open popups
    notificationPopup.classList.remove('show');
    profileModal.classList.remove('show');
    overlay.classList.remove('show');
});

// Sidebar functionality
function initSidebarToggle() {
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    
    // Apply saved state
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
}

// Mobile menu functionality
function initMobileMenu() {
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            mobileMenuToggle.classList.remove('hidden');
        } else {
            mobileMenuToggle.classList.add('hidden');
        }
    }

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Navigation items functionality
function initNavItems() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Authentication functions
function checkAuthResponse() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
        window.history.pushState({}, document.title, window.location.pathname);
        fetchDiscordUserData(accessToken);
    }
}

async function fetchDiscordUserData(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        localStorage.setItem('discordUser', JSON.stringify(userData));
        showDashboard(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to login. Please try again.');
    }
}

function showDashboard(userData) {
    loginPage.style.display = 'none';
    dashboard.style.display = 'block';
    
    // Load profile data
    const profileData = JSON.parse(localStorage.getItem('profileData') || {};
    
    // Set avatar (custom -> Discord -> default)
    if (profileData.customAvatar) {
        userAvatar.src = profileData.customAvatar;
    } else if (userData.avatar) {
        userAvatar.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`;
    } else {
        userAvatar.src = `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`;
    }
    
    // Set username (nickname -> Discord -> default)
    usernameSpan.textContent = profileData.nickname || userData.username || 'User';
}

function checkExistingSession() {
    const storedUser = localStorage.getItem('discordUser');
    if (storedUser) {
        showDashboard(JSON.parse(storedUser));
    }
}

function initDiscordLogin() {
    discordLoginBtn.addEventListener('click', () => {
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=token&scope=${DISCORD_SCOPES.join('%20')}`;
        window.location.href = authUrl;
    });
}

// Initialize all components
function init() {
    checkExistingSession();
    checkAuthResponse();
    initDiscordLogin();
    initSidebarToggle();
    initMobileMenu();
    initNavItems();
    updateNotificationDisplay();
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

// Overlay click handler (must be last to override others)
overlay.addEventListener('click', function() {
    notificationPopup.classList.remove('show');
    profileModal.classList.remove('show');
    profileMenu.classList.remove('show');
    overlay.classList.remove('show');
});
