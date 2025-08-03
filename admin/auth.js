// Authentication Configuration
const AUTH_CONFIG = {
    credentials: {
        username: 'admin',
        password: 'ufo2024'
    },
    sessionDuration: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    storageKey: 'ufoDropsAdminAuth'
};

// Authentication Manager
class AuthManager {
    constructor() {
        this.loginScreen = document.getElementById('login-screen');
        this.adminPanel = document.getElementById('admin-panel');
        this.loginForm = document.getElementById('login-form');
        this.loginError = document.getElementById('login-error');
        this.logoutBtn = document.getElementById('logout-btn');
        this.adminUser = document.getElementById('admin-user');
        
        this.init();
    }
    
    init() {
        // Check if user is already authenticated
        if (this.isAuthenticated()) {
            this.showAdminPanel();
        } else {
            this.showLoginScreen();
        }
        
        // Bind events
        this.bindEvents();
        
        // Auto-logout on session expiry
        this.startSessionTimer();
    }
    
    bindEvents() {
        // Login form submission
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Logout button click
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            if (!this.isAuthenticated()) {
                this.showLoginScreen();
            }
        });
        
        // Handle tab visibility change (logout on tab close)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.updateLastActivity();
            } else {
                if (!this.isAuthenticated()) {
                    this.showLoginScreen();
                }
            }
        });
        
        // Handle user activity for session management
        this.bindActivityEvents();
    }
    
    bindActivityEvents() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isAuthenticated()) {
                    this.updateLastActivity();
                }
            }, { passive: true });
        });
    }
    
    handleLogin() {
        const formData = new FormData(this.loginForm);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        
        // Clear previous errors
        this.clearError();
        
        // Validate credentials
        if (this.validateCredentials(username, password)) {
            this.createSession();
            this.showAdminPanel();
            this.showNotification('Successfully logged in!', 'success');
        } else {
            this.showError('Invalid username or password');
            this.shakeLoginForm();
        }
    }
    
    handleLogout() {
        this.clearSession();
        this.showLoginScreen();
        this.showNotification('Successfully logged out', 'info');
        
        // Clear form
        this.loginForm.reset();
    }
    
    validateCredentials(username, password) {
        return username === AUTH_CONFIG.credentials.username && 
               password === AUTH_CONFIG.credentials.password;
    }
    
    createSession() {
        const sessionData = {
            username: AUTH_CONFIG.credentials.username,
            loginTime: Date.now(),
            lastActivity: Date.now(),
            expiresAt: Date.now() + AUTH_CONFIG.sessionDuration
        };
        
        // Store session data
        sessionStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(sessionData));
        
        // Also store in localStorage for persistence across tabs
        localStorage.setItem(AUTH_CONFIG.storageKey + '_backup', JSON.stringify(sessionData));
        
        // Update UI
        this.adminUser.textContent = sessionData.username;
    }
    
    clearSession() {
        sessionStorage.removeItem(AUTH_CONFIG.storageKey);
        localStorage.removeItem(AUTH_CONFIG.storageKey + '_backup');
    }
    
    getSession() {
        const sessionData = sessionStorage.getItem(AUTH_CONFIG.storageKey) || 
                           localStorage.getItem(AUTH_CONFIG.storageKey + '_backup');
        
        return sessionData ? JSON.parse(sessionData) : null;
    }
    
    updateLastActivity() {
        const session = this.getSession();
        if (session) {
            session.lastActivity = Date.now();
            sessionStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(session));
            localStorage.setItem(AUTH_CONFIG.storageKey + '_backup', JSON.stringify(session));
        }
    }
    
    isAuthenticated() {
        const session = this.getSession();
        
        if (!session) {
            return false;
        }
        
        // Check if session has expired
        if (Date.now() > session.expiresAt) {
            this.clearSession();
            return false;
        }
        
        // Check for inactivity (auto-logout after 30 minutes of inactivity)
        const inactivityLimit = 30 * 60 * 1000; // 30 minutes
        if (Date.now() - session.lastActivity > inactivityLimit) {
            this.clearSession();
            this.showNotification('Session expired due to inactivity', 'warning');
            return false;
        }
        
        return true;
    }
    
    showLoginScreen() {
        this.loginScreen.classList.remove('hidden');
        this.adminPanel.classList.add('hidden');
        
        // Focus on username field
        setTimeout(() => {
            document.getElementById('username').focus();
        }, 300);
        
        // Update page title
        document.title = 'UFO Drops - Admin Login';
    }
    
    showAdminPanel() {
        this.loginScreen.classList.add('hidden');
        this.adminPanel.classList.remove('hidden');
        
        // Update page title
        document.title = 'UFO Drops - Admin Panel';
        
        // Update user info
        const session = this.getSession();
        if (session) {
            this.adminUser.textContent = session.username;
        }
    }
    
    showError(message) {
        this.loginError.textContent = message;
        this.loginError.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }
    
    clearError() {
        this.loginError.textContent = '';
        this.loginError.style.display = 'none';
    }
    
    shakeLoginForm() {
        this.loginForm.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.loginForm.style.animation = '';
        }, 500);
    }
    
    startSessionTimer() {
        // Check session validity every minute
        setInterval(() => {
            if (!this.isAuthenticated() && !this.loginScreen.classList.contains('hidden')) {
                this.showLoginScreen();
            }
        }, 60000);
        
        // Show session warning 5 minutes before expiry
        setInterval(() => {
            const session = this.getSession();
            if (session) {
                const timeLeft = session.expiresAt - Date.now();
                const warningTime = 5 * 60 * 1000; // 5 minutes
                
                if (timeLeft <= warningTime && timeLeft > 0) {
                    const minutesLeft = Math.ceil(timeLeft / 60000);
                    this.showNotification(
                        `Session expires in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`,
                        'warning'
                    );
                }
            }
        }, 60000);
    }
    
    showNotification(message, type = 'info') {
        // This will be implemented in admin.js
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
    
    // Public methods for external use
    getCurrentUser() {
        const session = this.getSession();
        return session ? session.username : null;
    }
    
    getSessionInfo() {
        const session = this.getSession();
        if (!session) return null;
        
        return {
            username: session.username,
            loginTime: new Date(session.loginTime),
            lastActivity: new Date(session.lastActivity),
            expiresAt: new Date(session.expiresAt),
            timeLeft: session.expiresAt - Date.now()
        };
    }
    
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.expiresAt = Date.now() + AUTH_CONFIG.sessionDuration;
            session.lastActivity = Date.now();
            sessionStorage.setItem(AUTH_CONFIG.storageKey, JSON.stringify(session));
            localStorage.setItem(AUTH_CONFIG.storageKey + '_backup', JSON.stringify(session));
            
            this.showNotification('Session extended successfully', 'success');
        }
    }
    
    // Security features
    detectSuspiciousActivity() {
        const session = this.getSession();
        if (!session) return;
        
        // Check for multiple rapid login attempts
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
        const recentAttempts = attempts.filter(time => Date.now() - time < 300000); // 5 minutes
        
        if (recentAttempts.length > 5) {
            this.lockAccount();
            return;
        }
        
        // Check for unusual activity patterns
        this.checkActivityPattern();
    }
    
    lockAccount() {
        const lockUntil = Date.now() + (15 * 60 * 1000); // Lock for 15 minutes
        localStorage.setItem('accountLocked', lockUntil.toString());
        this.clearSession();
        this.showError('Account temporarily locked due to suspicious activity. Try again in 15 minutes.');
        this.showLoginScreen();
    }
    
    isAccountLocked() {
        const lockUntil = localStorage.getItem('accountLocked');
        if (lockUntil && Date.now() < parseInt(lockUntil)) {
            const timeLeft = Math.ceil((parseInt(lockUntil) - Date.now()) / 60000);
            this.showError(`Account locked. Try again in ${timeLeft} minutes.`);
            return true;
        } else if (lockUntil) {
            localStorage.removeItem('accountLocked');
        }
        return false;
    }
    
    logLoginAttempt() {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
        attempts.push(Date.now());
        
        // Keep only last 10 attempts
        if (attempts.length > 10) {
            attempts.splice(0, attempts.length - 10);
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }
    
    checkActivityPattern() {
        // Simple activity pattern detection
        const session = this.getSession();
        if (!session) return;
        
        const activities = JSON.parse(localStorage.getItem('userActivity') || '[]');
        activities.push(Date.now());
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.splice(0, activities.length - 100);
        }
        
        localStorage.setItem('userActivity', JSON.stringify(activities));
    }
}

// Additional CSS for shake animation
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Initialize authentication when DOM is loaded
let authManager;

document.addEventListener('DOMContentLoaded', function() {
    authManager = new AuthManager();
    
    // Make auth manager globally available
    window.authManager = authManager;
});

// Handle page unload (cleanup)
window.addEventListener('beforeunload', function() {
    if (authManager && authManager.isAuthenticated()) {
        authManager.updateLastActivity();
    }
});

// Handle browser refresh/reload
window.addEventListener('load', function() {
    // Check for session restoration after page reload
    if (authManager && authManager.isAuthenticated()) {
        authManager.updateLastActivity();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, AUTH_CONFIG };
}
