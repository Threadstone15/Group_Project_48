export function initMember_upgradePlan() {
    console.log("initializing upgradePlan.js");

    // Dynamically load PayHere script
    const payHereScript = document.createElement('script');
    payHereScript.type = 'text/javascript';
    payHereScript.src = 'https://www.payhere.lk/lib/payhere.js';
    payHereScript.onload = () => {
        console.log("PayHere script loaded successfully");
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
            console.log("Membership plans:", plans);

            // Get subscription details or default to free plan
            let subscription = await getSubscriptionOfMember();
            if (!subscription || !subscription.membership_plan_id) {
                subscription = {
                    membership_plan_id: "MP1", // Free plan ID
                    amount: 0.00,
                    date_time: new Date().toISOString()
                };
            }

            const planIDofMember = subscription.membership_plan_id;
            let planPeriodofMember = "free";
            if (subscription.amount == 50.00 || subscription.amount == 70.00 || subscription.amount == 60.00) {
                planPeriodofMember = "monthly";
            } else if (subscription.amount > 0) {
                planPeriodofMember = "annual";
            }

            const startDate = subscription.date_time;
            displayCurrentPlan(plans, planIDofMember, planPeriodofMember, startDate);
            displayMembershipPlans(plans, plans.slice(0, 3), planIDofMember);
        } catch (error) {
            console.error("Error fetching membership plans:", error);
        }
    }

    async function getSubscriptionOfMember() {
        try {
            console.log("Fetching membership plan ID of member");

            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                return null; // Return null if no auth token (will default to free plan)
            }

            const requestOptions = {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` },
                redirect: 'follow'
            };
            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_subscription", requestOptions);

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // No subscription found
                }
                throw new Error("Failed to fetch subscription of the member");
            }

            const subscription = await response.json();
            console.log("Subscription details:", subscription);
            return subscription;
        } catch (error) {
            console.error("Error fetching subscription of the member:", error);
            return null;
        }
    }

    function displayMembershipPlans(plans, basicPlans, currentPlanId) {
        pricingCardsContainer.innerHTML = ''; // Clear existing cards

        // Sort plans by price (assuming higher price means higher tier)
        const sortedPlans = [...plans].sort((a, b) => parseFloat(a.monthlyPrice) - parseFloat(b.monthlyPrice));

        sortedPlans.forEach(plan => {
            // Skip if this is the current plan (already displayed in current plan section)
            if (plan.membership_plan_id === currentPlanId) return;

            // Determine if this plan is lower tier than current plan
            const isLowerTier = isPlanLowerTier(plan, currentPlanId, plans);
            
            let benefitsList = '';
            if (plan.base_plan_id != plan.membership_plan_id) {
                const basePlan = basicPlans.find(basicPlan => basicPlan.membership_plan_id === plan.base_plan_id);
                benefitsList = `<li><strong>${basePlan ? basePlan.plan_name + ' plan features <br>' : 'Base Plan features'}</strong></li>` + `<b>+</b>` +
                    plan.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('');
            } else {
                benefitsList = plan.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('');
            }

            const card = document.createElement('div');
            card.className = 'pricing-card';
            if (isLowerTier) {
                card.classList.add('disabled-plan');
            }

            card.innerHTML = `
                <h3>${plan.plan_name}</h3>
                <div class="price-container">
                    <div class="price monthly active">LKR${parseFloat(plan.monthlyPrice).toFixed(2)}<span>/month</span></div>
                    <div class="price annual">LKR${parseFloat(plan.yearlyPrice).toFixed(2)}<span>/year</span></div>
                </div>
                <ul class="features">${benefitsList}</ul>
                ${isLowerTier 
                    ? '<button class="select-plan disabled" disabled>Not Available</button>' 
                    : `<button class="select-plan" 
                        data-plan-id="${plan.membership_plan_id}"  
                        data-plan-name="${plan.plan_name}"
                        data-plan-price="${plan.monthlyPrice}">Upgrade to this Plan</button>`}
            `;

            pricingCardsContainer.appendChild(card);
        });

        document.querySelectorAll('.select-plan:not(.disabled)').forEach(button => {
            button.removeEventListener('click', handlePlanSelection); 
            button.addEventListener('click', function() {
                handlePlanSelection(this.dataset.planId, this.dataset.planName, this.dataset.planPrice);
            });
        });

        togglePricing();
    }

    function isPlanLowerTier(plan, currentPlanId, allPlans) {
        if (currentPlanId === "MP1") return false; // Free plan can upgrade to anything
        
        const currentPlan = allPlans.find(p => p.membership_plan_id === currentPlanId);
        if (!currentPlan) return false;
        
        return parseFloat(plan.monthlyPrice) < parseFloat(currentPlan.monthlyPrice);
    }

    function handlePlanSelection(planId, planName, planPrice) {
        const currentPlanElement = document.querySelector('.pricing-card.current-plan');
        if (currentPlanElement) {
            const remainingDays = currentPlanElement.querySelector('.remaining-days strong')?.textContent;
            const currentPlanName = currentPlanElement.querySelector('.plan-title')?.textContent;
            
            if (remainingDays && currentPlanName && currentPlanName !== "Free") {
                showUpgradeConfirmation(planId, planName, planPrice, remainingDays, currentPlanName);
                return;
            }
        }
        
        openPaymentPopup(planId, planName, planPrice);
    }

    function showUpgradeConfirmation(planId, planName, planPrice, remainingDays, currentPlanName) {
        const confirmationPopup = document.createElement('div');
        confirmationPopup.className = 'confirmation-popup';
        confirmationPopup.innerHTML = `
            <div class="popup-content">
                <span class="close-btn">&times;</span>
                <h3>Confirm Plan Upgrade</h3>
                <p>Your current <strong>${currentPlanName}</strong> plan has <strong>${remainingDays} days</strong> remaining.</p>
                <p>Upgrading to <strong>${planName}</strong> will replace your current plan immediately.</p>
                <div class="popup-buttons">
                    <button id="cancelUpgrade" class="secondary-btn">Cancel</button>
                    <button id="confirmUpgrade" class="primary-btn">Continue with Upgrade</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmationPopup);
        
        document.querySelector('.confirmation-popup .close-btn').addEventListener('click', () => {
            confirmationPopup.remove();
        });
        
        document.getElementById('cancelUpgrade').addEventListener('click', () => {
            confirmationPopup.remove();
        });
        
        document.getElementById('confirmUpgrade').addEventListener('click', () => {
            confirmationPopup.remove();
            openPaymentPopup(planId, planName, planPrice);
        });
    }

    const BASE_URL = "http://localhost:8080/Group_Project_48/backend/api/controllers/";

    function openPaymentPopup(planId, planName, planPrice) {
        console.log("Payment popup triggered!", { planId, planName, planPrice });

        const popup = document.getElementById('paymentPopup');
        document.getElementById('popupPlanName').innerText = `Upgrade to ${planName}`;
        document.getElementById('popupPlanDetails').innerText = `Price: LKR${planPrice}/month`;

        popup.style.display = 'flex';

        document.getElementById('payNowBtn').onclick = function() {
            redirectToPayHere(planId, planName, planPrice);
            popup.style.display = 'none';
        };
    }

    function redirectToPayHere(planId, planName, planPrice) {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            alert("Please log in to proceed with the payment.");
            return;
        }

        fetch(`${BASE_URL}memberController.php?action=get_user_details`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.email || !data.firstName) {
                throw new Error("Invalid user data received from the backend.");
            }

            console.log("User data:", data);

            const orderId = `ORDER_${new Date().getTime()}`;

            fetch(`${BASE_URL}memberController.php?action=generate_payment_hash`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ orderId, planName, planPrice, userData: data })
            })
            .then(response => response.json())
            .then(paymentData => {
                if (!paymentData.hash) {
                    throw new Error("Failed to generate payment hash.");
                }

                const paymentDetails = {
                    merchant_id: "1227926",
                    return_url: "http://localhost:8080/Group_Project_48/thank_you.html",
                    cancel_url: "http://localhost:8080/Group_Project_48/cancel.html",
                    notify_url: "http://your-public-domain.com/notify_url.php",
                    first_name: data.first_name,
                    last_name: data.last_name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    city: data.city,
                    country: data.country,
                    order_id: orderId,
                    items: planName,
                    currency: "LKR",
                    amount: planPrice,
                    hash: paymentData.hash,
                };

                payhere.onCompleted = function(orderId) {
                    console.log("Payment completed. Order ID:", orderId);
                    const method = "PayHere";
                    confirmPayment(orderId, planId, planPrice, "LKR", method, "Success");
                };

                payhere.onDismissed = function() {
                    console.log("Payment dismissed");
                    alert("Payment was cancelled.");
                };

                payhere.onError = function(error) {
                    console.log("Payment error:", error);
                    alert("Payment failed. Please try again.");
                };

                payhere.startPayment(paymentDetails);
            })
            .catch(error => {
                console.error("Error generating hash:", error);
                alert("Failed to initiate payment. Please try again.");
            });
        })
        .catch(error => {
            console.error("Error fetching user details:", error);
            alert("Failed to retrieve user details. Please try again.");
        });
    }

    async function confirmPayment(orderId, planId, amount, currency, method, status) {
        try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                throw new Error("Auth token not found. Please log in.");
            }

            const requestBody = {
                payment_id: orderId,
                membership_plan_id: planId,
                amount: amount,
                currency: currency,
                method: method,
                status: status,
            };

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify(requestBody),
            };

            const response = await fetch(`${BASE_URL}memberController.php?action=confirm_payment`, requestOptions);
            if (!response.ok) throw new Error("Payment confirmation failed");

            const result = await response.json();
            console.log("Payment confirmed:", result);
            alert("Your subscription has been updated successfully!");
            fetchMembershipPlans();
        } catch (error) {
            console.error("Error confirming payment:", error);
            alert("Payment confirmation failed. Please contact support.");
        }
    }

    // Close popup when clicking close button
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('paymentPopup').style.display = 'none';
    });

    function displayCurrentPlan(plans, planIDofMember, planPeriodofMember, startDate) {
        console.log("Displaying current plan");
        currentPlanContainer.innerHTML = ''; // Clear existing cards

        const currentPlan = plans.find(plan => plan.membership_plan_id === planIDofMember);
        if (!currentPlan) return;

        let benefitsList = '';
        if (currentPlan.base_plan_id != currentPlan.membership_plan_id) {
            const basePlan = plans.find(basicPlan => basicPlan.membership_plan_id === currentPlan.base_plan_id);
            benefitsList = `<li><strong>${basePlan ? basePlan.plan_name + ' plan features <br>' : 'Base Plan features'}</strong></li>` + `<b>+</b>` +
                currentPlan.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('');
        } else {
            benefitsList = currentPlan.benefits.split(',').map(benefit => `<li>${benefit.trim()}</li>`).join('');
        }

        let remainingDaysText = '';
        if (planIDofMember !== "MP1") { // Not free plan
            const start = new Date(startDate);
            let end = new Date(start);
            
            if (planPeriodofMember === "monthly") {
                end.setMonth(end.getMonth() + 1);
            } else if (planPeriodofMember === "annual") {
                end.setFullYear(end.getFullYear() + 1);
            }

            const now = new Date();
            const diffTime = end - now;
            const remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            remainingDaysText = `<p class="remaining-days"><strong>${remainingDays}</strong> days remaining</p>`;
        }

        const card = document.createElement('div');
        card.className = 'pricing-card current-plan';
        
        card.innerHTML = `
            <div class="current-badge">Your current plan</div>
            <h2 class="plan-title">${currentPlan.plan_name}</h2>
            <div class="price-container">
                ${planPeriodofMember === "monthly" ? `<p class="plan-price">LKR${parseFloat(currentPlan.monthlyPrice).toFixed(2)}<span>/month</span></p>` : ""}
                ${planPeriodofMember === "annual" ? `<p class="plan-price">LKR${parseFloat(currentPlan.yearlyPrice).toFixed(2)}<span>/year</span></p>` : ""}
                ${planIDofMember === "MP1" ? `<p class="plan-price">Free</p>` : ""}
            </div>
            ${remainingDaysText}
            <ul class="benefit-list">${benefitsList}</ul>                
        `;

        currentPlanContainer.appendChild(card);
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

        // Update plan buttons with correct price
        document.querySelectorAll('.select-plan:not(.disabled)').forEach(button => {
            const planId = button.dataset.planId;
            const plan = Array.from(document.querySelectorAll('.pricing-card')).find(card => 
                card.querySelector('.select-plan')?.dataset.planId === planId
            );
            
            if (plan) {
                const price = isAnnual 
                    ? plan.querySelector('.price.annual').textContent 
                    : plan.querySelector('.price.monthly').textContent;
                button.textContent = `Upgrade to this Plan (${price})`;
            }
        });
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}