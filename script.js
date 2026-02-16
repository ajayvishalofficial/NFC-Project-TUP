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

function showView(viewName) {
    document.querySelectorAll('.view-layer').forEach(el => {
        el.classList.remove('active');
        el.style.opacity = '0';
        setTimeout(() => el.style.display = 'none', 500);
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
        target.style.display = 'flex';
        // forced reflow
        void target.offsetWidth;
        target.classList.add('active');
        target.style.opacity = '1';
    }
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
    const cursor = document.querySelector('.custom-cursor');

    if (matchMedia('(pointer:fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            // Using left/top for positioning to rely on CSS translate(-50%, -50%) for centering
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        document.addEventListener('mousedown', () => cursor.classList.add('expand'));
        document.addEventListener('mouseup', () => cursor.classList.remove('expand'));
    }
}
