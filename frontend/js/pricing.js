document.addEventListener('DOMContentLoaded', function() {
    const pricingSwitch = document.getElementById('pricing-switch');
    const monthlyPrices = document.querySelectorAll('.price.monthly');
    const annualPrices = document.querySelectorAll('.price.annual');

    function togglePricing() {
        const isAnnual = pricingSwitch.checked;
        
        monthlyPrices.forEach(price => {
            price.classList.toggle('active', !isAnnual);
        });
        
        annualPrices.forEach(price => {
            price.classList.toggle('active', isAnnual);
        });
    }

    // Add event listener to the switch
    pricingSwitch.addEventListener('change', togglePricing);

    // Initialize pricing display
    togglePricing();
});