document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('valentineName');
    const previewText = document.getElementById('preview-text');
    const checkoutBtn = document.getElementById('checkout-button');
    const modal = document.getElementById('result-modal');
    const closeModal = document.querySelector('.close-modal');
    const finalLinkInput = document.getElementById('final-link');
    const copyBtn = document.getElementById('copy-btn');
    const previewLinkBtn = document.getElementById('preview-link');
    const modalName = document.getElementById('modal-name');

    // Live Preview Update
    nameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        previewText.textContent = val ? `${val}, will you be my Valentine?` : "Aurora, will you be my Valentine?";
    });

    // Checkout / Generate Link Logic
    checkoutBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        
        if (!name) {
            // Shake animation for error
            nameInput.style.borderColor = 'red';
            setTimeout(() => nameInput.style.borderColor = '#f0f2f5', 500);
            return;
        }

        // --- PAYMENT SIMULATION ---
        checkoutBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Verifying Payment...';
        checkoutBtn.disabled = true;

        setTimeout(() => {
            // 1. Generate Secure Token
            // We include a random 'salt' and timestamp to make the link look complex and secure
            const payload = {
                n: name,
                ts: Date.now(),
                s: Math.random().toString(36).substring(7)
            };
            
            // Encode to Base64 to create an opaque token
            const token = btoa(JSON.stringify(payload));
            
            // 2. Build URL
            const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            const fullUrl = `${baseUrl}/card.html?token=${token}`;

            // 3. Show Modal
            finalLinkInput.value = fullUrl;
            previewLinkBtn.href = fullUrl;
            modalName.textContent = name;
            
            modal.classList.remove('hidden');
            
            // Reset Button
            checkoutBtn.innerHTML = 'Generate Link <i class="fa-solid fa-arrow-right"></i>';
            checkoutBtn.disabled = false;
        }, 2000); // 2s delay for realism
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        finalLinkInput.select();
        document.execCommand('copy'); // Fallback compatibility
        navigator.clipboard.writeText(finalLinkInput.value);
        
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});
