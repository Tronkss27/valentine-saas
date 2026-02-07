// Card Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    
    if (name) {
        document.getElementById('name-placeholder').textContent = name;
        document.title = `For ${name} 💖`;
    } else {
        // Fallback if no name provided
        document.getElementById('name-placeholder').textContent = "My Love";
    }

    // 2. Game Logic
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const responseMsg = document.getElementById('response-msg');
    const card = document.querySelector('.card-container');
    
    // Mobile Detection
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);
    
    let yesScale = 1;
    let attempts = 0;
    const MAX_ATTEMPTS = isMobile ? 4 : 6;
    let isSurrendered = false;
    let dramaLevel = 0;

    // Create Background Hearts
    createHearts();

    // --- FUNCTIONS ---

    function moveButton() {
        if (isSurrendered) return;

        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            surrender();
            return;
        }

        // Calculate boundaries
        const cardRect = card.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();
        
        // Safe area within card
        const padding = 20;
        const maxX = cardRect.width - btnRect.width - padding;
        const maxY = cardRect.height - btnRect.height - padding;

        // Random position
        let randX = Math.random() * (maxX - padding) + padding;
        let randY = Math.random() * (maxY - padding) + padding;

        // Apply
        noBtn.style.position = 'absolute';
        noBtn.style.left = `${randX}px`;
        noBtn.style.top = `${randY}px`;

        // Effects
        noBtn.classList.add('btn-shake');
        setTimeout(() => noBtn.classList.remove('btn-shake'), 300);
        
        if (isMobile && navigator.vibrate) navigator.vibrate(50);

        // Grow Yes
        growYes();
        
        // Change Text
        const texts = ["Missed!", "Too slow!", "Nope!", "Try again!", "Catch me!"];
        noBtn.textContent = texts[Math.floor(Math.random() * texts.length)];
        noBtn.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
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
            yesBtn.innerHTML = `<span style="display:block; font-size: 1.5rem; margin-bottom: 10px; opacity: 0.8;">YOU HAVE NO CHOICE! 😈💖</span>YES, I LOVE YOU! 😍`;
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
        
        // Confetti effect (simplified)
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
