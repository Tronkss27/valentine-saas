document.addEventListener('DOMContentLoaded', () => {
    // 1. DECODE URL TOKEN
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    let name = "My Love"; 
    let lang = "en"; // Default language

    if (token) {
        try {
            const decoded = atob(token);
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

    yesBtn.textContent = t.yesBtn;
    noBtn.textContent = t.noBtn;

    // 2. GAME LOGIC
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);
    
    let yesScale = 1;
    let attempts = 0;
    const MAX_ATTEMPTS = isMobile ? 4 : 6;
    let isSurrendered = false;
    let dramaLevel = 0;

    createHearts();

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
        
        const title = document.querySelector('h1');
        const img = document.querySelector('.mascot-large');
        const yes = yesBtn;

        const padding = 20;
        const maxX = cardRect.width - btnWidth - padding;
        const maxY = cardRect.height - btnHeight - padding;

        let randX, randY;
        let safe = false;
        let tries = 0;
        const yesBuffer = 40;

        while (!safe && tries < 100) {
            randX = Math.random() * (maxX - padding) + padding;
            randY = Math.random() * (maxY - padding) + padding;
            
            const hitTitle = isOverlapping(randX, randY, btnWidth, btnHeight, title, 0);
            const hitImg = isOverlapping(randX, randY, btnWidth, btnHeight, img, 0);
            const hitYes = isOverlapping(randX, randY, btnWidth, btnHeight, yes, yesBuffer);

            if (!hitTitle && !hitImg && !hitYes) {
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

        noBtn.classList.add('btn-shake');
        setTimeout(() => noBtn.classList.remove('btn-shake'), 300);
        
        if (isMobile && navigator.vibrate) navigator.vibrate(50);
        
        const texts = t.noTexts;
        noBtn.textContent = texts[Math.floor(Math.random() * texts.length)];
        noBtn.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    }

    function isOverlapping(x, y, width, height, element, buffer = 0) {
        const elRect = element.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect(); 
        
        const elLeft = elRect.left - cardRect.left - buffer;
        const elTop = elRect.top - cardRect.top - buffer;
        const elRight = elLeft + elRect.width + (buffer * 2);
        const elBottom = elTop + elRect.height + (buffer * 2);

        const newLeft = x;
        const newTop = y;
        const newRight = x + width;
        const newBottom = y + height;

        return !(newRight < elLeft || 
                 newLeft > elRight || 
                 newBottom < elTop || 
                 newTop > elBottom);
    }

    function growYes() {
        const rate = isMobile ? 0.5 : 0.3;
        const max = 3.5;
        
        if (yesScale < max) {
            yesScale += rate;
            yesBtn.style.transform = `scale(${yesScale})`;
            yesBtn.style.zIndex = 100;
        }
    }

    function surrender() {
        isSurrendered = true;
        noBtn.textContent = t.surrender;
        noBtn.style.transform = "rotate(0deg)";
        noBtn.style.background = "#e0e0e0";
        noBtn.style.color = "#666";
        noBtn.style.borderColor = "#ccc";
        noBtn.style.position = "absolute"; // Keep absolute to avoid jumping
        
        // Force safe position if currently overlapping (double check)
        const yesBuffer = 50;
        if (isOverlapping(parseFloat(noBtn.style.left), parseFloat(noBtn.style.top), noBtn.offsetWidth, noBtn.offsetHeight, yesBtn, yesBuffer)) {
             // Move to bottom right corner as fallback safe zone
             noBtn.style.left = (card.offsetWidth - noBtn.offsetWidth - 20) + 'px';
             noBtn.style.top = (card.offsetHeight - noBtn.offsetHeight - 20) + 'px';
        }
        
        // Ensure Z-Index is lower than Yes button but visible
        noBtn.style.zIndex = 10;
        yesBtn.style.zIndex = 100;
    }

    function handleDrama() {
        dramaLevel++;
        if (dramaLevel === 1) {
            noBtn.textContent = t.drama1;
            noBtn.style.transform = "scale(0.9)";
        } else if (dramaLevel === 2) {
            noBtn.textContent = t.drama2;
            noBtn.style.transform = "scale(0.8)";
        } else {
            // FINALE
            noBtn.style.display = 'none';
            yesBtn.innerHTML = `<span>${t.finalSmall}</span>${t.finalBig}`;
            yesBtn.classList.add('giant-yes');
            responseMsg.textContent = t.finalMsg;
        }
    }

    function victory() {
        responseMsg.innerHTML = t.victoryMsg;
        noBtn.style.display = 'none';
        yesBtn.classList.remove('giant-yes');
        yesBtn.style.transform = "scale(1)";
        yesBtn.textContent = t.victoryBtn;
        
        if (isMobile && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        document.body.style.backgroundColor = "#ffe3ec";
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

    noBtn.addEventListener('mouseover', () => {
        if (!isMobile) moveButton();
    });

    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isSurrendered) handleDrama();
        else moveButton();
    });

    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isSurrendered) handleDrama();
        else moveButton();
    });
});
