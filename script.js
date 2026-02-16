document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tagId = params.get('id');

    // Initialize cursor for all views
    initCursor();

    // Setup Home Navigation Buttons (must be outside the if block)
    document.querySelectorAll('.nav-btn-home').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove the 'id' parameter from the URL using pushState
            const url = new URL(window.location);
            url.searchParams.delete('id');
            window.history.pushState({}, '', url);

            showView('home');
        });
    });

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

    // Route based on presence of ID parameter
    if (!tagId) {
        showView('home');
        // logAttempt(null, 'home_page_visit'); // Optional logging
    } else {
        validateId(tagId);
    }


    // Setup Mobile Menu
    setupMobileMenu();

    // Setup Navbar Scroll Behavior
    setupNavbarScroll();
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

function initCursor() {
    const canvas = document.getElementById('ripple-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let ripples = [];
    const isMobile = !matchMedia('(pointer:fine)').matches;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Create a new ripple
    function createRipple(x, y, isLarge = false) {
        ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: isLarge ? 120 : 80,
            alpha: isLarge ? 0.5 : 0.6,
            speed: isLarge ? 2 : 2.5,
            fadeSpeed: isLarge ? 0.008 : 0.015,
            color: `52, 168, 83` // Vibrant Green
        });
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        ripples.forEach((ripple, index) => {
            ripple.radius += ripple.speed;
            ripple.alpha -= ripple.fadeSpeed;

            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${ripple.color}, ${ripple.alpha})`;
            ctx.fill();

            // Add a subtle ring effect
            ctx.strokeStyle = `rgba(${ripple.color}, ${ripple.alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
                ripples.splice(index, 1);
            }
        });

        requestAnimationFrame(animate);
    }

    animate();

    if (isMobile) {
        // Auto-blooming effect for mobile - ripples move across screen
        let autoBloomX = Math.random() * width;
        let autoBloomY = Math.random() * height;
        let velocityX = (Math.random() - 0.5) * 2; // Random direction
        let velocityY = (Math.random() - 0.5) * 2;

        function autoBloom() {
            // Create ripple at current position
            createRipple(autoBloomX, autoBloomY, true);

            // Update position
            autoBloomX += velocityX;
            autoBloomY += velocityY;

            // Bounce off edges and change direction slightly
            if (autoBloomX <= 0 || autoBloomX >= width) {
                velocityX = -velocityX + (Math.random() - 0.5) * 0.5;
                autoBloomX = Math.max(0, Math.min(width, autoBloomX));
            }
            if (autoBloomY <= 0 || autoBloomY >= height) {
                velocityY = -velocityY + (Math.random() - 0.5) * 0.5;
                autoBloomY = Math.max(0, Math.min(height, autoBloomY));
            }

            // Gradually change direction for organic movement
            velocityX += (Math.random() - 0.5) * 0.1;
            velocityY += (Math.random() - 0.5) * 0.1;

            // Limit velocity
            const maxVelocity = 3;
            velocityX = Math.max(-maxVelocity, Math.min(maxVelocity, velocityX));
            velocityY = Math.max(-maxVelocity, Math.min(maxVelocity, velocityY));
        }

        // Create auto-bloom every 800ms
        setInterval(autoBloom, 800);
    } else {
        // Desktop: Enhanced cursor tracking
        let lastX = 0, lastY = 0;
        let lastTime = Date.now();

        document.addEventListener('mousemove', (e) => {
            const currentTime = Date.now();
            const timeDelta = currentTime - lastTime;
            const distance = Math.sqrt(
                Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2)
            );

            // Create ripples based on movement speed
            if (distance > 5 && timeDelta > 30) {
                createRipple(e.clientX, e.clientY);
                lastX = e.clientX;
                lastY = e.clientY;
                lastTime = currentTime;
            }
        });

        document.addEventListener('click', (e) => {
            // Larger ripple burst on click
            for (let i = 0; i < 3; i++) {
                setTimeout(() => createRipple(e.clientX, e.clientY, true), i * 100);
            }
        });
    }
}

function setupMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const sideMenu = document.querySelector('.side-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        sideMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = sideMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMenu);
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', toggleMenu);
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (sideMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

function setupNavbarScroll() {
    const navbar = document.querySelector('.mobile-nav');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const scrollY = window.scrollY;

        if (scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });
}
