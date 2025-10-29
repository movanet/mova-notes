/**
 * Rawapening Network Visualization - UI Controls
 * Handles filters, search, language toggle, and detail panel
 */

/**
 * Initialize all UI controls
 */
function initializeControls() {
    console.log('Initializing UI controls...');

    // Language toggle
    document.getElementById('languageToggle').addEventListener('click', toggleLanguage);

    // Reset view button
    document.getElementById('resetView').addEventListener('click', resetView);

    // Edge type filters
    document.querySelectorAll('.edge-filter').forEach(checkbox => {
        checkbox.addEventListener('change', handleEdgeFilterChange);
    });

    // Node type filters
    document.querySelectorAll('.node-filter').forEach(checkbox => {
        checkbox.addEventListener('change', handleNodeFilterChange);
    });

    // Theme filter buttons
    document.querySelectorAll('.theme-btn').forEach(button => {
        button.addEventListener('click', handleThemeFilterClick);
    });

    // Paradox selection
    document.getElementById('paradoxSelect').addEventListener('change', handleParadoxChange);

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearchInput, 300));

    // Detail panel close button
    document.getElementById('closeDetail').addEventListener('click', hideNodeDetails);

    // Click outside to deselect
    document.querySelector('.visualization-container').addEventListener('click', () => {
        if (AppState.selectedNode) {
            hideNodeDetails();
        }
    });

    console.log('UI controls initialized');
}

/**
 * Handle edge filter change
 */
function handleEdgeFilterChange(event) {
    const type = event.target.dataset.type;
    AppState.activeFilters.edges[type] = event.target.checked;
    updateVisualization();
}

/**
 * Handle node filter change
 */
function handleNodeFilterChange(event) {
    const filterType = event.target.dataset.tier || event.target.dataset.type;
    if (filterType === 'policy') {
        AppState.activeFilters.nodes.policy = event.target.checked;
    } else {
        AppState.activeFilters.nodes[filterType] = event.target.checked;
    }
    updateVisualization();
}

/**
 * Handle theme filter button click
 */
function handleThemeFilterClick(event) {
    const theme = event.target.dataset.theme;
    const button = event.target;

    if (AppState.activeFilters.themes.has(theme)) {
        AppState.activeFilters.themes.delete(theme);
        button.classList.remove('active');
    } else {
        AppState.activeFilters.themes.add(theme);
        button.classList.add('active');
    }

    updateVisualization();
}

/**
 * Handle paradox selection change
 */
function handleParadoxChange(event) {
    const paradoxId = event.target.value || null;
    AppState.activeFilters.paradox = paradoxId;

    // Show/hide paradox description
    const descriptionDiv = document.getElementById('paradoxDescription');

    if (paradoxId) {
        const paradox = getParadox(paradoxId);
        if (paradox) {
            const description = AppState.currentLanguage === 'en' ?
                              paradox.description :
                              (paradox.descriptionID || paradox.description);

            descriptionDiv.innerHTML = `
                <strong>${getNodeText(paradox, 'name')}</strong>
                <p>${description}</p>
            `;
            descriptionDiv.classList.add('visible');
        }
    } else {
        descriptionDiv.classList.remove('visible');
    }

    // Highlight paradox in visualization
    if (typeof highlightParadox === 'function') {
        highlightParadox(paradoxId);
    }

    // Update visualization with filter
    updateVisualization();
}

/**
 * Handle search input
 */
function handleSearchInput(event) {
    const query = event.target.value.trim();
    const resultsDiv = document.getElementById('searchResults');

    if (!query) {
        resultsDiv.innerHTML = '';
        return;
    }

    const results = searchNodes(query);

    if (results.length === 0) {
        resultsDiv.innerHTML = `<div class="search-result-item">${getText('No results found', 'Tidak ada hasil')}</div>`;
        return;
    }

    resultsDiv.innerHTML = results.map(node => {
        const name = getNodeText(node, 'name');
        const org = node.organization ? getNodeText(node, 'organization') : '';
        return `
            <div class="search-result-item" data-node-id="${node.id}">
                <strong>${node.id}</strong>: ${name}
                ${org ? `<br/><small>${org}</small>` : ''}
            </div>
        `;
    }).join('');

    // Add click handlers to search results
    resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const nodeId = item.dataset.nodeId;
            const node = AppState.data.nodes.find(n => n.id === nodeId);
            if (node) {
                focusOnNode(node);
                showNodeDetails(node);
            }
        });
    });
}

/**
 * Focus on a specific node in the visualization
 */
function focusOnNode(node) {
    if (!node.x || !node.y) return;

    const svg = d3.select('#network');
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    // Calculate transform to center the node
    const scale = 1.5;
    const x = width / 2 - node.x * scale;
    const y = height / 2 - node.y * scale;

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));

    // Highlight the node
    d3.selectAll('.node-circle, .node-policy').classed('selected', false);
    d3.selectAll('.node-group')
        .filter(d => d.id === node.id)
        .select('.node-circle, .node-policy')
        .classed('selected', true);

    AppState.selectedNode = node;
}

/**
 * Show node details in right sidebar
 */
function showNodeDetails(node) {
    const detailPanel = document.getElementById('detailPanel');
    const detailContent = document.getElementById('detailContent');
    const detailTitle = document.getElementById('detailTitle');
    const detailBody = document.getElementById('detailBody');

    // Hide placeholder, show content
    detailPanel.querySelector('.detail-panel-placeholder').style.display = 'none';
    detailContent.style.display = 'block';

    // Set title
    detailTitle.textContent = getNodeText(node, 'name');

    // Build detail body
    let html = '';

    if (node.type === 'actor') {
        // Actor details
        html += '<div class="detail-section">';
        html += `<div class="detail-item">`;
        html += `<span class="detail-label">${getText('Code', 'Kode')}</span>`;
        html += `<span class="detail-value">${node.id}</span>`;
        html += `</div>`;

        if (node.organization) {
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">${getText('Organization', 'Organisasi')}</span>`;
            html += `<span class="detail-value">${getNodeText(node, 'organization')}</span>`;
            html += `</div>`;
        }

        html += `<div class="detail-item">`;
        html += `<span class="detail-label">${getText('Role', 'Peran')}</span>`;
        html += `<span class="detail-value">${getNodeText(node, 'role')}</span>`;
        html += `</div>`;

        html += `<div class="detail-item">`;
        html += `<span class="detail-label">${getText('Power Level', 'Tingkat Kekuatan')}</span>`;
        html += `<span class="detail-value">${node.powerLevel} / 7 (${node.tier})</span>`;
        html += `</div>`;

        if (node.themes && node.themes.length > 0) {
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">${getText('Themes', 'Tema')}</span>`;
            html += `<div class="theme-tags">`;
            node.themes.forEach(theme => {
                const themeInfo = getThemeInfo(theme);
                const themeName = themeInfo ? (AppState.currentLanguage === 'en' ? themeInfo.name : themeInfo.nameID) : theme;
                html += `<span class="theme-tag" title="${themeName}">${theme}</span>`;
            });
            html += `</div>`;
            html += `</div>`;
        }

        html += '</div>';

        // Key quotes
        if (node.keyQuotes && node.keyQuotes.length > 0) {
            html += '<div class="detail-section">';
            html += `<div class="detail-section-title">${getText('Key Quotes', 'Kutipan Kunci')}</div>`;
            node.keyQuotes.forEach(quote => {
                html += '<div class="quote-box">';
                html += `<div class="quote-id">${quote.id}</div>`;
                html += `<div class="quote-text">"${AppState.currentLanguage === 'en' ? quote.text : quote.textID}"</div>`;
                if (AppState.currentLanguage === 'en' && quote.textID) {
                    html += `<div class="quote-translation"><em>${getText('Indonesian', 'Bahasa Indonesia')}:</em> "${quote.textID}"</div>`;
                } else if (AppState.currentLanguage === 'id' && quote.text !== quote.textID) {
                    html += `<div class="quote-translation"><em>English:</em> "${quote.text}"</div>`;
                }
                html += '</div>';
            });
            html += '</div>';
        }

        if (node.quoteCount) {
            html += '<div class="detail-section">';
            html += `<p><em>${getText('Total quotes in database', 'Total kutipan dalam database')}: ${node.quoteCount}</em></p>`;
            html += '</div>';
        }
    } else {
        // Policy details
        html += '<div class="detail-section">';

        html += `<div class="detail-item">`;
        html += `<span class="detail-label">${getText('Code', 'Kode')}</span>`;
        html += `<span class="detail-value">${node.id}</span>`;
        html += `</div>`;

        if (node.fullTitle) {
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">${getText('Full Title', 'Judul Lengkap')}</span>`;
            html += `<span class="detail-value">${getNodeText(node, 'fullTitle')}</span>`;
            html += `</div>`;
        }

        html += `<div class="detail-item">`;
        html += `<span class="detail-label">${getText('Level', 'Tingkat')}</span>`;
        html += `<span class="detail-value">${node.level}</span>`;
        html += `</div>`;

        if (node.year) {
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">${getText('Year', 'Tahun')}</span>`;
            html += `<span class="detail-value">${node.year}</span>`;
            html += `</div>`;
        }

        html += `<div class="detail-item">`;
        html += `<span class="detail-label">${getText('Impact', 'Dampak')}</span>`;
        html += `<span class="detail-value">${getNodeText(node, 'impact')}</span>`;
        html += `</div>`;

        if (node.implementing && node.implementing.length > 0) {
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">${getText('Implementing Agencies', 'Lembaga Pelaksana')}</span>`;
            html += `<span class="detail-value">${node.implementing.join(', ')}</span>`;
            html += `</div>`;
        }

        if (node.themes && node.themes.length > 0) {
            html += `<div class="detail-item">`;
            html += `<span class="detail-label">${getText('Related Themes', 'Tema Terkait')}</span>`;
            html += `<div class="theme-tags">`;
            node.themes.forEach(theme => {
                html += `<span class="theme-tag">${theme}</span>`;
            });
            html += `</div>`;
            html += `</div>`;
        }

        html += '</div>';
    }

    // Connected relationships
    const connections = getNodeConnections(node);
    if (connections.length > 0) {
        html += '<div class="detail-section">';
        html += `<div class="detail-section-title">${getText('Relationships', 'Hubungan')} (${connections.length})</div>`;
        connections.forEach(conn => {
            const otherNode = conn.node;
            const edge = conn.edge;
            const direction = conn.direction;

            html += '<div class="detail-item" style="margin-bottom: 12px;">';
            html += `<strong style="color: ${edgeColors[edge.type]}">${edge.type.toUpperCase()}</strong> `;
            html += `${direction === 'source' ? '→' : '←'} `;
            html += `<strong>${getNodeText(otherNode, 'name')}</strong>`;
            html += `<br/><small>${AppState.currentLanguage === 'en' ? edge.description : (edge.descriptionID || edge.description)}</small>`;
            html += '</div>';
        });
        html += '</div>';
    }

    detailBody.innerHTML = html;

    // Make panel visible on mobile
    detailPanel.classList.add('visible');
}

/**
 * Hide node details panel
 */
function hideNodeDetails() {
    const detailPanel = document.getElementById('detailPanel');
    const detailContent = document.getElementById('detailContent');

    detailPanel.querySelector('.detail-panel-placeholder').style.display = 'block';
    detailContent.style.display = 'none';
    detailPanel.classList.remove('visible');

    AppState.selectedNode = null;

    // Clear node selection
    d3.selectAll('.node-circle, .node-policy').classed('selected', false);
}

/**
 * Get connections for a node
 */
function getNodeConnections(node) {
    const connections = [];

    AppState.data.edges.forEach(edge => {
        const sourceId = edge.source.id || edge.source;
        const targetId = edge.target.id || edge.target;

        if (sourceId === node.id) {
            const targetNode = AppState.data.nodes.find(n => n.id === targetId);
            if (targetNode) {
                connections.push({
                    node: targetNode,
                    edge: edge,
                    direction: 'source'
                });
            }
        } else if (targetId === node.id) {
            const sourceNode = AppState.data.nodes.find(n => n.id === sourceId);
            if (sourceNode) {
                connections.push({
                    node: sourceNode,
                    edge: edge,
                    direction: 'target'
                });
            }
        }
    });

    return connections;
}

// Expose functions globally
window.initializeControls = initializeControls;
window.showNodeDetails = showNodeDetails;
window.hideNodeDetails = hideNodeDetails;
window.focusOnNode = focusOnNode;
