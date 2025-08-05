// Global state
let currentUser = {
    uid: null, // Firebase UID
    email: null, // User's email
    displayName: 'Alien Explorer',
    level: 1,
    joinedProjects: [],
    completedProjects: [],
    badges: []
};
let projects = []; // Будет заполняться из Firestore
let badges = [
    { id: 'first_mission', name: 'First Mission', icon: '🚀', description: 'Complete your first drop', requirement: 1, type: 'joined' },
    { id: 'depin_master', name: 'DePIN Master', icon: '🌐', description: 'Complete 3 DePIN projects', requirement: 3, type: 'category', category: 'depin' },
    { id: 'completionist', name: 'Completionist', icon: '🏆', description: 'Complete 5 drops', requirement: 5, type: 'completed' },
    { id: 'alien_hunter', name: 'Alien Hunter', icon: '👽', description: 'Completed 3 missions', requirement: 3, type: 'completed' },
    { id: 'drop_lord', name: 'Drop Lord', icon: '👑', description: 'Completed 10 missions', requirement: 10, type: 'completed' },
    { id: 'early_adopter', name: 'Early Adopter', icon: '⭐', description: 'Joined 5 missions', requirement: 5, type: 'joined' },
    { id: 'depin_expert', name: 'DePIN Expert', icon: '🌐', description: 'Completed 5 DePIN projects', requirement: 5, type: 'category', category: 'depin' }
];

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
// Выбираем ссылки навигации внутри меню, у которых есть атрибут data-section
const navLinks = document.querySelectorAll('#nav-menu a.nav-link[data-section]');
const sections = document.querySelectorAll('.section');
const projectsGrid = document.getElementById('projects-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const startMissionBtn = document.getElementById('start-mission');
const modal = document.getElementById('project-modal');
const closeModal = document.getElementById('close-modal');
const joinMissionBtn = document.getElementById('join-mission');
const visitProjectBtn = document.getElementById('visit-project');
const notification = document.getElementById('notification');
const missionsContainer = document.getElementById('missions-container');
const badgesGrid = document.getElementById('badges-grid');

// Firebase functions
async function loadProjectsFromFirestore() {
    try {
        const querySnapshot = await db.collection('projects').get();
        projects = [];
        querySnapshot.forEach((doc) => {
            const projectData = doc.data();
            if (projectData.endDate && typeof projectData.endDate.toDate === 'function') {
                projectData.endDate = projectData.endDate.toDate().toISOString().split('T')[0];
            }
            projects.push({ id: parseInt(doc.id), ...projectData });
        });
        console.log("Projects loaded from Firestore:", projects);
        renderProjects();
    } catch (error) {
        console.error("Error loading projects from Firestore:", error);
        showNotification("Failed to load projects.", 'error');
    }
}

async function loadUserDataFromFirestore(user) {
    if (!user) return;
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (doc.exists) {
            const userData = doc.data();
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: userData.displayName || user.displayName || 'Alien Explorer',
                level: userData.level || 1,
                joinedProjects: userData.joinedProjects || [],
                completedProjects: userData.completedProjects || [],
                badges: userData.badges || []
            };
        } else {
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Alien Explorer',
                level: 1,
                joinedProjects: [],
                completedProjects: [],
                badges: []
            };
            await db.collection('users').doc(user.uid).set(currentUser);
        }
        console.log("User data loaded from Firestore:", currentUser);
        updateUIForUser(currentUser);
        renderMissions();
        renderProfile();
        updateStats();
    } catch (error) {
        console.error("Error loading user data from Firestore:", error);
        showNotification("Failed to load user data.", 'error');
    }
}

async function saveUserDataToFirestore() {
    if (!currentUser.uid) return;
    try {
        const userDataToSave = {
            displayName: currentUser.displayName,
            level: currentUser.level,
            joinedProjects: currentUser.joinedProjects,
            completedProjects: currentUser.completedProjects,
            badges: currentUser.badges
        };
        await db.collection('users').doc(currentUser.uid).set(userDataToSave, { merge: true });
        console.log("User data saved to Firestore");
    } catch (error) {
        console.error("Error saving user data to Firestore:", error);
        showNotification("Failed to save user data.", 'error');
    }
}

function updateUIForUser(user) {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const profileLink = document.querySelector('.nav-link[data-section="profile"]');

    if (user && user.uid) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            logoutBtn.textContent = `Logout (${user.email})`;
        }
        if (profileLink) profileLink.style.display = 'flex';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (profileLink) profileLink.style.display = 'none';

        currentUser = {
            uid: null,
            email: null,
            displayName: 'Alien Explorer',
            level: 1,
            joinedProjects: [],
            completedProjects: [],
            badges: []
        };
        renderMissions();
        renderProfile();
        updateStats();
    }
}

async function registerUser(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        showNotification(`Registration successful! Welcome, ${user.email}! 🎉`, 'success');
    } catch (error) {
        const errorCode = error.code;
        console.error("Registration error:", errorCode, error.message);
        let userMessage = "Registration failed.";
        if (errorCode === 'auth/email-already-in-use') {
            userMessage = "Email already in use.";
        } else if (errorCode === 'auth/invalid-email') {
            userMessage = "Invalid email address.";
        } else if (errorCode === 'auth/weak-password') {
            userMessage = "Password is too weak.";
        }
        showNotification(userMessage, 'error');
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        showNotification(`Login successful! Welcome back, ${user.email}! 🎉`, 'success');
    } catch (error) {
        const errorCode = error.code;
        console.error("Login error:", errorCode, error.message);
        let userMessage = "Login failed.";
        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            userMessage = "Incorrect email or password.";
        } else if (errorCode === 'auth/invalid-email') {
            userMessage = "Invalid email address.";
        }
        showNotification(userMessage, 'error');
    }
}

async function logoutUser() {
    try {
        await auth.signOut();
        showNotification("You have been logged out.", 'info');
    } catch (error) {
        console.error("Logout error:", error);
        showNotification("Logout failed.", 'error');
    }
}

function showAuthModal() {
    console.log("showAuthModal called"); // <-- Добавим эту строку для отладки
    let authModal = document.getElementById('auth-modal');
    if (!authModal) {
        authModal = document.createElement('div');
        authModal.className = 'modal active';
        authModal.id = 'auth-modal';
        authModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>🔐 Authenticate</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="auth-form-container">
                        <h4 id="auth-form-title">Login</h4>
                        <input type="email" id="auth-email" placeholder="Email" style="width:100%; padding:0.5rem; margin-bottom:0.5rem; background:rgba(255,255,255,0.1); border:2px solid rgba(255,255,255,0.2); border-radius:8px; color:#fff;">
                        <input type="password" id="auth-password" placeholder="Password" style="width:100%; padding:0.5rem; margin-bottom:1rem; background:rgba(255,255,255,0.1); border:2px solid rgba(255,255,255,0.2); border-radius:8px; color:#fff;">
                        <button class="primary-button" id="auth-submit-btn" style="width:100%; margin-bottom:0.5rem;">Login</button>
                        <p style="text-align:center; margin-bottom:0.5rem;"><a href="#" id="toggle-auth-mode">Don't have an account? Register</a></p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(authModal);

        document.getElementById('auth-submit-btn').addEventListener('click', handleAuthSubmit);
        document.getElementById('toggle-auth-mode').addEventListener('click', toggleAuthMode);
    } else {
        authModal.classList.add('active');
    }
}

function toggleAuthMode(e) {
    e.preventDefault();
    const title = document.getElementById('auth-form-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('toggle-auth-mode');
    if (title.textContent === 'Login') {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleLink.innerHTML = 'Already have an account? Login';
    } else {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleLink.innerHTML = "Don't have an account? Register";
    }
}

async function handleAuthSubmit() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const title = document.getElementById('auth-form-title').textContent;

    if (!email || !password) {
        showNotification("Please fill in all fields.", 'warning');
        return;
    }

    if (title === 'Login') {
        await loginUser(email, password);
    } else if (title === 'Register') {
        await registerUser(email, password);
    }
}

// Auth state observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("User signed in:", user);
        await loadUserDataFromFirestore(user);
    } else {
        console.log("User signed out");
        updateUIForUser(null);
    }
});

// Navigation functionality
// Обновленная функция showSection с проверкой аутентификации Firebase
function showSection(sectionId) {
    console.log("showSection called with:", sectionId); // <-- Для отладки
    const restrictedSections = ['missions', 'learn', 'profile'];

    // Проверяем аутентификацию через Firebase, а не через старый currentUser.isRegistered
    if (!auth.currentUser && restrictedSections.includes(sectionId)) {
        showAuthModal(); // Показываем модальное окно Firebase аутентификации
        return;
    }

    // --- ИСПРАВЛЕНИЕ ---
    // Всегда получаем список секций прямо здесь, внутри функции
    const sections = document.querySelectorAll('.section');
    // Проверяем, нашлись ли секции
    if (sections) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
    } else {
        console.warn("Sections NodeList is not found in the DOM.");
    }
    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    // Находим целевую секцию по ID
    const targetSection = document.getElementById(sectionId);
    // Проверяем, существует ли элемент с таким ID
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`Section with id '${sectionId}' not found.`);
        // Или показать уведомление об ошибке
        // showNotification(`Section '${sectionId}' not found.`, 'error');
    }
}

// Project functions
function renderProjects(filter = 'all') {
    let filteredProjects = projects;
    
    if (filter !== 'all') {
        filteredProjects = projects.filter(project => project.category === filter);
    }
    
    projectsGrid.innerHTML = '';
    
    filteredProjects.forEach(project => {
        const isJoined = currentUser.joinedProjects.includes(project.id);
        const isCompleted = currentUser.completedProjects.includes(project.id);
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
// Замените ВСЮ строку projectCard.innerHTML = '...'; на эту:
projectCard.innerHTML = `
    <div class="project-logo">${project.logo}</div>
    <div class="project-info">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3>${project.name}</h3>
            <span class="project-status ${project.status}">${getStatusText(project.status)}</span>
        </div>
        <div class="project-tags">
            ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
        </div>
        <p class="project-description">${project.description}</p>
        <div class="project-rewards">
            <div class="potential-reward">
                <span class="reward-label">Potential:</span>
                <span class="reward-value">${project.potentialReward}</span>
            </div>
        </div>
        <div class="project-actions">
            <button class="primary-button" onclick="openProjectModal(${project.id})">
                <span class="button-icon">${isJoined ? '👁️' : '🚀'}</span>
                ${isJoined ? 'View Details' : 'Join Drop'}
            </button>
        </div>
    </div>
`;
        
        if (isCompleted) {
            projectCard.style.opacity = '0.7';
            projectCard.style.border = '2px solid #00ff9f';
        } else if (isJoined) {
            projectCard.style.border = '2px solid #0d6efd';
        }
        
        projectsGrid.appendChild(projectCard);
    });
}

function getStatusText(status) {
    switch(status) {
        case 'open': return '✅ Open';
        case 'upcoming': return '⏳ Upcoming';
        case 'closed': return '🛑 Closed';
        default: return status;
    }
}

function openProjectModal(projectId) {
    console.log("DEBUG: openProjectModal called with ID:", projectId); // <-- Добавить эту строку
    const project = projects.find(p => p.id === projectId);
    console.log("DEBUG: Found project object:", project); // <-- Добавить эту строку
    if (!project) {
        console.error("DEBUG: Project not found for ID:", projectId);
        return;
    }
    if (!project) return;
    
    const isJoined = currentUser.joinedProjects.includes(project.id);
    
    document.getElementById('modal-title').textContent = project.name;
    document.getElementById('modal-logo').textContent = project.logo;
    document.getElementById('modal-description').textContent = project.description;
    document.getElementById('modal-reward').textContent = project.potentialReward;
    
    const detailsContainer = document.querySelector('.project-details');
    
    if (!detailsContainer.querySelector('.reward-pool-info')) {
        const rewardPoolEl = document.createElement('div');
        rewardPoolEl.className = 'potential-reward reward-pool-info';
        rewardPoolEl.innerHTML = `
            <span class="reward-label">Reward Pool:</span>
            <span class="reward-value">${project.rewardPool}</span>
        `;
        detailsContainer.appendChild(rewardPoolEl);
    }

    if (!detailsContainer.querySelector('.end-date-info')) {
        const endDateEl = document.createElement('div');
        endDateEl.className = 'potential-reward end-date-info';
        endDateEl.innerHTML = `
            <span class="reward-label">End Date:</span>
            <span class="reward-value">${formatDate(project.endDate)}</span>
        `;
        detailsContainer.appendChild(endDateEl);
    }
    
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
    
    const checklistContainer = document.getElementById('modal-checklist');
    checklistContainer.innerHTML = project.steps.map((step, index) => `
        <div class="checklist-item">
            <span class="checklist-icon">📋</span>
            <span>${index + 1}. ${step}</span>
        </div>
    `).join('');
    
    const joinBtn = document.getElementById('join-mission');
    const visitBtn = document.getElementById('visit-project');
    
    if (isJoined) {
        joinBtn.innerHTML = '<span class="button-icon">✅</span> Already Joined';
        joinBtn.disabled = true;
        joinBtn.style.opacity = '0.6';
    } else {
        joinBtn.innerHTML = '<span class="button-icon">🚀</span> Join Mission';
        joinBtn.disabled = false;
        joinBtn.style.opacity = '1';
    }
    
    visitBtn.onclick = () => window.open(project.website, '_blank');
    joinBtn.onclick = () => joinMission(project.id);
    
    modal.classList.add('active');
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function joinMission(projectId) {
    if (!auth.currentUser) {
        showAuthModal();
        return;
    }
    
    if (currentUser.joinedProjects.includes(projectId)) {
        showNotification('Already joined this mission!', 'warning');
        return;
    }
    
    currentUser.joinedProjects.push(projectId);
    saveUserDataToFirestore();
    updateStats();
    checkBadges();
    renderMissions();
    renderProjects();
    modal.classList.remove('active');
    const project = projects.find(p => p.id === projectId);
    showNotification(`Successfully joined ${project.name}!`, 'success');
}

function renderMissions() {
    if (currentUser.joinedProjects.length === 0) {
        missionsContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🛸</span>
                <h3>No missions yet</h3>
                <p>Start exploring drops to begin your crypto journey!</p>
                <button class="secondary-button" onclick="showSection('home')">Explore Drops</button>
            </div>
        `;
        return;
    }
    
    missionsContainer.innerHTML = '';
    
    currentUser.joinedProjects.forEach(projectId => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const isCompleted = currentUser.completedProjects.includes(projectId);
        let progress = 100;
        if (!isCompleted) {
            if (project && project.endDate) {
                const endDate = new Date(project.endDate);
                const today = new Date();
                const totalTime = endDate - new Date('2024-01-01');
                const elapsed = today - new Date('2024-01-01');
                progress = Math.min(95, Math.max(5, Math.floor((elapsed / totalTime) * 100)));
            } else {
                progress = Math.floor(Math.random() * 80) + 10;
            }
        }

        const missionCard = document.createElement('div');
        missionCard.className = 'mission-card';
        missionCard.style.position = 'relative';
        missionCard.innerHTML = `
            <button class="remove-mission-btn" onclick="showRemoveModal(${projectId})" title="Remove from missions">
                <span>×</span>
            </button>
            <div class="mission-header">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="project-logo" style="font-size: 2rem;">${project.logo}</div>
                    <div>
                        <h3>${project.name}</h3>
                        <p style="color: rgba(255,255,255,0.7); margin: 0;">${project.description}</p>
                    </div>
                </div>
                <div class="project-status ${isCompleted ? 'open' : 'upcoming'}">
                    ${isCompleted ? '✅ Completed' : '⏳ In Progress'}
                </div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <span style="color: #00ff9f; font-weight: 600;">${progress}% Complete</span>
                <div style="display: flex; gap: 1rem;">
                    ${isCompleted ? 
                        '<button class="secondary-button" onclick="markIncomplete(' + projectId + ')">Mark Incomplete</button>' :
                        '<button class="primary-button" onclick="markComplete(' + projectId + ')">Mark Complete</button>'
                    }
                    <button class="secondary-button" onclick="openProjectModal(' + projectId + ')">View Details</button>
                </div>
            </div>
        `;
        
        missionsContainer.appendChild(missionCard);
    });
}

function markComplete(projectId) {
    if (!auth.currentUser) return;
    if (!currentUser.completedProjects.includes(projectId)) {
        currentUser.completedProjects.push(projectId);
        saveUserDataToFirestore();
        updateStats();
        checkBadges();
        renderMissions();
        renderProfile();
        
        const project = projects.find(p => p.id === projectId);
        showNotification(`Completed ${project.name}! 🎉`, 'success');
    }
}

function markIncomplete(projectId) {
    if (!auth.currentUser) return;
    currentUser.completedProjects = currentUser.completedProjects.filter(id => id !== projectId);
    saveUserDataToFirestore();
    updateStats();
    renderMissions();
    renderProfile();
    
    const project = projects.find(p => p.id === projectId);
    showNotification(`Marked ${project.name} as incomplete`, 'info');
}

function removeMission(projectId) {
    if (!auth.currentUser) return;
    currentUser.joinedProjects = currentUser.joinedProjects.filter(id => id !== projectId);
    currentUser.completedProjects = currentUser.completedProjects.filter(id => id !== projectId);
    saveUserDataToFirestore();
    updateStats();
    renderMissions();
    renderProjects();
    
    const project = projects.find(p => p.id === projectId);
    showNotification(`Removed ${project.name} from missions`, 'info');
}

function showRemoveModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const removeModal = document.createElement('div');
    removeModal.className = 'modal active';
    removeModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Remove Mission</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to remove <strong>${project.name}</strong> from your missions?</p>
                <div class="modal-actions" style="margin-top: 2rem;">
                    <button class="primary-button" onclick="removeMission(${projectId}); this.closest('.modal').remove();">
                        Remove Project
                    </button>
                    <button class="secondary-button" onclick="this.closest('.modal').remove();">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(removeModal);
}

function updateStats() {
    document.getElementById('active-count').textContent = currentUser.joinedProjects.length - currentUser.completedProjects.length;
    document.getElementById('completed-count').textContent = currentUser.completedProjects.length;
    document.getElementById('total-projects').textContent = currentUser.joinedProjects.length;
    document.getElementById('completed-projects').textContent = currentUser.completedProjects.length;
    
    const potentialValue = currentUser.completedProjects.length * 150;
    document.getElementById('potential-rewards').textContent = `$${potentialValue}`;
    
    const level = Math.floor(currentUser.completedProjects.length / 3) + 1;
    currentUser.level = level;
    
    const levelText = getLevelText(level);
    document.getElementById('user-level').textContent = `Level ${level} - ${levelText}`;
}

function getLevelText(level) {
    if (level === 1) return 'Newbie';
    if (level === 2) return 'Explorer';
    if (level === 3) return 'Hunter';
    if (level === 4) return 'Expert';
    if (level >= 5) return 'Master';
    return 'Alien';
}

function checkBadges() {
    if (!auth.currentUser) return;
    
    badges.forEach(badge => {
        if (currentUser.badges.includes(badge.id)) return;
        
        let earned = false;
        
        switch(badge.type) {
            case 'joined':
                earned = currentUser.joinedProjects.length >= badge.requirement;
                break;
            case 'completed':
                earned = currentUser.completedProjects.length >= badge.requirement;
                break;
            case 'category':
                const categoryProjects = currentUser.completedProjects.filter(id => {
                    const project = projects.find(p => p.id === id);
                    return project && project.category === badge.category;
                });
                earned = categoryProjects.length >= badge.requirement;
                break;
        }
        
        if (earned) {
            currentUser.badges.push(badge.id);
            showNotification(`New badge earned: ${badge.name}! 🏆`, 'success');
        }
    });
    
    saveUserDataToFirestore();
    renderBadges();
}

function renderBadges() {
    badgesGrid.innerHTML = '';
    
    badges.forEach(badge => {
        const isEarned = currentUser.badges.includes(badge.id);
        
        const badgeItem = document.createElement('div');
        badgeItem.className = `badge-item ${isEarned ? 'earned' : ''}`;
        badgeItem.innerHTML = `
            <span class="badge-icon">${badge.icon}</span>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-description">${badge.description}</div>
        `;
        
        badgesGrid.appendChild(badgeItem);
    });
}

function renderProfile() {
    updateStats();
    renderBadges();
}

function showNotification(message, type = 'success') {
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = document.querySelector('.notification-icon');
    
    if (!notificationText || !notificationIcon) return;
    
    notificationText.textContent = message;
    
    switch(type) {
        case 'success':
            notificationIcon.textContent = '✅';
            notification.style.background = 'rgba(0, 255, 159, 0.9)';
            break;
        case 'warning':
            notificationIcon.textContent = '⚠️';
            notification.style.background = 'rgba(255, 193, 7, 0.9)';
            break;
        case 'error':
            notificationIcon.textContent = '❌';
            notification.style.background = 'rgba(220, 53, 69, 0.9)';
            break;
        case 'info':
            notificationIcon.textContent = 'ℹ️';
            notification.style.background = 'rgba(13, 110, 253, 0.9)';
            break;
        default:
            notificationIcon.textContent = '✅';
            notification.style.background = 'rgba(0, 255, 159, 0.9)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    await loadProjectsFromFirestore();
    renderMissions();
    renderProfile();
    renderBadges();
    updateStats();

// Добавляем обработчик для кнопки логина
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', showAuthModal);
    console.log("Event listener added to login-btn"); // Для проверки
} else {
    console.error("Login button not found in DOM during initialization");
}
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            renderProjects(filter);
        });
    });

    // Modal close
    if (closeModal) {
        closeModal.addEventListener('click', closeProjectModal);
    }
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    // Navigation
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            showSection(targetSection);

            // Close mobile menu
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Start mission button
    if (startMissionBtn) {
        startMissionBtn.addEventListener('click', function() {
            showSection('home');
            document.querySelector('.catalog-section').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Export functions for global access
window.showSection = showSection;
window.openProjectModal = openProjectModal;
window.joinMission = joinMission;
window.markComplete = markComplete;
window.markIncomplete = markIncomplete;
window.removeMission = removeMission;
window.showRemoveModal = showRemoveModal;
window.showAuthModal = showAuthModal;
window.closeProjectModal = closeProjectModal;
window.formatDate = formatDate;

// Search functionality
function addSearchFunctionality() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 Search projects...';
    searchInput.className = 'search-input';
    searchInput.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #ffffff;
        font-family: 'Orbitron', monospace;
        width: 100%;
        max-width: 300px;
        margin: 1rem auto;
        display: block;
        transition: all 0.3s ease;
    `;
    
    searchInput.addEventListener('focus', function() {
        this.style.borderColor = '#00ff9f';
        this.style.boxShadow = '0 0 10px rgba(0, 255, 159, 0.3)';
    });
    
    searchInput.addEventListener('blur', function() {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        this.style.boxShadow = 'none';
    });
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredProjects = projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        renderFilteredProjects(filteredProjects);
    });
    
    const catalogSection = document.querySelector('.catalog-section .section-header');
    if (catalogSection) {
        catalogSection.appendChild(searchInput);
    }
}

function renderFilteredProjects(filteredProjects) {
    projectsGrid.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6); grid-column: 1/-1;">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔍</span>
                <h3>No projects found</h3>
                <p>Try adjusting your search terms</p>
            </div>
        `;
        return;
    }
    
    filteredProjects.forEach(project => {
        const isJoined = currentUser.joinedProjects.includes(project.id);
        const isCompleted = currentUser.completedProjects.includes(project.id);
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-header">
                <div class="project-logo">${project.logo}</div>
                <div class="project-info">
                    <h3>${project.name}</h3>
                    <div class="project-status ${project.status}">${getStatusText(project.status)}</div>
                </div>
            </div>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
            </div>
            <p class="project-description">${project.description}</p>
            <div class="project-actions">
                <button class="primary-button" onclick="openProjectModal(${project.id})">
                    <span class="button-icon">${isJoined ? '👁️' : '🚀'}</span>
                    ${isJoined ? 'View Details' : 'Join Drop'}
                </button>
            </div>
        `;
        
        if (isCompleted) {
            projectCard.style.opacity = '0.7';
            projectCard.style.border = '2px solid #00ff9f';
        } else if (isJoined) {
            projectCard.style.border = '2px solid #0d6efd';
        }
        
        projectsGrid.appendChild(projectCard);
    });
}

// Initialize search functionality after DOM load
setTimeout(() => {
    addSearchFunctionality();
}, 1000);

// Daily drop alert simulation
function showDailyDropAlert() {
    if (projects.length > 0) {
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        showNotification(`🚨 Daily Drop Alert: Check out ${randomProject.name}!`, 'info');
    }
}

// Simulate daily alerts (every 30 seconds for demo)
setInterval(showDailyDropAlert, 30000);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Animation utilities
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(30px);
    }
    
    @keyframes slideInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .search-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
`;
document.head.appendChild(style);

// Service worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Add to home screen prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Install App';
    installBtn.className = 'install-btn';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(45deg, #00ff9f, #0d6efd);
        border: none;
        color: #000;
        padding: 1rem;
        border-radius: 50px;
        font-family: 'Orbitron', monospace;
        font-weight: 600;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0, 255, 159, 0.3);
        transition: all 0.3s ease;
    `;
    
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.remove();
        }
    });
    
    document.body.appendChild(installBtn);
    
    setTimeout(() => {
        installBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            installBtn.style.transform = 'scale(1)';
        }, 200);
    }, 1000);
});

// Welcome message for new users
function showWelcomeMessage() {
    if (!localStorage.getItem('ufoDropsWelcome')) {
        setTimeout(() => {
            showNotification('Welcome to UFO Drops! 🛸 Start your crypto journey!', 'info');
            localStorage.setItem('ufoDropsWelcome', 'true');
        }, 2000);
    }
}

// Initialize welcome message
showWelcomeMessage();
