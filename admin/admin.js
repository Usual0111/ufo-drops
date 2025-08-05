// Admin Panel Manager
class AdminManager {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentSort = { field: null, direction: 'asc' };
        this.editingProjectId = null;
        this.confirmCallback = null;
        
        // DOM Elements
        this.projectsTable = document.getElementById('projects-table');
        this.projectsTbody = document.getElementById('projects-tbody');
        this.searchInput = document.getElementById('search-input');
        this.categoryFilter = document.getElementById('category-filter');
        this.statusFilter = document.getElementById('status-filter');
        this.emptyState = document.getElementById('empty-state');
        this.projectModal = document.getElementById('project-modal');
        this.projectForm = document.getElementById('project-form');
        this.confirmModal = document.getElementById('confirm-modal');
        this.notification = document.getElementById('notification');
        
        // Stats elements
        this.totalProjects = document.getElementById('total-projects');
        this.activeProjects = document.getElementById('active-projects');
        this.upcomingProjects = document.getElementById('upcoming-projects');
        this.closedProjects = document.getElementById('closed-projects');
        
    }
    
    async init() {
    await this.loadProjects();
    this.bindEvents();
    this.renderProjects();
    this.updateStats();
}
    
    bindEvents() {
        // Search and filters
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.categoryFilter.addEventListener('change', () => this.handleFilter());
        this.statusFilter.addEventListener('change', () => this.handleFilter());
        
        // Control buttons
        document.getElementById('add-project-btn').addEventListener('click', () => this.openAddProjectModal());
        document.getElementById('export-btn').addEventListener('click', () => this.exportProjects());
        document.getElementById('import-btn').addEventListener('click', () => this.importProjects());
        document.getElementById('import-file').addEventListener('change', (e) => this.handleFileImport(e));
        
        // Modal events
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.closeModal());
        this.projectForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Confirm modal events
        document.getElementById('confirm-cancel').addEventListener('click', () => this.closeConfirmModal());
        document.getElementById('confirm-ok').addEventListener('click', () => this.executeConfirmAction());
        
        // Close modals on outside click
        this.projectModal.addEventListener('click', (e) => {
            if (e.target === this.projectModal) this.closeModal();
        });
        this.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Table sorting
        this.bindSortingEvents();
    }
    
    bindSortingEvents() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                this.handleSort(field);
            });
        });
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N - Add new project
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openAddProjectModal();
        }
        
        // Ctrl/Cmd + E - Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            this.exportProjects();
        }
        
        // Escape - Close modals
        if (e.key === 'Escape') {
            this.closeModal();
            this.closeConfirmModal();
        }
        
        // Ctrl/Cmd + F - Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.searchInput.focus();
        }
    }
    
    async loadProjects() {
    try {
        const querySnapshot = await db.collection('projects').get();
        this.projects = [];
        querySnapshot.forEach((doc) => {
            console.log("Loaded projects:", this.projects);
            console.log("Projects count:", this.projects.length);
            const projectData = doc.data();
            if (projectData.endDate && typeof projectData.endDate.toDate === 'function') {
                projectData.endDate = projectData.endDate.toDate().toISOString().split('T')[0];
            }
            this.projects.push({ id: doc.id, ...projectData });
        });
        console.log("Projects loaded from Firestore:", this.projects);
        this.filteredProjects = [...this.projects];
    } catch (error) {
        console.error("Error loading projects from Firestore:", error);
        this.showNotification("Failed to load projects.", 'error');
        // Fallback to default projects
        this.projects = this.getDefaultProjects();
        this.filteredProjects = [...this.projects];
    }
}
    
async saveProjects() {
    try {
        // Save each project to Firestore
        const batch = db.batch();
        this.projects.forEach(project => {
            const projectRef = db.collection('projects').doc(project.id);
            const { id, ...projectData } = project;
            batch.set(projectRef, projectData, { merge: true });
        });
        await batch.commit();
        console.log("Projects saved to Firestore");
        this.showNotification("Projects saved successfully!", 'success');
    } catch (error) {
        console.error("Error saving projects to Firestore:", error);
        this.showNotification("Failed to save projects.", 'error');
    }
}
    
    getDefaultProjects() {
        return [
            {
                id: this.generateId(),
                name: 'Bless Network',
                logo: '🌐',
                category: 'depin',
                status: 'open',
                tags: ['DePIN', 'Free', 'Mobile', 'No KYC'],
                description: 'Decentralized infrastructure network. Earn tokens by sharing your internet connection.',
                potentialReward: '$50-100',
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
                id: this.generateId(),
                name: 'NodePay',
                logo: '💰',
                category: 'depin',
                status: 'open',
                tags: ['DePIN', 'Passive', 'Chrome Extension'],
                description: 'Monetize your unused internet bandwidth with NodePay extension.',
                potentialReward: '$30-80',
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
                id: this.generateId(),
                name: 'Friend.tech',
                logo: '👥',
                category: 'social',
                status: 'upcoming',
                tags: ['SocialFi', 'Mobile', 'Invite Only'],
                description: 'Social platform where you can buy and sell shares of people.',
                potentialReward: '$100-500',
                website: 'https://friend.tech',
                steps: [
                    'Get invite code',
                    'Download mobile app',
                    'Connect Twitter account',
                    'Buy/sell shares',
                    'Participate in events'
                ]
            }
        ];
    }
    
generateId() {
    return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
    
    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        this.applyFilters(searchTerm);
    }
    
    handleFilter() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        this.applyFilters(searchTerm);
    }
    
    applyFilters(searchTerm = '') {
        const categoryFilter = this.categoryFilter.value;
        const statusFilter = this.statusFilter.value;
        
        this.filteredProjects = this.projects.filter(project => {
            // Search filter
            const matchesSearch = !searchTerm || 
                project.name.toLowerCase().includes(searchTerm) ||
                project.description.toLowerCase().includes(searchTerm) ||
                project.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            
            // Category filter
            const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
            
            // Status filter
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        this.renderProjects();
        this.updateStats();
    }
    
    handleSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        this.filteredProjects.sort((a, b) => {
            let aValue = a[field] || '';
            let bValue = b[field] || '';
            
            // Handle different data types
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            let result = 0;
            if (aValue < bValue) result = -1;
            if (aValue > bValue) result = 1;
            
            return this.currentSort.direction === 'desc' ? -result : result;
        });
        
        this.updateSortIcons();
        this.renderProjects();
    }
    
    updateSortIcons() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            const icon = header.querySelector('.sort-icon');
            const field = header.getAttribute('data-sort');
            
            if (field === this.currentSort.field) {
                icon.textContent = this.currentSort.direction === 'asc' ? '↑' : '↓';
                icon.style.opacity = '1';
            } else {
                icon.textContent = '↕️';
                icon.style.opacity = '0.5';
            }
        });
    }
    
    renderProjects() {
        console.log("Rendering projects:", this.filteredProjects.length);
        if (this.filteredProjects.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        const tbody = this.projectsTbody;
        tbody.innerHTML = '';
        
        this.filteredProjects.forEach(project => {
            const row = this.createProjectRow(project);
            tbody.appendChild(row);
        });
    }
    
    createProjectRow(project) {
        const row = document.createElement('tr');
row.innerHTML = `
    <td>
        <strong>${this.escapeHtml(project.name)}</strong>
        <br>
        <small style="color: rgba(255,255,255,0.6);">${this.escapeHtml(project.description.substring(0, 50))}...</small>
    </td>
    <td class="project-logo">${project.logo}</td>
    <td>
        <span class="project-tag">${this.getCategoryName(project.category)}</span>
    </td>
    <td>
        <span class="project-status status-${project.status}">${this.getStatusName(project.status)}</span>
    </td>
    <td>
        <div class="project-tags">
            ${project.tags.map(tag => '<span class="project-tag">' + this.escapeHtml(tag) + '</span>').join('')}
        </div>
    </td>
    <td>${this.escapeHtml(project.potentialReward || 'TBA')}</td>
    <td>
        <div class="table-actions">
            <button class="action-btn edit-btn" onclick="adminManager.editProject('${project.id}')" title="Edit">
                ✏️
            </button>
            <button class="action-btn delete-btn" onclick="adminManager.deleteProject('${project.id}')" title="Delete">
                🗑️
            </button>
            <button class="action-btn toggle-btn" onclick="adminManager.toggleProjectStatus('${project.id}')" title="Toggle Status">
                🔄
            </button>
        </div>
    </td>
`;
        
        return row;
    }
    
    getCategoryName(category) {
        const names = {
            'depin': 'DePIN',
            'social': 'SocialFi',
            'gamefi': 'GameFi',
            'testnet': 'Testnet'
        };
        return names[category] || category;
    }
    
    getStatusName(status) {
        const names = {
            'open': 'Open',
            'upcoming': 'Upcoming',
            'closed': 'Closed'
        };
        return names[status] || status;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showEmptyState() {
        this.projectsTable.classList.add('hidden');
        this.emptyState.classList.remove('hidden');
    }
    
    hideEmptyState() {
        this.projectsTable.classList.remove('hidden');
        this.emptyState.classList.add('hidden');
    }
    
    updateStats() {
        const total = this.projects.length;
        const active = this.projects.filter(p => p.status === 'open').length;
        const upcoming = this.projects.filter(p => p.status === 'upcoming').length;
        const closed = this.projects.filter(p => p.status === 'closed').length;
        
        this.totalProjects.textContent = total;
        this.activeProjects.textContent = active;
        this.upcomingProjects.textContent = upcoming;
        this.closedProjects.textContent = closed;
    }
    
    // Modal Management
    openAddProjectModal() {
        this.editingProjectId = null;
        this.resetForm();
        document.getElementById('modal-title').textContent = 'Add New Project';
        document.getElementById('save-text').textContent = 'Save Project';
        document.getElementById('save-icon').textContent = '💾';
        this.showModal();
    }
    
    editProject(projectId) {
        const project = this.projects.find(p => p.id == projectId);
        if (!project) return;
        
        this.editingProjectId = projectId;
        this.populateForm(project);
        document.getElementById('modal-title').textContent = 'Edit Project';
        document.getElementById('save-text').textContent = 'Update Project';
        document.getElementById('save-icon').textContent = '✅';
        this.showModal();
    }
    
    deleteProject(projectId) {
const project = this.projects.find(p => p.id == projectId);
if (!project) return;

this.showConfirmModal(
    'Delete Project',
    `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
    async () => {
        try {
            await db.collection('projects').doc(projectId).delete();
            this.projects = this.projects.filter(p => p.id != projectId);
            this.applyFilters();
            this.showNotification('Project deleted successfully!', 'success');
        } catch (error) {
            console.error("Error deleting project:", error);
            this.showNotification('Failed to delete project!', 'error');
        }
    }
);
    
    toggleProjectStatus(projectId) {
        const project = this.projects.find(p => p.id == projectId);
        if (!project) return;
        
        const statusOrder = ['open', 'upcoming', 'closed'];
        const currentIndex = statusOrder.indexOf(project.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        
        project.status = statusOrder[nextIndex];
        this.saveProjects();
        this.applyFilters();
        this.showNotification(`Status changed to ${this.getStatusName(project.status)}`, 'info');
    }
    
    showModal() {
        this.projectModal.classList.add('active');
        this.projectModal.style.display = 'flex';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.projectForm.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    closeModal() {
        this.projectModal.classList.remove('active');
        this.projectModal.style.display = 'none';
        this.resetForm();
        this.editingProjectId = null;
    }
    
    showConfirmModal(title, message, callback) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        this.confirmCallback = callback;
        this.confirmModal.classList.add('active');
        this.confirmModal.style.display = 'flex';
    }
    
    closeConfirmModal() {
        this.confirmModal.classList.remove('active');
        this.confirmModal.style.display = 'none';
        this.confirmCallback = null;
    }
    
    executeConfirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
            this.confirmCallback = null;
        }
        this.closeConfirmModal();
    }
    
    resetForm() {
        this.projectForm.reset();
    }
    
    populateForm(project) {
        document.getElementById('project-name').value = project.name || '';
        document.getElementById('project-logo').value = project.logo || '';
        document.getElementById('project-category').value = project.category || '';
        document.getElementById('project-status').value = project.status || '';
        document.getElementById('project-tags').value = Array.isArray(project.tags) ? project.tags.join(', ') : '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-reward').value = project.potentialReward || '';
        document.getElementById('project-website').value = project.website || '';
        document.getElementById('project-steps').value = Array.isArray(project.steps) ? project.steps.join('\n') : '';
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.projectForm);
        const projectData = {
            name: formData.get('name').trim(),
            logo: formData.get('logo').trim() || '🚀',
            category: formData.get('category'),
            status: formData.get('status'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            description: formData.get('description').trim(),
            potentialReward: formData.get('potentialReward').trim(),
            website: formData.get('website').trim(),
            steps: formData.get('steps').split('\n').map(step => step.trim()).filter(step => step)
        };
        
        // Validation
        if (!projectData.name || !projectData.category || !projectData.status || !projectData.description) {
            this.showNotification('Please fill in all required fields!', 'error');
            return;
        }
        
        if (this.editingProjectId) {
            // Update existing project
            const projectIndex = this.projects.findIndex(p => p.id == this.editingProjectId);
            if (projectIndex !== -1) {
                this.projects[projectIndex] = { ...this.projects[projectIndex], ...projectData };
                this.showNotification('Project updated successfully!', 'success');
            }
        } else {
            // Add new project
            const newProject = {
                id: this.generateId(),
                ...projectData
            };
            this.projects.push(newProject);
            this.showNotification('Project added successfully!', 'success');
        }
        
        this.saveProjects();
        await this.saveProjects();
        this.applyFilters();
        this.closeModal();
    }
    
    // Import/Export functionality
    exportProjects() {
        try {
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                projects: this.projects
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ufo-drops-projects-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Projects exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting projects!', 'error');
        }
    }
    
    importProjects() {
        document.getElementById('import-file').click();
    }
    
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.projects || !Array.isArray(importData.projects)) {
                    throw new Error('Invalid file format');
                }
                
                this.showConfirmModal(
                    'Import Projects',
                    `This will replace ${this.projects.length} existing projects with ${importData.projects.length} imported projects. Continue?`,
                    () => {
                        // Assign new IDs to imported projects
                        this.projects = importData.projects.map(project => ({
                            ...project,
                            id: this.generateId()
                        }));
                        
                        this.saveProjects();
                        this.applyFilters();
                        this.showNotification(`Successfully imported ${this.projects.length} projects!`, 'success');
                    }
                );
                
            } catch (error) {
                console.error('Import error:', error);
                this.showNotification('Error importing file! Please check the format.', 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }
    
    // Notification system
    showNotification(message, type = 'info') {
        const notification = this.notification;
        const icon = document.getElementById('notification-icon');
        const text = document.getElementById('notification-text');
        
        // Set icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        icon.textContent = icons[type] || icons.info;
        text.textContent = message;
        
        // Remove existing type classes
        notification.className = `notification ${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
    
    // Bulk operations
    selectAllProjects() {
        // Future implementation for bulk operations
        console.log('Select all projects');
    }
    
    bulkDelete() {
        // Future implementation for bulk delete
        console.log('Bulk delete');
    }
    
    bulkStatusChange(newStatus) {
        // Future implementation for bulk status change
        console.log('Bulk status change to:', newStatus);
    }
    
    // Backup and restore
    createBackup() {
        const backup = {
            projects: this.projects,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        localStorage.setItem('ufoDropsBackup_' + Date.now(), JSON.stringify(backup));
        this.showNotification('Backup created successfully!', 'success');
    }
    
    restoreFromBackup(backupKey) {
        const backup = localStorage.getItem(backupKey);
        if (backup) {
            try {
                const backupData = JSON.parse(backup);
                this.projects = backupData.projects;
                this.saveProjects();
                this.applyFilters();
                this.showNotification('Backup restored successfully!', 'success');
            } catch (error) {
                this.showNotification('Error restoring backup!', 'error');
            }
        }
    }
}

// Global functions for onclick handlers
window.openAddProjectModal = function() {
    if (window.adminManager) {
        window.adminManager.openAddProjectModal();
    }
};

// Global notification function for auth.js
window.showNotification = function(message, type = 'info') {
    if (window.adminManager) {
        window.adminManager.showNotification(message, type);
    }
};

// Initialize admin manager when DOM is loaded
let adminManager;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(async () => {
        if (window.authManager && window.authManager.isAuthenticated()) {
            adminManager = new AdminManager();
            window.adminManager = adminManager;
            await adminManager.init();
        }
    }, 100);
});

// Handle authentication state changes
window.addEventListener('storage', function(e) {
    if (e.key === 'ufoDropsAdminAuth') {
        if (!e.newValue && adminManager) {
            // User logged out in another tab
            location.reload();
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminManager;
}
