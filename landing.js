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

    // New button inside the phone overlay
    document.getElementById('buy-inside-preview').addEventListener('click', () => {
        previewModal.classList.add('hidden');
        checkoutSection.classList.remove('hidden');
        checkoutSection.scrollIntoView({ behavior: 'smooth' });
    });