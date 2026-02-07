document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const nameInput = document.getElementById('valentineName');
    const langSelect = document.getElementById('languageSelect');
    const previewBtn = document.getElementById('preview-button');
    const checkoutSection = document.getElementById('checkout-section');
    const checkoutBtn = document.getElementById('checkout-button');
    
    // Modals
    const previewModal = document.getElementById('preview-modal');
    const resultModal = document.getElementById('result-modal');
    const closePreview = document.getElementById('close-preview');
    const closeResult = document.getElementById('close-result');
    const buyAfterPreviewBtn = document.getElementById('buy-after-preview');

    // Preview Elements
    const previewCardText = document.getElementById('preview-card-text');
    const previewYes = document.getElementById('preview-yes');
    const previewNo = document.getElementById('preview-no');
    const ghostCursor = document.getElementById('ghost-cursor');

    // Result Elements
    const finalLinkInput = document.getElementById('final-link');
    const copyBtn = document.getElementById('copy-btn');
    const previewLinkBtn = document.getElementById('preview-link');
    const modalName = document.getElementById('modal-name');

    // --- TRANSLATION LOGIC ---
    function updateLanguage(lang) {
        const t = translations[lang];
        
        // Landing
        document.getElementById('landingTitle').innerHTML = t.landingTitle;
        document.getElementById('landingSubtitle').textContent = t.landingSubtitle;
        document.getElementById('enterNameLabel').textContent = t.enterName;
        document.getElementById('selectLangLabel').textContent = t.selectLang;
        nameInput.placeholder = t.placeholderName;
        
        previewBtn.innerHTML = t.previewBtn;
        checkoutBtn.innerHTML = t.generateBtn;
        
        document.getElementById('priceDisplay').textContent = t.price;
        document.getElementById('periodDisplay').textContent = t.period;
        document.getElementById('securePaymentText').textContent = t.securePayment;
        
        // Features List
        const featuresList = document.getElementById('featuresList');
        featuresList.innerHTML = '';
        t.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-check"></i> ${feature}`;
            featuresList.appendChild(li);
        });

        // Modals
        document.getElementById('paymentSuccessTitle').textContent = t.paymentSuccess;
        document.getElementById('yourLinkText').textContent = t.yourLink;
        document.getElementById('preview-link').textContent = t.testLink; // FIX: Use correct ID
        buyAfterPreviewBtn.innerHTML = t.generateBtn; // Reuse button text
    }

    langSelect.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
    });

    // Initialize with default
    updateLanguage('en');


    // --- GHOST CURSOR ANIMATION ---
    class GhostCursor {
        constructor(cursor, targetNo, targetYes) {
            this.cursor = cursor;
            this.targetNo = targetNo;
            this.targetYes = targetYes;
            this.isPlaying = false;
        }

        async play() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            this.cursor.classList.remove('hidden');
            
            // Reset positions
            this.targetNo.style.transform = 'translate(0, 0)';
            this.targetYes.style.transform = 'scale(1)';

            // 1. Move to No
            await this.moveTo(this.targetNo);
            
            // 2. No runs away (Simulated)
            this.targetNo.style.transition = 'transform 0.2s';
            this.targetNo.style.transform = 'translate(60px, -40px) rotate(10deg)';
            
            // 3. Chase No
            await this.wait(300);
            await this.moveTo({ 
                getBoundingClientRect: () => {
                    const rect = this.targetNo.getBoundingClientRect();
                    return rect;
                }
            });

            // 4. No runs again
            this.targetNo.style.transform = 'translate(-50px, 50px) rotate(-10deg)';
            
            // 5. Give up and go to Yes
            await this.wait(400);
            await this.moveTo(this.targetYes);
            
            // 6. Click Yes
            this.cursor.classList.add('clicking');
            this.targetYes.style.transform = 'scale(1.1)';
            await this.wait(200);
            this.cursor.classList.remove('clicking');
            
            // 7. Finish
            await this.wait(500);
            this.cursor.classList.add('hidden');
            this.isPlaying = false;
            
            // Reset for next time
            setTimeout(() => {
                this.targetNo.style.transform = 'translate(0, 0)';
                this.targetYes.style.transform = 'scale(1)';
            }, 1000);
        }

        moveTo(element) {
            return new Promise(resolve => {
                const rect = element.getBoundingClientRect();
                // Calculate center relative to the screen container
                // Note: The cursor is absolute inside .screen
                const screenRect = document.getElementById('preview-screen').getBoundingClientRect();
                
                const x = rect.left - screenRect.left + (rect.width / 2);
                const y = rect.top - screenRect.top + (rect.height / 2);

                this.cursor.style.left = `${x}px`;
                this.cursor.style.top = `${y}px`;

                setTimeout(resolve, 800); // Animation duration
            });
        }

        wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    const ghost = new GhostCursor(ghostCursor, previewNo, previewYes);


    // --- PREVIEW LOGIC ---
    previewBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const lang = langSelect.value;
        
        if (!name) {
            nameInput.style.borderColor = 'red';
            setTimeout(() => nameInput.style.borderColor = '#f0f2f5', 500);
            return;
        }

        // Update Preview Text
        const t = translations[lang];
        previewCardText.innerHTML = t.cardTitle.replace('{name}', name);
        previewYes.textContent = t.yesBtn;
        previewNo.textContent = t.noBtn;

        // Show Modal
        previewModal.classList.remove('hidden');
        
        // Start Animation after a short delay
        setTimeout(() => ghost.play(), 500);
    });

    buyAfterPreviewBtn.addEventListener('click', () => {
        previewModal.classList.add('hidden');
        checkoutSection.classList.remove('hidden');
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
    });


    // --- CHECKOUT LOGIC ---
    checkoutBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const lang = langSelect.value;

        // --- PAYMENT SIMULATION ---
        checkoutBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Verifying Payment...';
        checkoutBtn.disabled = true;

        setTimeout(() => {
            // Generate Token
            const payload = {
                n: name,
                l: lang, // Add Language to payload
                ts: Date.now(),
                s: Math.random().toString(36).substring(7)
            };
            
            const token = btoa(JSON.stringify(payload));
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            const fullUrl = `${baseUrl}/card.html?token=${token}`;

            finalLinkInput.value = fullUrl;
            previewLinkBtn.href = fullUrl;
            modalName.textContent = name;
            
            resultModal.classList.remove('hidden');
            
            checkoutBtn.innerHTML = translations[lang].generateBtn;
            checkoutBtn.disabled = false;
        }, 2000);
    });


    // --- UTILS ---
    copyBtn.addEventListener('click', () => {
        finalLinkInput.select();
        document.execCommand('copy');
        navigator.clipboard.writeText(finalLinkInput.value);
        
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
    });

    closePreview.addEventListener('click', () => previewModal.classList.add('hidden'));
    closeResult.addEventListener('click', () => resultModal.classList.add('hidden'));
    
    window.addEventListener('click', (e) => {
        if (e.target === previewModal) previewModal.classList.add('hidden');
        if (e.target === resultModal) resultModal.classList.add('hidden');
    });
});
