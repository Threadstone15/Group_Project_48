const pricingSwitch = document.getElementById('pricing-switch');
const pricingCardsContainer = document.getElementById('pricing-cards');
fetchMembershipPlans(); // Fetch and display plans on page load
pricingSwitch.addEventListener('change', togglePricing);

async function fetchMembershipPlans() {
    try {
        console.log("Fetching membership plans");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            throw new Error("Auth token not found. Please log in.");
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };
        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_membershipPlans", requestOptions);

        if (!response.ok) throw new Error("Failed to fetch membership plans");

        const plans = await response.json();
        console.log(plans);
        displayMembershipPlans(plans);
    } catch (error) {
        console.error("Error fetching membership plans:", error);
    }
}

function displayMembershipPlans(plans) {
    pricingCardsContainer.innerHTML = ''; // Clear existing cards

    plans.forEach((plan, index) => {
        const benefitsList = plan.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('');

        const card = document.createElement('div');
        card.className = 'pricing-card';

        card.innerHTML = `
                ${index === 2 ? '<div class="popular-badge">Most Popular</div>' : ''}
                <h3>${plan.plan_name}</h3>
                <div class="price-container">
                    <div class="price monthly active">$${parseFloat(plan.monthlyPrice).toFixed(2)}<span>/month</span></div>
                    <div class="price annual">$${parseFloat(plan.yearlyPrice).toFixed(2)}<span>/year</span></div>
                </div>
                <ul class="features">${benefitsList}</ul>
                <button class="select-plan">Upgarde to this Plan</button>
            `;

        pricingCardsContainer.appendChild(card);
    });

    togglePricing(); // Ensure the correct prices are shown based on the toggle state
}

function togglePricing() {
    const isAnnual = pricingSwitch.checked;
    const monthlyPrices = document.querySelectorAll('.price.monthly');
    const annualPrices = document.querySelectorAll('.price.annual');

    monthlyPrices.forEach(price => {
        price.classList.toggle('active', !isAnnual);
    });

    annualPrices.forEach(price => {
        price.classList.toggle('active', isAnnual);
    });
}




