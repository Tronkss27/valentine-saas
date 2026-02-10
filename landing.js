document.addEventListener('DOMContentLoaded', () => {
    // --- PRELOAD IMAGES ---
    const preloadImages = [
        'pig-missed.png', 'pig-nope.png', 'pig-catch.png', 
        'pig-giveup.png', 'pig-dontlove.png', 'pig-broken.png',
        'pig-success.png'
    ];
    preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

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
    const MAX_ATTEMPTS = 7;
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

        const originalPriceDisplay = document.getElementById('originalPriceDisplay');
        if(originalPriceDisplay) originalPriceDisplay.textContent = t.originalPrice;
        
        const periodDisplay = document.getElementById('periodDisplay');
        if(periodDisplay) periodDisplay.textContent = t.period;

        const offerLabel = document.getElementById('offerLabel');
        if(offerLabel) offerLabel.textContent = t.offerTimer;

        const securePaymentText = document.getElementById('securePaymentText');
        if(securePaymentText) securePaymentText.innerHTML = `<i class="fa-solid fa-lock"></i> ${t.securePayment}`;

        // Modal Pricing
        const modalPriceDisplay = document.getElementById('modalPriceDisplay');
        if(modalPriceDisplay) modalPriceDisplay.textContent = t.price;

        const modalOriginalPrice = document.getElementById('modalOriginalPrice');
        if(modalOriginalPrice) modalOriginalPrice.textContent = t.originalPrice;

        const modalPeriodDisplay = document.getElementById('modalPeriodDisplay');
        if(modalPeriodDisplay) modalPeriodDisplay.textContent = t.period;

        const modalOfferLabel = document.getElementById('modalOfferLabel');
        if(modalOfferLabel) modalOfferLabel.textContent = t.offerTimer;
        
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
        // Save to LocalStorage immediately (Safety net)
        localStorage.setItem('valenlink_name', name);
        localStorage.setItem('valenlink_lang', currentLang);

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
        const mascot = document.querySelector('.mascot-large');
        const t = translations[currentLang];

        // 1. Missed!
        if (attempts === 1) {
            previewNoBtn.textContent = t.noTexts[0];
            mascot.src = "pig-missed.png";
        }
        // 2. Nope!
        else if (attempts === 2) {
            previewNoBtn.textContent = t.noTexts[1];
            mascot.src = "pig-nope.png";
        }
        // 3. Catch me!
        else if (attempts === 3) {
            previewNoBtn.textContent = t.noTexts[2];
            mascot.src = "pig-catch.png";
        }
        // 4. Surrender (Gray Starts)
        else if (attempts >= 4) {
            surrender();
            return;
        }

        growYes();

        // Cache dimensions to avoid reflows in loop
        const cardRect = previewCardContainer.getBoundingClientRect();
        const yesRect = previewYesBtn.getBoundingClientRect();
        const btnWidth = previewNoBtn.offsetWidth;
        const btnHeight = previewNoBtn.offsetHeight;
        
        const padding = 20;
        const maxX = cardRect.width - btnWidth - padding;
        const maxY = cardRect.height - btnHeight - padding;

        let randX, randY;
        let safe = false;
        let tries = 0;
        const yesBuffer = 40;
        const mascotBuffer = 150; 

        // Pre-calculate absolute card position
        const cardLeft = cardRect.left;
        const cardTop = cardRect.top;

        while (!safe && tries < 50) {
            randX = Math.random() * (maxX - padding) + padding;
            randY = Math.random() * (maxY - padding) + padding;
            
            // Calculate absolute positions for new No button position
            const newLeftAbs = cardLeft + randX;
            const newTopAbs = cardTop + randY;
            const newRightAbs = newLeftAbs + btnWidth;
            const newBottomAbs = newTopAbs + btnHeight;
            
            // 1. Check YES overlap (using cached yesRect)
            const overlapYes = !(newRightAbs < yesRect.left - yesBuffer || 
                  newLeftAbs > yesRect.right + yesBuffer || 
                  newBottomAbs < yesRect.top - yesBuffer || 
                  newTopAbs > yesRect.bottom + yesBuffer);

            // 2. Check MASCOT overlap
            const mascotCenterX = cardRect.width / 2;
            const mascotBottomY = 200; 
            const overlapMascot = (randY < mascotBottomY && Math.abs(randX + btnWidth/2 - mascotCenterX) < mascotBuffer);

            if (!overlapYes && !overlapMascot) {
                safe = true;
            }
            tries++;
        }

        if (!safe) {
            // Fallback: Safe corners if random fails
            const corners = [
                {x: padding, y: maxY - padding}, // Bottom Left
                {x: maxX - padding, y: maxY - padding}, // Bottom Right
                {x: padding, y: padding + 200}, // Mid Left
                {x: maxX - padding, y: padding + 200} // Mid Right
            ];
            const c = corners[attempts % corners.length];
            randX = c.x;
            randY = c.y;
        }

        previewNoBtn.style.position = 'absolute';
        previewNoBtn.style.left = `${randX}px`;
        previewNoBtn.style.top = `${randY}px`;

        previewNoBtn.classList.add('btn-shake');
        setTimeout(() => previewNoBtn.classList.remove('btn-shake'), 300);
        
        if (isMobile && navigator.vibrate) navigator.vibrate(50);
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
        const mascot = document.querySelector('.mascot-large');
        
        // 4. Okay I give up... (Gray)
        previewNoBtn.textContent = t.drama1; 
        mascot.src = "pig-giveup.png";

        previewNoBtn.style.transform = "rotate(0deg)";
        previewNoBtn.style.background = "#e0e0e0";
        previewNoBtn.style.color = "#666";
        previewNoBtn.style.borderColor = "#ccc";
        previewNoBtn.style.position = "absolute"; 
        
        // Fixed Top Left Position
        previewNoBtn.style.top = "15px";
        previewNoBtn.style.left = "15px";
        previewNoBtn.style.bottom = "auto";
        previewNoBtn.style.transform = "scale(0.85)";
        previewNoBtn.style.setProperty('z-index', '100000', 'important'); 
        previewNoBtn.style.transition = "all 0.5s ease";
        
        previewYesBtn.style.zIndex = 100;
    }

    function handleDrama() {
        dramaLevel++; // Starts at 0. surrender() was attempt 4. Next click is attempt 5 -> dramaLevel 1? 
        // Logic: surrender() sets isSurrendered=true. Next interactions call handleDrama().
        // So:
        // Click 5 -> dramaLevel 1
        // Click 6 -> dramaLevel 2
        // Click 7 -> Finale

        const t = translations[currentLang];
        const mascot = document.querySelector('.mascot-large');

        if (dramaLevel === 1) {
            // 5. So you don't love me?
            previewNoBtn.textContent = t.drama2;
            previewNoBtn.style.transform = "scale(0.9)"; // Stay fixed, just scale
            mascot.src = "pig-dontlove.png";
        } else if (dramaLevel === 2) {
            // 6. You're breaking my heart...
            previewNoBtn.textContent = t.drama3;
            previewNoBtn.style.transform = "scale(0.8)";
            mascot.src = "pig-broken.png";
        } else {
            // 7. FINALE
            previewNoBtn.style.display = 'none';
            previewYesBtn.innerHTML = `<span>${t.finalSmall}</span>${t.finalBig}`;
            previewYesBtn.classList.add('giant-yes');
            previewResponseMsg.textContent = t.finalMsg;
            // mascot.src = "pig-broken.png"; // Keep broken or use success on click?
            // Victory handles success image
        }
    }

    // --- EVENTS ---
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

    // Prevent double firing on touch devices
    let lastInteraction = 0;

    function handleInteraction(e) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastInteraction < 100) return;
        lastInteraction = now;

        if (isSurrendered) handleDrama();
        else moveButton();
    }

    previewNoBtn.addEventListener('mouseover', () => { if (!isMobile) moveButton(); });
    previewNoBtn.addEventListener('touchstart', handleInteraction, { passive: false });
    previewNoBtn.addEventListener('click', handleInteraction);


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
        
        const token = btoa(encodeURIComponent(JSON.stringify(payload)));
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

    // --- SHARE BUTTONS ---
    const emailBtn = document.getElementById('email-btn');
    const whatsappBtn = document.getElementById('whatsapp-btn');

    if(emailBtn) {
        emailBtn.addEventListener('click', () => {
            const subject = encodeURIComponent("Il tuo link di My Valentine 💖");
            const body = encodeURIComponent(`Ecco il link speciale per ${currentName}:\n\n${finalLinkInput.value}\n\nNon perderlo!`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        });
    }

    if(whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const text = encodeURIComponent(`Ecco il link speciale per ${currentName} 💖:\n${finalLinkInput.value}`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
        });
    }

    closeResultBtn.addEventListener('click', () => {
        resultModal.classList.add('hidden');
        closePreview();
    });

    // --- COUNTDOWN TIMER ---
    function startTimer(duration, display1, display2) {
        let timer = duration, minutes, seconds;
        setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            const text = minutes + ":" + seconds;
            if(display1) display1.textContent = text;
            if(display2) display2.textContent = text;

            if (--timer < 0) {
                timer = duration; // Reset or stop? Let's restart for now or keep at 00:00
                // timer = 0; 
            }
        }, 1000);
    }

    const countdownDisplay = document.getElementById('countdown');
    const modalCountdownDisplay = document.getElementById('modalCountdown');
    startTimer(600, countdownDisplay, modalCountdownDisplay); // 10 minutes
});
