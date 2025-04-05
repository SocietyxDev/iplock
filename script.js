// Discord OAuth Configuration
const DISCORD_CLIENT_ID = "1355364009876127863";
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

// Toggle notification popup
notificationBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    notificationPopup.classList.add('show');
    overlay.classList.add('show');
    updateNotificationDisplay();
});

// Close notification popup
notificationClose.addEventListener('click', function() {
    notificationPopup.classList.remove('show');
    overlay.classList.remove('show');
});

overlay.addEventListener('click', function() {
    notificationPopup.classList.remove('show');
    overlay.classList.remove('show');
    profileMenu.classList.remove('show');
});

// Navigation buttons
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

// Enhanced Profile Dropdown
userAvatar.addEventListener('click', function(e) {
    e.stopPropagation();
    profileMenu.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.profile-dropdown') && profileMenu.classList.contains('show')) {
        profileMenu.classList.remove('show');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    // Clear any stored user data
    localStorage.removeItem('discordUser');
    localStorage.removeItem('sidebarCollapsed');
    // Return to login page
    dashboard.style.display = 'none';
    loginPage.style.display = 'flex';
    // Reset avatar and username
    userAvatar.src = '';
    usernameSpan.textContent = 'User';
    // Close any open popups
    notificationPopup.classList.remove('show');
    overlay.classList.remove('show');
});

// Sidebar Toggle Functionality
function initSidebarToggle() {
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Store sidebar state in localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
    
    // Check for saved sidebar state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
    }
}

// Mobile Menu Toggle Functionality
function initMobileMenu() {
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            mobileMenuToggle.classList.remove('hidden');
            sidebar.classList.remove('collapsed');
        } else {
            mobileMenuToggle.classList.add('hidden');
        }
    }

    // Initial check
    checkScreenSize();

    // Check on resize
    window.addEventListener('resize', checkScreenSize);

    // Toggle sidebar
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Set active nav item
function initNavItems() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Check for Discord auth response in URL
function checkAuthResponse() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
        // Remove token from URL
        window.history.pushState({}, document.title, window.location.pathname);
        
        // Fetch user data
        fetchDiscordUserData(accessToken);
    }
}

// Fetch Discord user data
async function fetchDiscordUserData(token) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        
        // Store user data
        localStorage.setItem('discordUser', JSON.stringify(userData));
        
        // Show dashboard with user data
        showDashboard(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to login. Please try again.');
    }
}

// Show dashboard with user data
function showDashboard(userData) {
    loginPage.style.display = 'none';
    dashboard.style.display = 'block';
    
    // Set user avatar
    if (userData.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`;
        userAvatar.src = avatarUrl;
    } else {
        // Default avatar if no Discord avatar
        const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`;
        userAvatar.src = defaultAvatar;
    }
    
    // Set username
    usernameSpan.textContent = userData.username || 'User';
}

// Check for existing session on page load
function checkExistingSession() {
    const storedUser = localStorage.getItem('discordUser');
    if (storedUser) {
        showDashboard(JSON.parse(storedUser));
    }
}

// Initialize Discord login
function initDiscordLogin() {
    discordLoginBtn.addEventListener('click', () => {
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=token&scope=${DISCORD_SCOPES.join('%20')}`;
        window.location.href = authUrl;
    });
}

// Initialize the app
function init() {
    checkExistingSession();
    checkAuthResponse();
    initDiscordLogin();
    initSidebarToggle();
    initMobileMenu();
    initNavItems();
    updateNotificationDisplay();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
