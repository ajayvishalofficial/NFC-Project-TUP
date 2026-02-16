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
            // If it's currently active/visible, fade it out
            if (el.classList.contains('active') || el.style.opacity === '1') {
                el.classList.remove('active');
                el.style.opacity = '0';

                // Allow transition to finish before hiding
                viewTimeouts[el.id] = setTimeout(() => {
                    el.style.display = 'none';
                    if (viewTimeouts[el.id]) delete viewTimeouts[el.id];
                }, 500);
            } else {
                // Already hidden or hiding, just ensure it's hidden immediately if not the target
                // This prevents "ghost" views from staying if a timeout was cleared
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

function initCursor() {
    const canvas = document.getElementById('ripple-canvas');
    if (!canvas || !matchMedia('(pointer:fine)').matches) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let ripples = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Create a new ripple
    function createRipple(x, y) {
        ripples.push({
            x: x,
            y: y,
            radius: 0,
            alpha: 0.6,
            color: `120, 255, 120` // Green-ish
        });
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        ripples.forEach((ripple, index) => {
            ripple.radius += 2.5; // Expansion speed
            ripple.alpha -= 0.015; // Fade speed

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ripple.color}, ${ripple.alpha})`;
            ctx.fill();

            if (ripple.alpha <= 0) {
                ripples.splice(index, 1);
            }
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Event Listeners
    document.addEventListener('mousemove', (e) => {
        // limit ripple creation rate for performance? 
        // For now, let's create one every few frames or just on move. 
        // A trailing effect is requested "follows the cursor movement".
        // Let's adding ripples frequently creates a trail.
        if (Math.random() > 0.7) // Throttling slightly for style
            createRipple(e.clientX, e.clientY);
    });

    document.addEventListener('click', (e) => {
        // larger ripple on click
        for (let i = 0; i < 3; i++) {
            setTimeout(() => createRipple(e.clientX, e.clientY), i * 100);
        }
    });
}
