export function initMember_upgradePlan() {
    console.log("initializing upgradePlan.js");

    // Dynamically load PayHere script
    const payHereScript = document.createElement('script');
    payHereScript.type = 'text/javascript';
    payHereScript.src = 'https://www.payhere.lk/lib/payhere.js';
    payHereScript.onload = () => {
        console.log("PayHere script loaded successfully");
        // You can now safely use PayHere functionality
    };
    payHereScript.onerror = () => {
        console.error("Failed to load PayHere script");
    };
    document.head.appendChild(payHereScript);
    const pricingSwitch = document.getElementById('pricing-switch');
    const pricingCardsContainer = document.getElementById('pricing-cards');
    const currentPlanContainer = document.getElementById('current-plan');

    fetchMembershipPlans();

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

            const subscription = await getSubscriptionOfMember();
            const planIDofMember = subscription.membership_plan_id;
            const planPeriodofMember = subscription.period;
            displayCurrentPlan(plans, planIDofMember, planPeriodofMember);
            displayMembershipPlans(plans, plans.slice(0, 3));
        } catch (error) {
            console.error("Error fetching membership plans:", error);
        }
    }

    async function getSubscriptionOfMember() {
        try {
            console.log("Fetching membership plan ID of member");

            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                throw new Error("Auth token not found. Please log in.");
            }

            const requestOptions = {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` },
                redirect: 'follow'
            };
            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_subscription", requestOptions);

            if (!response.ok) throw new Error("Failed to fetch subscription of the member");

            const subscription = await response.json();

            return subscription;
        } catch (error) {
            console.error("Error fetching subscription of the member:", error);
        }
    }

    function displayMembershipPlans(plans, basicPlans) {
        pricingCardsContainer.innerHTML = ''; // Clear existing cards

        plans.forEach(plan => {
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
                <h3>${plan.plan_name}</h3>
                <div class="price-container">
                    <div class="price monthly active">$${parseFloat(plan.monthlyPrice).toFixed(2)}<span>/month</span></div>
                    <div class="price annual">$${parseFloat(plan.yearlyPrice).toFixed(2)}<span>/year</span></div>
                </div>
                <ul class="features">${benefitsList}</ul>
                <button class="select-plan" 
                    data-plan-id="${plan.membership_plan_id}"  
                    data-plan-name="${plan.plan_name}"
                    data-plan-price="${plan.monthlyPrice}">Upgrade to this Plan</button>
            `;

            pricingCardsContainer.appendChild(card);
        });

        
        document.querySelectorAll('.select-plan').forEach(button => {
            button.removeEventListener('click', openPopup); 
            button.addEventListener('click', function () {
                openPopup(this.dataset.planId, this.dataset.planName, this.dataset.planPrice);
        });
        });

        togglePricing(); 
    }

    // Function to show popup
    function openPopup(planId, planName, planPrice) {
        console.log("Popup triggered!", { planId, planName, planPrice });
    
        const popup = document.getElementById('paymentPopup');
        document.getElementById('popupPlanName').innerText = `Upgrade to ${planName}`;
        document.getElementById('popupPlanDetails').innerText = `Price: $${planPrice}/month`;
    
        popup.style.display = 'flex';
    
        document.getElementById('payNowBtn').onclick = function () {
            initiatePayHerePayment(planId, planName, planPrice);
            popup.style.display = 'none';
        };
    }

    function initiatePayHerePayment(planId, planName, planPrice) {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            alert("Please log in before making a payment.");
            return;
        }
    
        // Fetch user details from backend to pass to PayHere
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_userDetails", {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => response.json())
        .then(user => {
            if (!user) {
                alert("User details not found.");
                return;
            }
    
            // PayHere payment parameters
            const payment = {
                sandbox: true, // Use sandbox mode
                merchant_id: "1227926", // Replace with your PayHere Merchant ID
                return_url: "http://localhost:8080/Group_Project_48/payment_success.php",
                cancel_url: "http://localhost:8080/Group_Project_48/payment_cancel.php",
                notify_url: "http://localhost:8080/Group_Project_48/payment_notify.php",
                order_id: `SUB_${planId}_${Date.now()}`,
                items: `${planName} Subscription`,
                amount: parseFloat(planPrice),
                currency: "LKR",
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email,
                phone: user.phone || "0700000000",
                address: user.address || "Not Provided",
                city: "Colombo",
                country: "Sri Lanka"
            };
    
            // Trigger PayHere payment
            payhere.startPayment(payment);
        })
        .catch(error => {
            console.error("Error fetching user details:", error);
            alert("Failed to retrieve user details.");
        });
    }

    // Close popup when clicking close button
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('paymentPopup').style.display = 'none';
    });

    function displayCurrentPlan(plans, planIDofMember, planPeriodofMember) {
        currentPlanContainer.innerHTML = ''; // Clear existing cards

        plans.forEach(plan => {
            let benefitsList = '';
            if (plan.membership_plan_id != planIDofMember) {
                return;
            }
            if (plan.base_plan_id != plan.membership_plan_id) {
                // Find the base plan name from the basicPlans array
                const basePlan = plans.slice(0, 3).find(basicPlan => basicPlan.membership_plan_id === plan.base_plan_id);

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
                <div class="popular-badge">Your current plan</div>
                <h2 class="plan-title">${plan.plan_name}</h2>
                <div class="price-container">
                    ${planPeriodofMember == "monthly" ? `<p class="plan-price">$${parseFloat(plan.monthlyPrice).toFixed(2)}<span>/month</span></p>` : ""}
                    ${planPeriodofMember == "annual" ? `<p class="plan-price">$${parseFloat(plan.yearlyPrice).toFixed(2)}<span>/year</span></p>` : ""}
                </div>
                <ul class="benefit-list">${benefitsList}</ul>                
            `;

            currentPlanContainer.appendChild(card);
        });
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

    async function upgradePlan(planID) {
        try {
            console.log(`Upgrading to plan: ${planID}`);

            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                throw new Error("Auth token not found. Please log in.");
            }

            // Calculate dates
            const today = new Date();
            const startDate = formatDate(today);

            const endDate = pricingSwitch.checked // Annual or monthly toggle
                ? formatDate(new Date(today.setFullYear(today.getFullYear() + 1))) // Add 1 year
                : formatDate(new Date(today.setMonth(today.getMonth() + 1))); // Add 1 month

            const currentDate = new Date();
            const paymentDueDate = formatDate(new Date(currentDate.setDate(currentDate.getDate() + 7))); // Add 7 days

            const period = pricingSwitch.checked ? "annual" : "monthly";

            const requestBody = {
                "membership_plan_id": planID,
                "startDate": startDate,
                "endDate": endDate,
                "paymentDue_date": paymentDueDate,
                "status": "active",
                "period": period
            };

            console.log("Request Body:", requestBody);

            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(requestBody),
                redirect: 'follow'
            };

            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=update_subscription", requestOptions);

            if (!response.ok) throw new Error("Failed to update subscription");

            const result = await response.json();
            console.log("Subscription updated successfully:", result);

            alert("Your subscription has been updated successfully!");
            fetchMembershipPlans(); // Refresh the plans
        } catch (error) {
            console.error("Error updating subscription:", error);
            alert("Failed to update subscription. Please try again.");
        }
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

}