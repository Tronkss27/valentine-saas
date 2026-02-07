// Landing Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout-button');
    const nameInput = document.getElementById('valentineName');

    checkoutBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a name first!');
            nameInput.focus();
            return;
        }

        // --- PAYMENT LOGIC START ---
        // In a real scenario, you would call Stripe here.
        // Since we are in a "1-hour MVP" mode without a backend server,
        // we will simulate the "Success" flow directly.
        
        /* 
        REAL STRIPE IMPLEMENTATION GUIDE:
        1. Create a "Payment Link" in Stripe Dashboard.
        2. Set the "After payment" URL to: https://your-site.com/card.html?name={CHECKOUT_SESSION_ID}
           (Stripe doesn't easily pass custom params to Payment Links without code).
        
        BETTER MVP APPROACH:
        Redirect to a "Success" page that generates the link.
        */

        // SIMULATION: Direct redirect to the product (Free for testing)
        // Encode the name to be URL-safe
        const encodedName = encodeURIComponent(name);
        window.location.href = `card.html?name=${encodedName}`;
        
        // --- PAYMENT LOGIC END ---
    });
});
