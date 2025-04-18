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
            let planPeriodofMember = "free";
            if (subscription.amount == 50.00 || subscription.amount == 70.00 || subscription.amount == 60.00) {
                planPeriodofMember = "monthly";
            } else {
                planPeriodofMember = "annual";

            }
            const startDate = subscription.date_time;            ;
            displayCurrentPlan(plans, planIDofMember, planPeriodofMember, startDate);
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
            console.log(subscription);

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
                    <div class="price monthly active">LKR${parseFloat(plan.monthlyPrice).toFixed(2)}<span>/month</span></div>
                    <div class="price annual">LKR${parseFloat(plan.yearlyPrice).toFixed(2)}<span>/year</span></div>
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
    const BASE_URL = "http://localhost:8080/Group_Project_48/backend/api/controllers/";

function openPopup(planId, planName, planPrice) {
    console.log("Popup triggered!", { planId, planName, planPrice });

    const popup = document.getElementById('paymentPopup');
    document.getElementById('popupPlanName').innerText = `Upgrade to ${planName}`;
    document.getElementById('popupPlanDetails').innerText = `Price: LKR${planPrice}/month`;

    popup.style.display = 'flex';

    document.getElementById('payNowBtn').onclick = function () {
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

        // Send payment details to the backend to generate the hash
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
                notify_url: "http://your-public-domain.com/notify_url.php", // Must be publicly accessible
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
                hash: paymentData.hash, // Secure hash from backend
            };

            payhere.onCompleted = function (orderId) {
                console.log("Payment completed. Order ID:", orderId);
                const method = "PayHere";
                confirmPayment(orderId, planId, planPrice, "LKR", method,"Success");
            };

            payhere.onDismissed = function () {
                console.log("Payment dismissed");
                alert("Payment was cancelled.");
            };

            payhere.onError = function (error) {
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

        if (typeof fetchMembershipPlans === "function") {
            fetchMembershipPlans();
        } else {
            console.warn("fetchMembershipPlans() is not defined.");
        }
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

            //  Calculate remaining days
            const start = new Date(startDate);
            let end;

            if (planPeriodofMember === "monthly") {
                end = new Date(start);
                end.setMonth(end.getMonth() + 1);
            } else if (planPeriodofMember === "annual") {
                end = new Date(start);
                end.setFullYear(end.getFullYear() + 1);
            }

            const now = new Date();
            const diffTime = end - now;
            const remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Avoid negative days


            const card = document.createElement('div');
            card.className = 'pricing-card';
            console.log(plan);

            card.innerHTML = `
                <div class="popular-badge">Your current plan</div>
                <h2 class="plan-title">${plan.plan_name}</h2>
                <div class="price-container">
                    ${planPeriodofMember == "monthly" ? `<p class="plan-price">LKR${parseFloat(plan.monthlyPrice).toFixed(2)}<span>/month</span></p>` : ""}
                    ${planPeriodofMember == "annual" ? `<p class="plan-price">LKR${parseFloat(plan.yearlyPrice).toFixed(2)}<span>/year</span></p>` : ""}
                </div>
                <p class="remaining-days"><strong>${remainingDays}</strong> days remaining</p>
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