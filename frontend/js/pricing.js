export function initpricing(){
    const pricingSwitch = document.getElementById('pricing-switch');
    const pricingCardsContainer = document.getElementById('pricing-cards');
    fetchMembershipPlans(); // Fetch and display plans on page load
    pricingSwitch.addEventListener('change', togglePricing);

    async function fetchMembershipPlans() {
        try {
            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/landingPageController.php?action=get_membershipPlans", {
                method: 'GET'
            });
    
            if (!response.ok) throw new Error("Failed to fetch membership plans");
    
            const plans = await response.json();
            console.log(plans);
            displayMembershipPlans(plans, plans.slice(0, 3));
        } catch (error) {
            console.error("Error fetching membership plans:", error);
        }
    }

    function displayMembershipPlans(plans, basicPlans) {
        pricingCardsContainer.innerHTML = ''; // Clear existing cards
    
        plans.forEach((plan, index) => {
            let benefitsList = '';
    
            if (plan.base_plan_id != plan.membership_plan_id) {
                // Find the base plan name from the basicPlans array
                const basePlan = basicPlans.find(basicPlan => basicPlan.membership_plan_id === plan.base_plan_id);
    
                // Construct the benefits string for custom plans
                benefitsList = `<li><strong>${basePlan ? basePlan.plan_name + ' plan features <br>' : 'Base Plan features'}</strong></li>` + `<b>+</b>` +
                    plan.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('');
            } else {
                // For basic plans, show only their benefits
                benefitsList = plan.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('');
            }
    
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
    
}


