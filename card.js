document.addEventListener('DOMContentLoaded', () => {
    // 1. DECODE URL TOKEN
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    let name = "My Love"; 
    let lang = "en"; // Default language

    if (token) {
        try {
            const decoded = decodeURIComponent(atob(token));
            const data = JSON.parse(decoded);
            if (data.n) name = data.n;
            if (data.l) lang = data.l; // Get language from token
        } catch (e) {
            console.error("Invalid token", e);
        }
    } else {
        // Fallback
        const legacyName = urlParams.get('name');
        if (legacyName) name = legacyName;
        const legacyLang = urlParams.get('lang');
        if (legacyLang) lang = legacyLang;
    }

    // Load Translations
    const t = translations[lang] || translations['en'];

    // Update UI with Name & Language
    document.getElementById('question').innerHTML = t.cardTitle.replace('{name}', `<span class="highlight">${name}</span>`);
    document.getElementById('subtitle').textContent = t.cardSubtitle;
    document.title = `For ${name} 💖`;

    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const responseMsg = document.getElementById('response-msg');
    const card = document.querySelector('.card-container');
    const mainCard = document.getElementById('main-card');
    const victoryScreen = document.getElementById('victory-screen');

    yesBtn.textContent = t.yesBtn;
    noBtn.textContent = t.noBtn;

    // Update Victory Screen Texts
    document.getElementById('victory-title').innerHTML = t.victoryBtn; // "YAAAAY!"
    document.getElementById('victory-message').innerHTML = t.victoryMsg; // "I knew..."
    document.querySelector('.date-invite p').textContent = t.dateInvite;

    // 2. GAME LOGIC
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);
    
    let yesScale = 1;
    let attempts = 0;
    const MAX_ATTEMPTS = isMobile ? 4 : 6;
    let isSurrendered = false;
    let dramaLevel = 0;

    createHearts();

    // --- HELPER FUNCTIONS ---
    function growYes() {
        const rate = isMobile ? 0.5 : 0.3;
        const max = 3.5;
        if (yesScale < max) {
            yesScale += rate;
            yesBtn.style.transform = `scale(${yesScale})`;
            yesBtn.style.zIndex = 100;
        }
    }

    // --- COLLISION DETECTION ---
    function moveButton() {
        if (isSurrendered) return;

        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            surrender();
            return;
        }

        growYes();

        const cardRect = card.getBoundingClientRect();
        const btnWidth = noBtn.offsetWidth;
        const btnHeight = noBtn.offsetHeight;
        
        const padding = 20;
        const maxX = cardRect.width - btnWidth - padding;
        const maxY = cardRect.height - btnHeight - padding;

        let randX, randY;
        let safe = false;
        let tries = 0;
        const yesBuffer = 40;

        while (!safe && tries < 50) {
            randX = Math.random() * (maxX - padding) + padding;
            randY = Math.random() * (maxY - padding) + padding;
            
            // Simple collision check against Yes button
            const yesRect = yesBtn.getBoundingClientRect();
            const cardRectAbs = card.getBoundingClientRect();
            
            // Calculate absolute positions for new No button position
            const newLeftAbs = cardRectAbs.left + randX;
            const newTopAbs = cardRectAbs.top + randY;
            const newRightAbs = newLeftAbs + btnWidth;
            const newBottomAbs = newTopAbs + btnHeight;
            
            // Check overlap with Yes button (with buffer)
            if (!(newRightAbs < yesRect.left - yesBuffer || 
                  newLeftAbs > yesRect.right + yesBuffer || 
                  newBottomAbs < yesRect.top - yesBuffer || 
                  newTopAbs > yesRect.bottom + yesBuffer)) {
                // Overlaps
                safe = false;
            } else {
                safe = true;
            }
            tries++;
        }

        if (!safe) {
            randX = Math.random() > 0.5 ? padding : maxX - padding;
            randY = padding; 
        }

        noBtn.style.position = 'absolute';
        noBtn.style.left = `${randX}px`;
        noBtn.style.top = `${randY}px`;
        noBtn.style.zIndex = 200; // Ensure it stays on top of Yes button

        noBtn.classList.add('btn-shake');
        setTimeout(() => noBtn.classList.remove('btn-shake'), 300);
        
        if (isMobile && navigator.vibrate) navigator.vibrate(50);
        
        const texts = t.noTexts;
        noBtn.textContent = texts[Math.floor(Math.random() * texts.length)];
        noBtn.style.transform = `translate(0, 0) rotate(${Math.random() * 20 - 10}deg)`;
    }

    function surrender() {
        isSurrendered = true;
        noBtn.textContent = t.surrender;
        noBtn.style.transform = "rotate(0deg)";
        noBtn.style.background = "#e0e0e0";
        noBtn.style.color = "#666";
        noBtn.style.borderColor = "#ccc";
        noBtn.style.position = "absolute"; 
        
        // Force Top Left Position (Safe from Mascot)
        noBtn.style.top = "15px";
        noBtn.style.left = "15px";
        noBtn.style.bottom = "auto";
        noBtn.style.transform = "scale(0.85)"; // Slightly smaller
        noBtn.style.setProperty('z-index', '100000', 'important'); // Ultra high to be above everything
        noBtn.style.transition = "all 0.5s ease";
        
        yesBtn.style.zIndex = 100;
    }

    function handleDrama() {
        dramaLevel++;
        if (dramaLevel === 1) {
            noBtn.textContent = t.drama1;
            noBtn.style.transform = "translateX(-50%) scale(0.9)";
        } else if (dramaLevel === 2) {
            noBtn.textContent = t.drama2;
            noBtn.style.transform = "translateX(-50%) scale(0.8)";
        } else {
            // FINALE
            noBtn.style.display = 'none';
            yesBtn.innerHTML = `<span>${t.finalSmall}</span>${t.finalBig}`;
            yesBtn.classList.add('giant-yes');
            responseMsg.textContent = t.finalMsg;
        }
    }

    function victory() {
        // Hide Main Card
        mainCard.classList.add('hidden');
        
        // Show Victory Screen
        victoryScreen.classList.remove('hidden');
        
        if (isMobile && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        // Confetti effect (simple CSS background change for now, or we could add a library)
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function createHearts() {
        const container = document.getElementById('hearts-bg');
        for(let i=0; i<15; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerHTML = '❤';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
            heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
            container.appendChild(heart);
        }
    }

    // --- EVENTS ---
    yesBtn.addEventListener('click', victory);

    // Prevent double firing on touch devices
    let lastInteraction = 0;

    function handleInteraction(e) {
        e.preventDefault(); // Prevent default browser behavior
        const now = Date.now();
        if (now - lastInteraction < 100) return; // Debounce
        lastInteraction = now;

        if (isSurrendered) handleDrama();
        else moveButton();
    }

    noBtn.addEventListener('mouseover', () => {
        if (!isMobile) moveButton();
    });

    noBtn.addEventListener('touchstart', handleInteraction, { passive: false });
    noBtn.addEventListener('click', handleInteraction);
});
