/**
 * Rawapening Network Visualization - D3.js Force-Directed Graph
 * Implements interactive network diagram with filtering and details
 */

let svg, g, width, height, simulation;
let nodes, links, labels;
let zoom;

/**
 * Color scales for nodes based on tier
 */
const nodeColors = {
    national: '#b91c1c',
    provincial: '#2563eb',
    local: '#16a34a',
    community: '#ea580c',
    policy: '#6b7280'
};

/**
 * Color scales for edges based on type
 */
const edgeColors = {
    coordination: '#000000',
    conflict: '#ef4444',
    budget: '#16a34a',
    information: '#3b82f6',
    gap: '#9ca3af'
};

/**
 * Initialize the visualization
 */
function initializeVisualization(data) {
    console.log('Initializing D3 visualization...');

    // Get SVG element and dimensions
    svg = d3.select('#network');
    const container = document.querySelector('.visualization-container');
    width = container.clientWidth;
    height = container.clientHeight;

    svg.attr('width', width).attr('height', height);

    // Create main group for zooming/panning
    g = svg.append('g');

    // Setup zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Create arrow markers for directed edges
    createArrowMarkers();

    // Initialize force simulation
    initializeSimulation();

    // Draw initial network
    updateNetwork({
        nodes: data.nodes,
        edges: data.edges
    });

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        svg.attr('width', newWidth).attr('height', newHeight);
        width = newWidth;
        height = newHeight;

        if (simulation) {
            simulation.force('center', d3.forceCenter(width / 2, height / 2));
            simulation.alpha(0.3).restart();
        }
    }, 250));
}

/**
 * Create arrow markers for directed edges
 */
function createArrowMarkers() {
    const defs = svg.append('defs');

    Object.keys(edgeColors).forEach(type => {
        defs.append('marker')
            .attr('id', `arrow-${type}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', edgeColors[type]);
    });
}

/**
 * Initialize force simulation
 */
function initializeSimulation() {
    simulation = d3.forceSimulation()
        .force('link', d3.forceLink()
            .id(d => d.id)
            .distance(d => 150)
            .strength(0.3))
        .force('charge', d3.forceManyBody()
            .strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide()
            .radius(d => getNodeSize(d) + 10))
        .force('y', d3.forceY()
            .y(d => getTierY(d))
            .strength(0.3)); // Constrain Y-axis by power tier

    AppState.simulation = simulation;
}

/**
 * Get Y position based on power tier (stratification)
 */
function getTierY(node) {
    if (node.type === 'policy') {
        const level = node.level;
        if (level === 'presidential' || level === 'ministerial') return height * 0.2;
        if (level === 'provincial') return height * 0.5;
        if (level === 'district' || level === 'sectoral') return height * 0.7;
        return height * 0.5;
    }

    const powerLevel = node.powerLevel || 5;
    // Higher power = higher on screen (lower Y value)
    return height * (1 - powerLevel / 8);
}

/**
 * Get node size based on power level
 */
function getNodeSize(node) {
    if (node.type === 'policy') {
        const impactLength = (node.impact || '').length;
        return Math.max(12, Math.min(24, 12 + impactLength / 20));
    }

    const powerLevel = node.powerLevel || 3;
    return 8 + powerLevel * 4; // Size 12-36px based on power level 1-7
}

/**
 * Get node color
 */
function getNodeColor(node) {
    if (node.type === 'policy') {
        return nodeColors.policy;
    }
    return nodeColors[node.tier] || '#888888';
}

/**
 * Update network visualization with filtered data
 */
function updateNetwork(filteredData) {
    console.log('Updating network:', {
        nodes: filteredData.nodes.length,
        edges: filteredData.edges.length
    });

    // Remove existing elements
    g.selectAll('.link').remove();
    g.selectAll('.node-group').remove();

    // Create links
    links = g.selectAll('.link')
        .data(filteredData.edges)
        .enter()
        .append('path')
        .attr('class', d => `link link-${d.type}`)
        .attr('stroke', d => edgeColors[d.type])
        .attr('stroke-width', d => d.weight || 2)
        .attr('fill', 'none')
        .attr('marker-end', d => d.bidirectional ? '' : `url(#arrow-${d.type})`)
        .style('stroke-dasharray', d => {
            if (d.type === 'conflict') return '5,5';
            if (d.type === 'gap') return '2,2';
            return 'none';
        })
        .on('mouseover', handleEdgeMouseOver)
        .on('mouseout', handleEdgeMouseOut);

    // Create node groups
    const nodeGroups = g.selectAll('.node-group')
        .data(filteredData.nodes)
        .enter()
        .append('g')
        .attr('class', 'node-group')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

    // Add node shapes
    nodeGroups.each(function(d) {
        const group = d3.select(this);

        if (d.type === 'policy') {
            // Policy nodes as diamonds
            const size = getNodeSize(d);
            group.append('rect')
                .attr('class', 'node-policy')
                .attr('width', size)
                .attr('height', size)
                .attr('x', -size / 2)
                .attr('y', -size / 2)
                .attr('fill', getNodeColor(d))
                .attr('transform', 'rotate(45)');
        } else {
            // Actor nodes as circles
            group.append('circle')
                .attr('class', 'node-circle')
                .attr('r', getNodeSize(d))
                .attr('fill', getNodeColor(d));
        }
    });

    // Add node labels
    nodeGroups.append('text')
        .attr('class', 'node-label')
        .attr('dy', d => getNodeSize(d) + 14)
        .text(d => d.id)
        .style('font-size', '11px');

    // Add interaction handlers
    nodeGroups
        .on('click', handleNodeClick)
        .on('mouseover', handleNodeMouseOver)
        .on('mouseout', handleNodeMouseOut)
        .on('dblclick', handleNodeDoubleClick);

    // Store references
    nodes = nodeGroups;

    // Update simulation
    simulation.nodes(filteredData.nodes);
    simulation.force('link').links(filteredData.edges);
    simulation.alpha(1).restart();

    // Update positions on tick
    simulation.on('tick', () => {
        // Update link paths (curved)
        links.attr('d', d => {
            const sourceNode = d.source;
            const targetNode = d.target;

            if (!sourceNode || !targetNode) return '';

            // Calculate curve
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve radius

            return `M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`;
        });

        // Update node positions
        nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
}

/**
 * Handle node click - show details
 */
function handleNodeClick(event, d) {
    event.stopPropagation();

    // Deselect previous
    nodes.selectAll('.node-circle, .node-policy').classed('selected', false);

    // Select current
    d3.select(this).select('.node-circle, .node-policy').classed('selected', true);

    // Update state
    AppState.selectedNode = d;

    // Show details panel
    if (typeof showNodeDetails === 'function') {
        showNodeDetails(d);
    }
}

/**
 * Handle node double-click - highlight connected nodes
 */
function handleNodeDoubleClick(event, d) {
    event.stopPropagation();

    // Get connected nodes
    const connectedNodeIds = new Set();
    const connectedEdgeIds = new Set();

    AppState.data.edges.forEach(edge => {
        if (edge.source.id === d.id || edge.source === d.id) {
            connectedNodeIds.add(edge.target.id || edge.target);
            connectedEdgeIds.add(edge);
        }
        if (edge.target.id === d.id || edge.target === d.id) {
            connectedNodeIds.add(edge.source.id || edge.source);
            connectedEdgeIds.add(edge);
        }
    });

    // Dim non-connected nodes and edges
    nodes.selectAll('.node-circle, .node-policy')
        .classed('dimmed', node => {
            return node.id !== d.id && !connectedNodeIds.has(node.id);
        });

    nodes.selectAll('.node-label')
        .classed('dimmed', node => {
            return node.id !== d.id && !connectedNodeIds.has(node.id);
        });

    links.classed('dimmed', edge => !connectedEdgeIds.has(edge));
    links.classed('highlighted', edge => connectedEdgeIds.has(edge));
}

/**
 * Handle node mouse over
 */
function handleNodeMouseOver(event, d) {
    const tooltip = d3.select('#tooltip');
    const name = getNodeText(d, 'name');
    const org = d.organization ? getNodeText(d, 'organization') : '';

    let content = `<strong>${name}</strong>`;
    if (org && d.type !== 'policy') {
        content += `<br/><em>${org}</em>`;
    }
    if (d.type === 'actor') {
        content += `<br/>${getText('Power Level', 'Tingkat Kekuatan')}: ${d.powerLevel}`;
    }

    tooltip
        .html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px')
        .classed('visible', true);
}

/**
 * Handle node mouse out
 */
function handleNodeMouseOut() {
    d3.select('#tooltip').classed('visible', false);
}

/**
 * Handle edge mouse over
 */
function handleEdgeMouseOver(event, d) {
    const tooltip = d3.select('#tooltip');
    const description = AppState.currentLanguage === 'en' ?
                       d.description :
                       (d.descriptionID || d.description);

    tooltip
        .html(`<strong>${d.type}</strong><br/>${description}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px')
        .classed('visible', true);
}

/**
 * Handle edge mouse out
 */
function handleEdgeMouseOut() {
    d3.select('#tooltip').classed('visible', false);
}

/**
 * Drag handlers
 */
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

/**
 * Reset view to initial state
 */
function resetView() {
    // Reset zoom
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

    // Clear selections
    nodes.selectAll('.node-circle, .node-policy')
        .classed('selected', false)
        .classed('dimmed', false);

    nodes.selectAll('.node-label').classed('dimmed', false);

    links
        .classed('dimmed', false)
        .classed('highlighted', false);

    // Hide detail panel
    if (typeof hideNodeDetails === 'function') {
        hideNodeDetails();
    }

    // Reset simulation
    simulation.alpha(1).restart();
}

/**
 * Highlight nodes and edges for a specific paradox
 */
function highlightParadox(paradoxId) {
    if (!paradoxId) {
        // Clear all highlighting
        nodes.selectAll('.node-circle, .node-policy').classed('dimmed', false);
        nodes.selectAll('.node-label').classed('dimmed', false);
        links.classed('dimmed', false).classed('highlighted', false);
        return;
    }

    const paradox = getParadox(paradoxId);
    if (!paradox) return;

    const relevantNodeIds = new Set([...paradox.actors, ...paradox.policies]);
    const relevantEdges = AppState.data.edges.filter(e => e.paradox === paradoxId);

    // Dim non-relevant nodes
    nodes.selectAll('.node-circle, .node-policy')
        .classed('dimmed', d => !relevantNodeIds.has(d.id));

    nodes.selectAll('.node-label')
        .classed('dimmed', d => !relevantNodeIds.has(d.id));

    // Dim non-relevant edges, highlight relevant ones
    links
        .classed('dimmed', d => d.paradox !== paradoxId && !relevantEdges.includes(d))
        .classed('highlighted', d => d.paradox === paradoxId || relevantEdges.includes(d));
}

// Expose functions globally
window.initializeVisualization = initializeVisualization;
window.updateNetwork = updateNetwork;
window.resetView = resetView;
window.highlightParadox = highlightParadox;
