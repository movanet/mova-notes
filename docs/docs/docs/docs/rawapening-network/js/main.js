/**
 * Rawapening Network Visualization - Main Controller
 * Handles initialization, data loading, and global state management
 */

// Global state
const AppState = {
    data: null,
    currentLanguage: 'en',
    activeFilters: {
        edges: {
            coordination: true,
            conflict: true,
            budget: true,
            information: true,
            gap: true
        },
        nodes: {
            national: true,
            provincial: true,
            local: true,
            community: true,
            policy: true
        },
        themes: new Set(),
        paradox: null
    },
    selectedNode: null,
    simulation: null
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Rawapening Network Visualization...');

    try {
        // Load network data
        await loadNetworkData();

        // Initialize visualization
        if (typeof initializeVisualization === 'function') {
            initializeVisualization(AppState.data);
        }

        // Initialize UI controls
        if (typeof initializeControls === 'function') {
            initializeControls();
        }

        console.log('Visualization initialized successfully');
    } catch (error) {
        console.error('Error initializing visualization:', error);
        showError('Failed to initialize visualization. Please refresh the page.');
    }
});

/**
 * Load network data from JSON file
 */
async function loadNetworkData() {
    try {
        const response = await fetch('data/network-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        AppState.data = await response.json();
        console.log('Network data loaded:', {
            nodes: AppState.data.nodes.length,
            edges: AppState.data.edges.length,
            paradoxes: AppState.data.paradoxes.length
        });
        return AppState.data;
    } catch (error) {
        console.error('Error loading network data:', error);
        throw error;
    }
}

/**
 * Get filtered nodes based on current filter state
 */
function getFilteredNodes() {
    if (!AppState.data) return [];

    return AppState.data.nodes.filter(node => {
        // Filter by node type
        if (node.type === 'policy') {
            if (!AppState.activeFilters.nodes.policy) return false;
        } else {
            // Actor nodes - filter by tier
            if (!AppState.activeFilters.nodes[node.tier]) return false;
        }

        // Filter by theme (if any themes are selected)
        if (AppState.activeFilters.themes.size > 0) {
            if (!node.themes || node.themes.length === 0) return false;
            const hasMatchingTheme = node.themes.some(theme =>
                AppState.activeFilters.themes.has(theme)
            );
            if (!hasMatchingTheme) return false;
        }

        // Filter by paradox (if one is selected)
        if (AppState.activeFilters.paradox) {
            const paradox = AppState.data.paradoxes.find(
                p => p.id === AppState.activeFilters.paradox
            );
            if (paradox) {
                const isInParadox = paradox.actors.includes(node.id) ||
                                  paradox.policies.includes(node.id);
                if (!isInParadox) return false;
            }
        }

        return true;
    });
}

/**
 * Get filtered edges based on current filter state
 */
function getFilteredEdges() {
    if (!AppState.data) return [];

    const filteredNodes = getFilteredNodes();
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    return AppState.data.edges.filter(edge => {
        // Filter by edge type
        if (!AppState.activeFilters.edges[edge.type]) return false;

        // Only include edges where both source and target are visible
        if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) {
            return false;
        }

        // Filter by paradox (if one is selected)
        if (AppState.activeFilters.paradox && edge.paradox) {
            if (edge.paradox !== AppState.activeFilters.paradox) return false;
        } else if (AppState.activeFilters.paradox && !edge.paradox) {
            return false;
        }

        return true;
    });
}

/**
 * Update visualization based on current filters
 */
function updateVisualization() {
    if (typeof updateNetwork === 'function') {
        const filteredData = {
            nodes: getFilteredNodes(),
            edges: getFilteredEdges()
        };
        updateNetwork(filteredData);
    }
}

/**
 * Toggle language between English and Indonesian
 */
function toggleLanguage() {
    AppState.currentLanguage = AppState.currentLanguage === 'en' ? 'id' : 'en';
    document.body.classList.toggle('lang-id', AppState.currentLanguage === 'id');

    // Update all translatable elements
    updateTranslations();

    // Update detail panel if a node is selected
    if (AppState.selectedNode && typeof showNodeDetails === 'function') {
        showNodeDetails(AppState.selectedNode);
    }

    console.log('Language switched to:', AppState.currentLanguage);
}

/**
 * Update all translatable text elements
 */
function updateTranslations() {
    const lang = AppState.currentLanguage;

    // Update elements with data-en and data-id attributes
    document.querySelectorAll('[data-en]').forEach(element => {
        const key = lang === 'en' ? 'data-en' : 'data-id';
        if (element.hasAttribute(key)) {
            element.textContent = element.getAttribute(key);
        }
    });

    // Update placeholder attributes
    document.querySelectorAll('[data-en-placeholder]').forEach(element => {
        const key = lang === 'en' ? 'data-en-placeholder' : 'data-id-placeholder';
        if (element.hasAttribute(key)) {
            element.placeholder = element.getAttribute(key);
        }
    });

    // Update select options
    document.querySelectorAll('select option[data-en]').forEach(option => {
        const key = lang === 'en' ? 'data-en' : 'data-id';
        if (option.hasAttribute(key)) {
            option.textContent = option.getAttribute(key);
        }
    });
}

/**
 * Get text in current language
 */
function getText(enText, idText) {
    return AppState.currentLanguage === 'en' ? enText : idText;
}

/**
 * Get node property in current language
 */
function getNodeText(node, property) {
    const idProperty = property + 'ID';
    return AppState.currentLanguage === 'en' ?
           node[property] :
           (node[idProperty] || node[property]);
}

/**
 * Search nodes by name or code
 */
function searchNodes(query) {
    if (!AppState.data || !query) return [];

    const lowerQuery = query.toLowerCase();

    return AppState.data.nodes.filter(node => {
        const name = getNodeText(node, 'name').toLowerCase();
        const id = node.id.toLowerCase();
        const org = node.organization ? getNodeText(node, 'organization').toLowerCase() : '';

        return name.includes(lowerQuery) ||
               id.includes(lowerQuery) ||
               org.includes(lowerQuery);
    }).slice(0, 10); // Limit to 10 results
}

/**
 * Get paradox by ID
 */
function getParadox(paradoxId) {
    if (!AppState.data || !paradoxId) return null;
    return AppState.data.paradoxes.find(p => p.id === paradoxId);
}

/**
 * Get theme information
 */
function getThemeInfo(themeCode) {
    if (!AppState.data || !themeCode) return null;
    return AppState.data.themes[themeCode];
}

/**
 * Show error message to user
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #ef4444;
        color: white;
        padding: 20px 40px;
        border-radius: 8px;
        font-size: 16px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Export filtered data as JSON
 */
function exportData() {
    const filteredData = {
        nodes: getFilteredNodes(),
        edges: getFilteredEdges(),
        filters: AppState.activeFilters,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rawapening-network-filtered-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

// Expose global functions and state
window.AppState = AppState;
window.toggleLanguage = toggleLanguage;
window.updateVisualization = updateVisualization;
window.searchNodes = searchNodes;
window.getFilteredNodes = getFilteredNodes;
window.getFilteredEdges = getFilteredEdges;
window.getParadox = getParadox;
window.getThemeInfo = getThemeInfo;
window.getText = getText;
window.getNodeText = getNodeText;
window.exportData = exportData;
window.debounce = debounce;
