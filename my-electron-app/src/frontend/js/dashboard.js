// Get DOM elements
const usernameElement = document.getElementById('username');
const emailElement = document.getElementById('email');
const joinedDateElement = document.getElementById('joined-date');
const lastLoginElement = document.getElementById('last-login');
const profilePictureElement = document.getElementById('profile-picture');
const logoutButton = document.getElementById('logout-btn');

// Function to format dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to get Gravatar URL
function getGravatarUrl(email) {
    const hash = CryptoJS.MD5(email.toLowerCase().trim());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=150`;
}

// Show error notification
function showError(message) {
    window.api.showNotification({
        title: 'Error',
        body: message,
        type: 'error'
    });
}

// Set loading state
function setLoading(isLoading) {
    const loadingElements = document.querySelectorAll('.loading-state');
    const contentElements = document.querySelectorAll('.content-state');
    
    if (isLoading) {
        loadingElements.forEach(el => el.style.display = 'block');
        contentElements.forEach(el => el.style.display = 'none');
    } else {
        loadingElements.forEach(el => el.style.display = 'none');
        contentElements.forEach(el => el.style.display = 'block');
    }
}

// Load user data
async function loadUserData() {
    try {
        setLoading(true);
        const userData = await window.api.getUserData();
        
        // Update profile information
        usernameElement.textContent = userData.username;
        emailElement.textContent = userData.email;
        joinedDateElement.textContent = formatDate(userData.createdAt);
        lastLoginElement.textContent = formatDate(userData.lastLogin);
        
        // Update profile picture with Gravatar
        profilePictureElement.src = getGravatarUrl(userData.email);
        
        // Remove loading states
        setLoading(false);
    } catch (error) {
        console.error('Failed to load user data:', error);
        showError('Failed to load user data. Please try again.');
        
        // Handle unauthorized access
        if (error.status === 401) {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }
}

// Handle logout
async function handleLogout() {
    try {
        logoutButton.disabled = true;
        logoutButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Logging out...';
        
        await window.api.logout();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        showError('Failed to logout. Please try again.');
        logoutButton.disabled = false;
        logoutButton.innerHTML = '<i class="bi bi-box-arrow-right"></i> Logout';
    }
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        await loadUserData();
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showError('Failed to initialize dashboard. Please refresh the page.');
    }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', initializeDashboard);
logoutButton.addEventListener('click', handleLogout);

// Add error handling for profile picture load
profilePictureElement.addEventListener('error', () => {
    // If Gravatar fails to load, use default avatar
    profilePictureElement.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
});
