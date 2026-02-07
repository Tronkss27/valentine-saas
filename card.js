document.addEventListener('DOMContentLoaded', () => {
    // 1. DECODE URL TOKEN
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    let name = "My Love"; // Default

    if (token) {
        try {
            // Decode Base64 -> JSON -> Get Name
            const decoded = atob(token);
            const data = JSON.parse(decoded);
            if (data.n) {
                name = data.n; // 'n' was the key we used
            }
        } catch (e) {
            console.error("Invalid token", e);
        }
    } else {
        // Fallback for old links ?name=Aurora
        const legacyName = urlParams.get('name');
        if (legacyName) name = legacyName;
    }

    // Update UI with Name
    document.getElementById('question').innerHTML = `Hey <span class="highlight">${name}</span>,<br>will you be my Valentine?`;
    document.title = `For ${name} 💖`;

    // 2. GAME LOGIC
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const responseMsg = document.getElementById('response-msg');
    const card = document.querySelector('.card-container');
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

        // 1. Grow Yes FIRST so we know its new size for collision detection
        growYes();

        const cardRect = card.getBoundingClientRect();
        const btnWidth = noBtn.offsetWidth;
        const btnHeight = noBtn.offsetHeight;
        
        // Elements to avoid
        const title = document.querySelector('h1');
        const img = document.querySelector('.mascot-large');
        const yes = yesBtn;

        // Safe boundaries (padding)
        const padding = 20;
        const maxX = cardRect.width - btnWidth - padding;
        const maxY = cardRect.height - btnHeight - padding;

        let randX, randY;
        let safe = false;
        let tries = 0;

        // Increase buffer around Yes button to prevent overlap
        const yesBuffer = 40; // Extra space around Yes button

        // Try 100 times to find a safe spot
        while (!safe && tries < 100) {
            randX = Math.random() * (maxX - padding) + padding;
            randY = Math.random() * (maxY - padding) + padding;
            
            // Check collisions
            const hitTitle = isOverlapping(randX, randY, btnWidth, btnHeight, title, 0);
            const hitImg = isOverlapping(randX, randY, btnWidth, btnHeight, img, 0);
            // Add buffer for Yes button collision
            const hitYes = isOverlapping(randX, randY, btnWidth, btnHeight, yes, yesBuffer);

            if (!hitTitle && !hitImg && !hitYes) {
                safe = true;
            }
            tries++;
        }

        // Fallback: If no safe spot found, force to top corners (usually empty)
        if (!safe) {
            randX = Math.random() > 0.5 ? padding : maxX - padding;
            randY = padding; 
        }

        // Apply Position
        noBtn.style.position = 'absolute';
        noBtn.style.left = `${randX}px`;
        noBtn.style.top = `${randY}px`;

        // Effects
        noBtn.classList.add('btn-shake');
        setTimeout(() => noBtn.classList.remove('btn-shake'), 300);
        
        if (isMobile && navigator.vibrate) navigator.vibrate(50);
        
        const texts = ["Missed!", "Too slow!", "Nope!", "Try again!", "Catch me!"];
        noBtn.textContent = texts[Math.floor(Math.random() * texts.length)];
        noBtn.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    }

    // Updated Overlapping function with buffer support
    function isOverlapping(x, y, width, height, element, buffer = 0) {
        const elRect = element.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect(); 
        
        // Calculate element's position relative to the card container
        // We can't rely solely on getBoundingClientRect for comparison if we are calculating 'x' and 'y' relative to card
        // So we convert element's rect to be relative to card as well
        
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
        noBtn.textContent = "Okay, I give up... 🏳️";
        noBtn.style.transform = "rotate(0deg)";
        noBtn.style.background = "#e0e0e0";
        noBtn.style.color = "#666";
        noBtn.style.borderColor = "#ccc";
        noBtn.style.position = "static"; // Return to flow or keep absolute? Let's keep absolute to not jump
        // Actually, keeping it absolute where it stopped is better UX
    }

    function handleDrama() {
        dramaLevel++;
        if (dramaLevel === 1) {
            noBtn.textContent = "So you don't love me? 😢";
            noBtn.style.transform = "scale(0.9)";
        } else if (dramaLevel === 2) {
            noBtn.textContent = "You're breaking my heart... 💔";
            noBtn.style.transform = "scale(0.8)";
        } else {
            // FINALE
            noBtn.style.display = 'none';
            yesBtn.innerHTML = `<span>YOU HAVE NO CHOICE! 😈💖</span>YES, I LOVE YOU! 😍`;
            yesBtn.classList.add('giant-yes');
            responseMsg.textContent = "Resistance is futile...";
        }
    }

    function victory() {
        responseMsg.innerHTML = "I knew you would say YES! <br> Love you! 💖🐷";
        noBtn.style.display = 'none';
        yesBtn.classList.remove('giant-yes');
        yesBtn.style.transform = "scale(1)";
        yesBtn.textContent = "YAAAAY! 🎉";
        
        if (isMobile && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        // Confetti effect
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
