document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tagId = params.get('id');

    if (!tagId) {
        showView('invalid');
        logAttempt(null, 'missing_id');
        return;
    }

    validateId(tagId);
    initCursor();

    // Setup Report Button
    const reportBtn = document.querySelector('.action-btn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            alert('Thank you for your report. We have logged this incident.');
            logAttempt(tagId, 'reported_by_user');
            reportBtn.textContent = 'Report Submitted';
            reportBtn.disabled = true;
            reportBtn.style.opacity = '0.5';
            reportBtn.style.cursor = 'not-allowed';
        });
    }
});

async function validateId(id) {
    try {
        const response = await fetch('data/ids.json');
        if (!response.ok) throw new Error('Failed to load ID list');

        const validIds = await response.json();

        // Simulating network delay for effect
        setTimeout(() => {
            if (validIds.includes(id)) {
                showView('authentic');
                logAttempt(id, 'success');
                hydrateProductDetails(id);
            } else {
                showView('invalid');
                logAttempt(id, 'failed');
            }
        }, 1500);

    } catch (error) {
        console.error('Validation error:', error);
        showView('error');
    }
}

// State management for views
let currentView = null;
let viewTimeouts = {};

function showView(viewName) {
    const targetId = `view-${viewName}`;
    console.log(`[View Manager] Switching to: ${viewName}`);

    // clear all pending timeouts to prevent unwanted hiding
    Object.keys(viewTimeouts).forEach(key => {
        clearTimeout(viewTimeouts[key]);
        delete viewTimeouts[key];
    });

    document.querySelectorAll('.view-layer').forEach(el => {
        const isTarget = el.id === targetId;

        if (isTarget) {
            el.style.display = 'flex';
            // forced reflow
            void el.offsetWidth;
            el.classList.add('active');
            el.style.opacity = '1';
            currentView = viewName;
        } else {
            // Check if element is currently visible (using computed style OR has active class)
            const computedOpacity = window.getComputedStyle(el).opacity;
            const isVisible = el.classList.contains('active') || parseFloat(computedOpacity) > 0;

            if (isVisible) {
                el.classList.remove('active');
                el.style.opacity = '0';

                // Allow transition to finish before hiding
                viewTimeouts[el.id] = setTimeout(() => {
                    el.style.display = 'none';
                    if (viewTimeouts[el.id]) delete viewTimeouts[el.id];
                }, 500);
            } else {
                // Already hidden, ensure it stays hidden
                el.style.display = 'none';
                el.classList.remove('active');
                el.style.opacity = '0';
            }
        }
    });
}

function logAttempt(id, status) {
    console.log(`[Security Log] ID: ${id}, Status: ${status}, Timestamp: ${new Date().toISOString()}`);
    // In a real app, this would be a POST request to a backend/analytics service
    // await fetch('https://api.example.com/log', { method: 'POST', body: JSON.stringify({ id, status }) });
}

function hydrateProductDetails(id) {
    // Dynamic content based on ID could go here
    const dateEl = document.getElementById('mfg-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString();
}

function initBackgroundPattern() {
    // Create pattern container
    const patternContainer = document.createElement('div');
    patternContainer.id = 'bg-pattern';
    document.body.prepend(patternContainer);

    // SVG Pattern (WhatsApp style plant doodles)
    const svgPattern = `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" opacity="0.4">
    <g fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <!-- Leaf 1 -->
        <path d="M50 50 Q70 20 90 50 T130 50" opacity="0.5"/>
        <path d="M70 50 V80" opacity="0.5"/>
        
        <!-- Flower -->
        <circle cx="200" cy="100" r="10" opacity="0.5"/>
        <path d="M200 90 V70 M200 110 V130 M190 100 H170 M210 100 H230" opacity="0.5"/>
        
        <!-- Vine -->
        <path d="M300 300 Q320 250 350 300 T400 300" opacity="0.5"/>
        
        <!-- Small Leaf -->
        <path d="M100 300 Q110 280 120 300 T140 300" opacity="0.5"/>
        
        <!-- Abstract Shapes -->
        <circle cx="350" cy="50" r="5" fill="#4CAF50" opacity="0.3" stroke="none"/>
        <circle cx="50" cy="350" r="8" fill="#4CAF50" opacity="0.3" stroke="none"/>
        <path d="M250 250 L270 270 M250 270 L270 250" opacity="0.4"/>
    </g>
</svg>
    `;

    // Convert SVG to Data URL
    const svgUrl = `data:image/svg+xml;base64,${btoa(svgPattern)}`;
    patternContainer.style.backgroundImage = `url('${svgUrl}')`;

    // Parallax Effect
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.05; // Movement factor
        mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    // Smooth animation loop
    function animate() {
        // Linear interpolation for smooth movement
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;

        patternContainer.style.transform = `translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(animate);
    }

    animate();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        validateId(id);
    } else {
        // No ID provided, show error or default view
        showView('error');
    }

    initBackgroundPattern();
});
