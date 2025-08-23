// Global state
let projects = [];

// DOM Elements
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('#nav-menu a.nav-link[data-section]');
const sections = document.querySelectorAll('.section');
const projectsGrid = document.getElementById('projects-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const startMissionBtn = document.getElementById('start-mission');
const modal = document.getElementById('project-modal');
const closeModal = document.getElementById('close-modal');
const missionDetailsBtn = document.getElementById('mission-details-btn');
const visitProjectBtn = document.getElementById('visit-project');
const notification = document.getElementById('notification');

// Firebase functions
async function loadProjectsFromFirestore() {
    try {
        const querySnapshot = await db.collection('projects').get();
        projects = [];
        querySnapshot.forEach((doc) => {
            const projectData = doc.data();
            if (projectData.endDate) {
                if (typeof projectData.endDate.toDate === 'function') {
                    projectData.endDate = projectData.endDate.toDate().toISOString().split('T')[0];
                }
            }
            projects.push({ id: doc.id, ...projectData });
        });
        console.log("Projects loaded from Firestore:", projects);
        renderProjects();
    } catch (error) {
        console.error("Error loading projects from Firestore:", error);
        showNotification("Failed to load projects.", 'error');
    }
}

async function loadMissionDetailsFromFirestore(projectId, project) {
    console.log("Exact projectId:", JSON.stringify(projectId));
console.log("ProjectId length:", projectId.length);
    try {
        const doc = await db.collection('missionDetails').doc(projectId).get();
        if (doc.exists) {
            const missionData = doc.data();
            populateMissionDetailsModal(project, missionData);
} else {
    console.log("No mission details found for project:", projectId);
}
    } catch (error) {
        console.error("Error loading mission details:", error);
        showNotification("Failed to load mission details.", 'error');
    }
}

function populateMissionDetailsModal(project, missionData) {
    
// Daily tasks
if (missionData.dailyTasks) {
    const dailyTasksContainer = document.getElementById('mission-daily-tasks');
    dailyTasksContainer.innerHTML = missionData.dailyTasks.map(task => 
        `<div class="daily-task">✅ ${task}</div>`
    ).join('');
}
    
// Links
if (missionData.links) {
    const linksContainer = document.getElementById('mission-links');
    linksContainer.innerHTML = missionData.links.map(link => 
        `<a href="${link.url}" target="_blank" class="project-link-btn">
            <span class="link-icon">${link.icon}</span>
            <span>${link.text}</span>
        </a>`
    ).join('');
}

// Boost tips
if (missionData.boostTips) {
    const boostTipsContainer = document.getElementById('mission-boost-tips');
    boostTipsContainer.innerHTML = missionData.boostTips.map(tip => 
        `<li>🎯 ${tip}</li>`
    ).join('');
}
    }

// Navigation functionality
function showSection(sectionId) {
    console.log("showSection called with:", sectionId);
    
    const sections = document.querySelectorAll('.section');
    if (sections) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
    }
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`Section with id '${sectionId}' not found.`);
    }
}

// Project functions
function renderProjects(filter = 'all') {
    let filteredProjects = projects;
    
    if (filter !== 'all') {
        filteredProjects = projects.filter(project => project.category === filter);
    }
    
    projectsGrid.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6); grid-column: 1/-1;">
                <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">📂</span>
                <h3>No projects found</h3>
                <p>Try selecting a different category</p>
            </div>
        `;
        return;
    }
    
    filteredProjects.forEach(project => {
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
                <button class="primary-button" onclick="openProjectModal('${project.id}')">
                    <span class="button-icon">🚀</span>
                    View Details
                </button>
            </div>
        `;
        
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
    console.log("openProjectModal called with ID:", projectId);
    const project = projects.find(p => p.id === projectId);
    console.log("Found project object:", project);
    
    if (!project) {
        console.error("Project not found for ID:", projectId);
        return;
    }
    
    // Populate modal data
    document.getElementById('modal-title').textContent = project.name;
    document.getElementById('modal-logo').textContent = project.logo;
    document.getElementById('modal-description').textContent = project.description;
    document.getElementById('modal-reward').textContent = project.potentialReward || 'TBD';
    document.getElementById('modal-reward-pool').textContent = project.rewardPool || 'TBD';
    document.getElementById('modal-end-date').textContent = formatDate(project.endDate) || 'TBD';
    
    // Populate tags
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');
    
    // Populate checklist
    const checklistContainer = document.getElementById('modal-checklist');
    checklistContainer.innerHTML = project.steps.map((step, index) => `
        <div class="checklist-item">
            <span class="checklist-icon">📋</span>
            <span>${index + 1}. ${step}</span>
        </div>
    `).join('');
    
    // Set button handlers
    const missionDetailsBtn = document.getElementById('mission-details-btn');
    const visitBtn = document.getElementById('visit-project');
    
    missionDetailsBtn.onclick = () => {
        closeProjectModal();
        openMissionDetailsModal(project.id);
    };
    
    visitBtn.onclick = () => window.open(project.website, '_blank');
    
    modal.classList.add('active');
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function openMissionDetailsModal(projectId) {
    console.log("openMissionDetailsModal called with:", projectId);
    const project = projects.find(p => p.id === projectId);
    console.log("Found project:", project);
    // Set back button handler
const backBtn = document.getElementById('back-to-project');
if (backBtn) {
    backBtn.onclick = () => {
        closeMissionDetailsModal();
        openProjectModal(projectId);
    };
}
    
    if (!project) return;
    
    const modal = document.getElementById('mission-details-modal');
    console.log("Modal element found:", modal);
    
    // Populate basic info
    document.getElementById('mission-modal-title').textContent = `${project.name} - Mission Details`;
    document.getElementById('mission-modal-logo').textContent = project.logo;
    document.getElementById('mission-modal-name').textContent = project.name;
    document.getElementById('mission-modal-description').textContent = project.description;

    // Load mission details from Firebase
loadMissionDetailsFromFirestore(projectId, project);
    
    modal.classList.add('active');
    console.log("Modal opened, classes:", modal.className);
}

function closeMissionDetailsModal() {
    const modal = document.getElementById('mission-details-modal');
    if (modal) {
        modal.classList.remove('active');
        console.log("Modal closed");
    }
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
    if (!dateString) return 'TBD';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

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
                <button class="primary-button" onclick="openProjectModal('${project.id}')">
                    <span class="button-icon">🚀</span>
                    View Details
                </button>
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    await loadProjectsFromFirestore();

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            renderProjects(filter);
        });
    });

    // Modal close handlers
    if (closeModal) {
        closeModal.addEventListener('click', function(e) {
            e.preventDefault();
            closeProjectModal();
        });
    }

    // Mission details modal close handler
    const closeMissionModalBtn = document.getElementById('close-mission-modal');
    if (closeMissionModalBtn) {
        closeMissionModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeMissionDetailsModal();
        });
    }

    // Modal background click handlers
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    const missionDetailsModal = document.getElementById('mission-details-modal');
    if (missionDetailsModal) {
        missionDetailsModal.addEventListener('click', function(e) {
            if (e.target === missionDetailsModal) {
                closeMissionDetailsModal();
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
            const catalogSection = document.querySelector('.catalog-section');
            if (catalogSection) {
                catalogSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Initialize search functionality
    setTimeout(() => {
        addSearchFunctionality();
    }, 1000);
});

// Export functions for global access
window.showSection = showSection;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.openMissionDetailsModal = openMissionDetailsModal;
window.closeMissionDetailsModal = closeMissionDetailsModal;
window.formatDate = formatDate;

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modal
    if (e.key === 'Escape') {
        const projectModal = document.getElementById('project-modal');
        const missionModal = document.getElementById('mission-details-modal');
        
        if (projectModal && projectModal.classList.contains('active')) {
            closeProjectModal();
        }
        if (missionModal && missionModal.classList.contains('active')) {
            closeMissionDetailsModal();
        }
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
