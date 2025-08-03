// Global state
let currentUser = {
    name: 'Alien Explorer',
    level: 1,
isRegistered: false, // Добавить новое свойство
joinedProjects: [],
completedProjects: [],
badges: []
};

let projects = [
    {
        id: 1,
        name: 'Bless Network',
        logo: '🌐',
        category: 'depin',
        status: 'open',
        tags: ['DePIN', 'Free', 'Mobile', 'No KYC'],
        description: 'Decentralized infrastructure network. Earn tokens by sharing your internet connection.',
        potentialReward: '$50-100',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://bless.network',
        steps: [
            'Register on the platform',
            'Download mobile app',
            'Keep app running daily',
            'Complete daily check-ins',
            'Wait for token distribution'
        ]
    },
    {
        id: 2,
        name: 'NodePay',
        logo: '💰',
        category: 'depin',
        status: 'open',
        tags: ['DePIN', 'Passive', 'Chrome Extension'],
        description: 'Monetize your unused internet bandwidth with NodePay extension.',
        potentialReward: '$30-80',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://nodepay.ai',
        steps: [
            'Install Chrome extension',
            'Create account',
            'Connect your wallet',
            'Keep extension active',
            'Earn daily rewards'
        ]
    },
    {
        id: 3,
        name: 'Hivemapper',
        logo: '🗺️',
        category: 'depin',
        status: 'open',
        tags: ['DePIN', 'Drive-to-Earn', 'AI'],
        description: 'Contribute to decentralized mapping by driving with dashcam.',
        potentialReward: '$100-300',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://hivemapper.com',
        steps: [
            'Download Hivemapper app',
            'Install dashcam device',
            'Drive and map roads',
            'Upload mapping data',
            'Earn HONEY tokens'
        ]
    },
    {
        id: 4,
        name: 'Grass Protocol',
        logo: '🌱',
        category: 'depin',
        status: 'open',
        tags: ['DePIN', 'Bandwidth', 'Passive'],
        description: 'Sell your unused internet bandwidth to AI companies.',
        potentialReward: '$40-120',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://getgrass.io',
        steps: [
            'Sign up with email',
            'Install desktop application',
            'Connect to network',
            'Keep app running 24/7',
            'Accumulate points daily'
        ]
    },
    {
        id: 5,
        name: 'Friend.tech',
        logo: '👥',
        category: 'social',
        status: 'upcoming',
        tags: ['SocialFi', 'Keys Trading', 'Base'],
        description: 'Social network where you can buy and sell access to people.',
        potentialReward: 'TBD',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://friend.tech',
        steps: [
            'Connect Base wallet',
            'Buy friend keys',
            'Engage in chats',
            'Trade keys actively',
            'Wait for airdrop announcement'
        ]
    },
    {
        id: 6,
        name: 'Polyhedra ZK',
        logo: '🔺',
        category: 'testnet',
        status: 'open',
        tags: ['ZK-Proofs', 'Testnet', 'Cross-chain'],
        description: 'Zero-knowledge proof infrastructure for cross-chain interoperability.',
        potentialReward: '$200-500',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://polyhedra.network',
        steps: [
            'Connect MetaMask wallet',
            'Bridge tokens on testnet',
            'Complete ZK proofs',
            'Participate in governance',
            'Submit feedback reports'
        ]
    },
    {
        id: 7,
        name: 'Saga Protocol',
        logo: '⚔️',
        category: 'gamefi',
        status: 'open',
        tags: ['GameFi', 'Chainlets', 'Gaming'],
        description: 'Launch your own gaming chainlet on Saga Protocol.',
        potentialReward: '$150-400',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://sagaprotocol.org',
        steps: [
            'Create Saga account',
            'Deploy a chainlet',
            'Complete gaming quests',
            'Stake SAGA tokens',
            'Participate in community events'
        ]
    },
    {
        id: 8,
        name: 'Eigenlayer',
        logo: '🔐',
        category: 'testnet',
        status: 'closed',
        tags: ['Restaking', 'Ethereum', 'AVS'],
        description: 'Restaking protocol for securing actively validated services.',
        potentialReward: '$300-800',
      rewardPool: '70,000 USDT',
endDate: '2025-09-30',
        website: 'https://eigenlayer.xyz',
        steps: [
            'Stake ETH on mainnet',
            'Choose operators',
            'Participate in AVS',
            'Complete testnet tasks',
            'Maintain good operator score'
        ]
    }
];

let badges = [
    {
        id: 'first_mission',
        name: 'First Contact',
        description: 'Joined your first mission',
        icon: '🚀',
        requirement: 1,
        type: 'joined'
    },
    {
        id: 'alien_hunter',
        name: 'Alien Hunter',
        description: 'Completed 3 missions',
        icon: '👽',
        requirement: 3,
        type: 'completed'
    },
    {
        id: 'drop_lord',
        name: 'Drop Lord',
        description: 'Completed 10 missions',
        icon: '👑',
        requirement: 10,
        type: 'completed'
    },
    {
        id: 'early_adopter',
        name: 'Early Adopter',
        description: 'Joined 5 missions',
        icon: '⭐',
        requirement: 5,
        type: 'joined'
    },
    {
        id: 'depin_expert',
        name: 'DePIN Expert',
        description: 'Completed 5 DePIN projects',
        icon: '🌐',
        requirement: 5,
        type: 'category',
        category: 'depin'
    }
];

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    renderProjects();
    renderMissions();
    renderProfile();
    renderBadges();
    updateStats();
});

// Navigation functionality
navToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetSection = this.getAttribute('data-section');
        showSection(targetSection);
        
        // Close mobile menu
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Section switching
function showSection(sectionId) {
  const restrictedSections = ['missions', 'learn', 'profile'];
if (!currentUser.isRegistered && restrictedSections.includes(sectionId)) {
    showRegistrationModal();
    return;
}
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Start mission button
startMissionBtn.addEventListener('click', function() {
    showSection('home');
    document.querySelector('.catalog-section').scrollIntoView({ behavior: 'smooth' });
});

// Project filtering
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        renderProjects(filter);
    });
});

// Render projects
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

// Get status text
function getStatusText(status) {
    switch(status) {
        case 'open': return '✅ Open';
        case 'upcoming': return '⏳ Upcoming';
        case 'closed': return '🛑 Closed';
        default: return status;
    }
}

// Modal functionality
function openProjectModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const isJoined = currentUser.joinedProjects.includes(project.id);
    
    document.getElementById('modal-title').textContent = project.name;
    document.getElementById('modal-logo').textContent = project.logo;
    document.getElementById('modal-description').textContent = project.description;
    document.getElementById('modal-reward').textContent = project.potentialReward;
  
// Add reward pool and end date
const detailsContainer = document.querySelector('.project-details');

// Check if elements already exist to prevent duplicates
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
    
    // Render tags
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
    
    // Render checklist
    const checklistContainer = document.getElementById('modal-checklist');
    checklistContainer.innerHTML = project.steps.map((step, index) => `
        <div class="checklist-item">
            <span class="checklist-icon">📋</span>
            <span>${index + 1}. ${step}</span>
        </div>
    `).join('');
    
    // Update buttons
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

closeModal.addEventListener('click', function() {
    modal.classList.remove('active');
});

modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Join mission
function joinMission(projectId) {
    // Проверяем регистрацию только при фактическом присоединении
    if (!currentUser.isRegistered) {
        showRegistrationModal();
        return;
    }
    
    if (currentUser.joinedProjects.includes(projectId)) {
        showNotification('Already joined this mission!', 'warning');
        return;
    }
    currentUser.joinedProjects.push(projectId);
    saveUserData();
    updateStats();
    checkBadges();
    renderMissions();
    renderProjects();
    modal.classList.remove('active');
    const project = projects.find(p => p.id === projectId);
    showNotification(`Successfully joined ${project.name}!`, 'success');
}

// Render missions
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
    const project = projects.find(p => p.id === projectId);
    if (project && project.endDate) {
        const endDate = new Date(project.endDate);
        const today = new Date();
        const totalTime = endDate - new Date('2024-01-01'); // Assuming project started on 2024-01-01
        const elapsed = today - new Date('2024-01-01');
        progress = Math.min(95, Math.max(5, Math.floor((elapsed / totalTime) * 100)));
    } else {
        progress = Math.floor(Math.random() * 80) + 10; // fallback
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

// Mark mission complete/incomplete
function markComplete(projectId) {
    if (!currentUser.completedProjects.includes(projectId)) {
        currentUser.completedProjects.push(projectId);
        saveUserData();
        updateStats();
        checkBadges();
        renderMissions();
        renderProfile();
        
        const project = projects.find(p => p.id === projectId);
        showNotification(`Completed ${project.name}! 🎉`, 'success');
    }
}

function markIncomplete(projectId) {
    currentUser.completedProjects = currentUser.completedProjects.filter(id => id !== projectId);
    saveUserData();
    updateStats();
    renderMissions();
    renderProfile();
    
    const project = projects.find(p => p.id === projectId);
    showNotification(`Marked ${project.name} as incomplete`, 'info');
}

// Update stats
function updateStats() {
    document.getElementById('active-count').textContent = currentUser.joinedProjects.length - currentUser.completedProjects.length;
    document.getElementById('completed-count').textContent = currentUser.completedProjects.length;
    document.getElementById('total-projects').textContent = currentUser.joinedProjects.length;
    document.getElementById('completed-projects').textContent = currentUser.completedProjects.length;
    
    // Calculate potential rewards
    const potentialValue = currentUser.completedProjects.length * 150;
    document.getElementById('potential-rewards').textContent = `$${potentialValue}`;
    
    // Update level
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

// Badge system
function checkBadges() {
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
    
    saveUserData();
    renderBadges();
}

// Render badges
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

// Render profile
function renderProfile() {
    updateStats();
    renderBadges();
}

// Notification system
function showNotification(message, type = 'success') {
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = document.querySelector('.notification-icon');
    
    notificationText.textContent = message;
    
    // Set icon based on type
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

// Local storage functions
function saveUserData() {
    localStorage.setItem('ufoDropsUser', JSON.stringify(currentUser));
}

function loadUserData() {
    const savedUser = localStorage.getItem('ufoDropsUser');
    if (savedUser) {
        currentUser = { ...currentUser, ...JSON.parse(savedUser) };
      // Ensure isRegistered property exists for older saved data
if (currentUser.isRegistered === undefined) {
    currentUser.isRegistered = false;
}
    }
}

// Daily drop alert simulation
function showDailyDropAlert() {
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    showNotification(`🚨 Daily Drop Alert: Check out ${randomProject.name}!`, 'info');
}

// Simulate daily alerts (every 30 seconds for demo)
setInterval(showDailyDropAlert, 30000);

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
    catalogSection.appendChild(searchInput);
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
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addSearchFunctionality, 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape' && modal.classList.contains('active')) {
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
function addFloatingAnimation(element) {
    element.style.animation = 'float 3s ease-in-out infinite';
}

function addPulseAnimation(element) {
    element.style.animation = 'pulse 2s ease-in-out infinite';
}

// Apply animations to project cards
function applyCardAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-in');
    });
}

// Add CSS for card animations
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

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe project cards for animation
function observeProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        observer.observe(card);
    });
}

// Mock data for demo purposes
function addMockData() {
    // Simulate some user having joined projects
    if (currentUser.joinedProjects.length === 0) {
        // Add some sample joined projects for demo
        currentUser.joinedProjects = [1, 2, 3];
        currentUser.completedProjects = [1];
        currentUser.badges = ['first_mission'];
        saveUserData();
    }
}

// Enhanced project rendering with animations
function renderProjectsWithAnimation(filter = 'all') {
    renderProjects(filter);
    setTimeout(() => {
        applyCardAnimations();
        observeProjectCards();
    }, 100);
}

// Update the original renderProjects call
const originalRenderProjects = renderProjects;
renderProjects = function(filter = 'all') {
    originalRenderProjects(filter);
    setTimeout(() => {
        applyCardAnimations();
        observeProjectCards();
    }, 100);
};

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
document.addEventListener('DOMContentLoaded', function() {
    showWelcomeMessage();
});

// Progress tracking simulation
function simulateProgress() {
    currentUser.joinedProjects.forEach(projectId => {
        if (!currentUser.completedProjects.includes(projectId)) {
            // Randomly complete some projects over time (demo purposes)
            if (Math.random() < 0.1) { // 10% chance every interval
                setTimeout(() => {
                    markComplete(projectId);
                }, Math.random() * 10000);
            }
        }
    });
}

// Run progress simulation occasionally
setInterval(simulateProgress, 60000); // Every minute

// Export functions for global access
window.showSection = showSection;
window.openProjectModal = openProjectModal;
window.joinMission = joinMission;
window.markComplete = markComplete;
window.markIncomplete = markIncomplete;

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

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
    
    // Show install button or banner
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

// Remove mission modal and functions
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

function removeMission(projectId) {
    currentUser.joinedProjects = currentUser.joinedProjects.filter(id => id !== projectId);
    currentUser.completedProjects = currentUser.completedProjects.filter(id => id !== projectId);
    saveUserData();
    updateStats();
    renderMissions();
    renderProjects();
    
    const project = projects.find(p => p.id === projectId);
    showNotification(`Removed ${project.name} from missions`, 'info');
}

window.showRemoveModal = showRemoveModal;
// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
window.formatDate = formatDate;
// Registration Modal Functionality
function showRegistrationModal() {
    const regModal = document.createElement('div');
    regModal.className = 'modal active';
    regModal.id = 'registration-modal';
    regModal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>🚀 Register to Join Missions</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem;">Registration is simulated. Click the button below to unlock full features.</p>
                <button class="primary-button" onclick="registerUser(); this.closest('.modal').remove();">
                    <span class="button-icon">👽</span> Register (Simulate)
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(regModal);
}

function registerUser() {
    currentUser.isRegistered = true;
    saveUserData();
    showNotification('Registration successful! Welcome, Alien Explorer! 🎉', 'success');
}

window.showRegistrationModal = showRegistrationModal;
window.registerUser = registerUser;
window.removeMission = removeMission;
