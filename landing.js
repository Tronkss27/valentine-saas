document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const nameInput = document.getElementById('valentineName');
    const langSelect = document.getElementById('languageSelect');
    const previewBtn = document.getElementById('preview-button');
    const landingView = document.getElementById('landing-view');
    const fullscreenPreview = document.getElementById('fullscreen-preview');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    
    // Paywall & Result
    const paywallModal = document.getElementById('paywall-modal');
    const closePaywallBtn = document.getElementById('close-paywall');
    const checkoutBtn = document.getElementById('checkout-button');
    const resultModal = document.getElementById('result-modal');
    const closeResultBtn = document.getElementById('close-result');
    
    // Preview Game Elements
    const previewQuestion = document.getElementById('preview-question');
    const previewSubtitle = document.getElementById('preview-subtitle');
    const previewYesBtn = document.getElementById('preview-yes-btn');
    const previewNoBtn = document.getElementById('preview-no-btn');
    const previewResponseMsg = document.getElementById('preview-response-msg');
    const previewCardContainer = document.getElementById('preview-card-container');

    // Result Link Elements
    const finalLinkInput = document.getElementById('final-link');
    const copyBtn = document.getElementById('copy-btn');
    const previewLinkBtn = document.getElementById('preview-link');
    const paywallName = document.getElementById('paywall-name');

    // --- STATE ---
    let currentLang = 'en';
    let currentName = '';
    
    // Game State
    let yesScale = 1;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    let isSurrendered = false;
    let dramaLevel = 0;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 0);

    // --- TRANSLATION ---
    function updateLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];
        
        // Landing
        document.getElementById('landingTitle').innerHTML = t.landingTitle;
        document.getElementById('landingSubtitle').textContent = t.landingSubtitle;
        document.getElementById('enterNameLabel').textContent = t.enterName;
        document.getElementById('selectLangLabel').textContent = t.selectLang;
        nameInput.placeholder = t.placeholderName;
        
        // Buttons
        previewBtn.innerHTML = t.previewBtn;
        checkoutBtn.innerHTML = t.generateBtn;
        
        // Pricing (Check if elements exist before updating)
        const priceDisplay = document.getElementById('priceDisplay');
        if(priceDisplay) priceDisplay.textContent = t.price;
        
        const periodDisplay = document.getElementById('periodDisplay');
        if(periodDisplay) periodDisplay.textContent = t.period;
        
        // Features
        const featuresList = document.getElementById('featuresList');
        if(featuresList) {
            featuresList.innerHTML = '';
            t.features.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check"></i> ${feature}`;
                featuresList.appendChild(li);
            });
        }

        // Modals
        document.getElementById('paymentSuccessTitle').textContent = t.paymentSuccess;
        document.getElementById('yourLinkText').textContent = t.yourLink;
        
        const previewLink = document.getElementById('preview-link');
        if(previewLink) previewLink.textContent = t.testLink;

    }

    langSelect.addEventListener('change', (e) => updateLanguage(e.target.value));
    updateLanguage('en');

    // --- PREVIEW LOGIC ---
    previewBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.style.borderColor = 'red';
            setTimeout(() => nameInput.style.borderColor = '#f0f2f5', 500);
            return;
        }
        currentName = name;
        startPreview(name);
    });

    function startPreview(name) {
        // Switch Views
        landingView.classList.add('hidden');
        fullscreenPreview.classList.remove('hidden');
        
        // Setup Card
        const t = translations[currentLang];
        previewQuestion.innerHTML = t.cardTitle.replace('{name}', `<span class="highlight">${name}</span>`);
        previewSubtitle.textContent = t.cardSubtitle;
        previewYesBtn.textContent = t.yesBtn;
        previewNoBtn.textContent = t.noBtn;
        
        // Reset Game State
        resetGame();
        
        // Create Hearts
        createHearts();
    }

    function closePreview() {
        fullscreenPreview.classList.add('hidden');
        landingView.classList.remove('hidden');
        paywallModal.classList.add('hidden');
        resetGame(); // Reset styles
    }

    closePreviewBtn.addEventListener('click', closePreview);
    closePaywallBtn.addEventListener('click', closePreview);

    // --- GAME LOGIC (Duplicated for Preview Isolation) ---
    function resetGame() {
        yesScale = 1;
        attempts = 0;
        isSurrendered = false;
        dramaLevel = 0;
        
        previewYesBtn.style.transform = 'scale(1)';
        previewYesBtn.classList.remove('giant-yes');
        previewYesBtn.innerHTML = translations[currentLang].yesBtn;
        previewYesBtn.style.display = 'block';
        
        previewNoBtn.style.display = 'block';
        previewNoBtn.style.position = 'relative';
        previewNoBtn.style.left = 'auto';
        previewNoBtn.style.top = 'auto';
        previewNoBtn.style.transform = 'rotate(0deg)';
        previewNoBtn.textContent = translations[currentLang].noBtn;
        previewNoBtn.style.background = 'white';
        previewNoBtn.style.color = 'var(--primary)';
        previewNoBtn.style.borderColor = 'var(--primary)';
        
        previewResponseMsg.textContent = '';
    }

    function moveButton() {
        if (isSurrendered) return;

        attempts++;
        if (attempts >= MAX_ATTEMPTS) {
            surrender();
            return;
        }

        growYes();

        const cardRect = previewCardContainer.getBoundingClientRect();
        const btnWidth = previewNoBtn.offsetWidth;
        const btnHeight = previewNoBtn.offsetHeight;
        
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
            const yesRect = previewYesBtn.getBoundingClientRect();
            const cardRectAbs = previewCardContainer.getBoundingClientRect();
            
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

        previewNoBtn.style.position = 'absolute';
        previewNoBtn.style.left = `${randX}px`;
        previewNoBtn.style.top = `${randY}px`;

        previewNoBtn.classList.add('btn-shake');
        setTimeout(() => previewNoBtn.classList.remove('btn-shake'), 300);
        
        if (isMobile && navigator.vibrate) navigator.vibrate(50);
        
        const texts = translations[currentLang].noTexts;
        previewNoBtn.textContent = texts[Math.floor(Math.random() * texts.length)];
        previewNoBtn.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    }

    function growYes() {
        const rate = isMobile ? 0.5 : 0.3;
        const max = 3.5;
        if (yesScale < max) {
            yesScale += rate;
            previewYesBtn.style.transform = `scale(${yesScale})`;
            previewYesBtn.style.zIndex = 100;
        }
    }

    function surrender() {
        isSurrendered = true;
        const t = translations[currentLang];
        previewNoBtn.textContent = t.surrender;
        previewNoBtn.style.transform = "rotate(0deg)";
        previewNoBtn.style.background = "#e0e0e0";
        previewNoBtn.style.color = "#666";
        previewNoBtn.style.borderColor = "#ccc";
        previewNoBtn.style.position = "absolute"; 
        
        // Force Top Position (Safe from Mascot)
        previewNoBtn.style.top = "20px";
        previewNoBtn.style.bottom = "auto";
        previewNoBtn.style.left = "50%";
        previewNoBtn.style.transform = "translateX(-50%) scale(0.9)";
        previewNoBtn.style.zIndex = "200"; // Higher than Yes button
        previewNoBtn.style.transition = "all 0.5s ease";
        
        previewYesBtn.style.zIndex = 100;
    }

    function handleDrama() {
        dramaLevel++;
        const t = translations[currentLang];
        if (dramaLevel === 1) {
            previewNoBtn.textContent = t.drama1;
            previewNoBtn.style.transform = "translateX(-50%) scale(0.9)";
        } else if (dramaLevel === 2) {
            previewNoBtn.textContent = t.drama2;
            previewNoBtn.style.transform = "translateX(-50%) scale(0.8)";
        } else {
            // FINALE
            previewNoBtn.style.display = 'none';
            previewYesBtn.innerHTML = `<span>${t.finalSmall}</span>${t.finalBig}`;
            previewYesBtn.classList.add('giant-yes');
            previewResponseMsg.textContent = t.finalMsg;
        }
    }

    // --- VICTORY -> PAYWALL ---
    previewYesBtn.addEventListener('click', () => {
        // Update Paywall Language
        const t = translations[currentLang];
        document.querySelector('#paywall-modal h2').innerHTML = t.paywallTitle;
        document.querySelector('#paywall-modal p').innerHTML = t.paywallSubtitle.replace('{name}', `<span id="paywall-name">${currentName}</span>`);
        checkoutBtn.innerHTML = t.paywallBtn;
        closePaywallBtn.innerHTML = t.paywallClose;
        
        // Show Paywall
        paywallModal.classList.remove('hidden');
    });

    previewNoBtn.addEventListener('mouseover', () => { if (!isMobile) moveButton(); });
    previewNoBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (isSurrendered) handleDrama(); else moveButton(); });
    previewNoBtn.addEventListener('click', (e) => { e.preventDefault(); if (isSurrendered) handleDrama(); else moveButton(); });


    // --- CHECKOUT LOGIC ---
    checkoutBtn.addEventListener('click', () => {
        // Store current session data
        localStorage.setItem('valenlink_name', currentName);
        localStorage.setItem('valenlink_lang', currentLang);

        // --- DODO PAYMENTS INTEGRATION ---
        // Use Live Checkout URL (Will work once verification is complete)
        const DODO_PAYMENT_LINK = "https://checkout.dodopayments.com/buy/pdt_0NY01y9ZYWCDPKnzorOEd?quantity=1&redirect_url=" + encodeURIComponent(window.location.origin + "/?payment=success");
        
        window.location.href = DODO_PAYMENT_LINK;
    });

    // Check for payment success on load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
        // Retrieve stored data
        const storedName = localStorage.getItem('valenlink_name');
        const storedLang = localStorage.getItem('valenlink_lang');
        
        if (storedName) currentName = storedName;
        if (storedLang) currentLang = storedLang;
        
        // Show Result Modal
        landingView.classList.remove('hidden'); // Ensure landing is visible
        paywallModal.classList.add('hidden');
        resultModal.classList.remove('hidden');
        
        // Generate Link
        const payload = {
            n: currentName,
            l: currentLang, 
            ts: Date.now(),
            s: Math.random().toString(36).substring(7)
        };
        
        const token = btoa(JSON.stringify(payload));
        const baseUrl = window.location.href.split('?')[0].replace(/\/$/, ''); // Clean URL
        const fullUrl = `${baseUrl}/card.html?token=${token}`;

        finalLinkInput.value = fullUrl;
        previewLinkBtn.href = fullUrl;
        
        // Clean URL
        window.history.replaceState({}, document.title, "/");
    }

    // --- UTILS ---
    function createHearts() {
        const container = document.getElementById('preview-hearts');
        container.innerHTML = '';
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

    copyBtn.addEventListener('click', () => {
        finalLinkInput.select();
        document.execCommand('copy');
        navigator.clipboard.writeText(finalLinkInput.value);
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
    });

    closeResultBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        closePreview();
    });
});
