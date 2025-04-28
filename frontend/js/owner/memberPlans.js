export function initOwner_memberPlans() {
    console.log("initializing memberplas.js");

    const plansTable = document.getElementById("plansTable");
    const customPlansTable = document.getElementById("CustomPlansTable");
    const spinner = document.getElementById("loading-spinner");
    let allPlans = null;
    
    if (plansTable && customPlansTable) {
        fetchMemberPlans();
    } else {
        console.warn("One or both tables not found. Skipping fetch.");
    }

    function fetchMemberPlans() {
        console.log("Fetching membership plans");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };
        //add spinner
        spinner.classList.remove("hidden");

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_membershipPlans", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch membership plans list");
                return response.json();
            })
            .then(data => {
                //hide spinner
                spinner.classList.add("hidden");
                console.log("Fetched membership plans list:", data);

                // Clear both table bodies
                const plansTableBody = plansTable.getElementsByTagName("tbody")[0];
                const customPlansTableBody = customPlansTable.getElementsByTagName("tbody")[0];
                plansTableBody.innerHTML = "";
                customPlansTableBody.innerHTML = "";

                if (data.length > 0) {
                    // Split the data into two groups
                    const basicPlans = data.slice(0, 3); // First three plans
                    const customPlans = data.slice(3);  // Remaining plans
                    allPlans = data;

                    // Populate basic plans table
                    populateBasicPlansTable(basicPlans, plansTableBody);

                    // Populate custom plans table
                    populateCustomPlansTable(customPlans, customPlansTableBody, allPlans);
                } else {
                    // If no data is available, add a no-data row to both tables
                    const noDataRow = `<tr><td colspan="6" style="text-align: center;">No membership plans found</td></tr>`;
                    plansTableBody.innerHTML = noDataRow;
                    customPlansTableBody.innerHTML = noDataRow;
                }
            })
            .catch(error => console.error("Error fetching membership plans:", error));
        spinner.classList.add("hidden");
    }

    function populateBasicPlansTable(plans, tableBody) {
        plans.forEach(membershipPlan => {
            const isFreePlan = membershipPlan.membership_plan_id === "MP1" ? true : false; // Check if the plan is free
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${membershipPlan['plan_name']}</td>
            <td>${membershipPlan['benefits']}</td>
            <td>${membershipPlan['monthlyPrice']}</td>
            <td>${membershipPlan['yearlyPrice']}</td>
            ${membershipPlan.status === "active" ? 
                `<td>
                    <button class="${isFreePlan? 'disabled-btn':'delete-button'}" id="deactivatePlan" data-plan-id="${membershipPlan.membership_plan_id}">Deactivate</button>
                </td>` 
                : `<td>
                <button class="${isFreePlan? 'disabled-btn':'update-button'}" id="activatePlan" data-plan-id="${membershipPlan.membership_plan_id}">Activate</button>
                </td>`
            }
        `;

            tableBody.appendChild(row);
        });
    }

    plansTable.addEventListener("click", (event) => {
        const membershipPlanId = event.target.getAttribute("data-plan-id");
        if (event.target.id === "deactivatePlan") {
            console.log("Deactivate button clicked for membership plan ID:", membershipPlanId);
            updateMembershipPlanStatus(membershipPlanId, "inactive");
        } else if (event.target.id === "activatePlan") {
            console.log("Activate button clicked for membership plan ID:", membershipPlanId);
            updateMembershipPlanStatus(membershipPlanId, "active");
        }
    });

    function populateCustomPlansTable(plans, tableBody, allPlans) {
        plans.forEach(membershipPlan => {
            const row = document.createElement("tr");

            // Find the base plan name using base_plan_id
            const basePlan = allPlans.find(plan => plan.membership_plan_id === membershipPlan.base_plan_id);
            const basePlanFeatures = basePlan ? basePlan.benefits : " ";

            // Combine base plan name with custom plan benefits
            const combinedBenefits = `${basePlanFeatures}, ${membershipPlan.benefits}`;

            row.innerHTML = `
            <td>${membershipPlan['plan_name']}</td>
            <td>${combinedBenefits}</td>
            <td>${membershipPlan['monthlyPrice']}</td>
            <td>${membershipPlan['yearlyPrice']}</td>
            ${membershipPlan.status === "active" ? 
                `<td>
                    <button class="delete-button" id="deactivatePlan" data-plan-id="${membershipPlan.membership_plan_id}">Deactivate</button>
                </td>` 
                : `<td>
                <button class="update-button" id="activatePlan" data-plan-id="${membershipPlan.membership_plan_id}">Activate</button>
                </td>`
            }
        `;

            tableBody.appendChild(row);
        });
    }

    customPlansTable.addEventListener("click", (event) => {
        const membershipPlanId = event.target.getAttribute("data-plan-id");
        if (event.target.id === "deactivatePlan") {
            console.log("Deactivate button clicked for membership plan ID:", membershipPlanId);
            updateMembershipPlanStatus(membershipPlanId, "inactive");
        } else if (event.target.id === "activatePlan") {
            console.log("Activate button clicked for membership plan ID:", membershipPlanId);
            updateMembershipPlanStatus(membershipPlanId, "active");
        }
    });

    //adding membership plans
    document.getElementById('plansForm').addEventListener('submit', (event) => {
        event.preventDefault();

        console.log("Add membership plan form submitted");

        const basicPlanID = document.getElementById("basePlanID").value;
        const planName = document.getElementById("name").value;
        const benefits = document.getElementById("benefits").value;
        const monthlyPriceValue = document.getElementById("monthlyPrice").value;
        const discountValue = document.getElementById("discount").value;

        const monthlyPrice = parseFloat(monthlyPriceValue);
        const discount = parseFloat(discountValue);

        if (!basicPlanID || !planName || !benefits || monthlyPriceValue === '' || discountValue === '') {
            showFormResponse("addFormResponse", "Fields cannot be empty", "error");
            return;
        }
        if (monthlyPriceValue < 0 || discount < 0) {
            showFormResponse("addFormResponse", "Price or discount cannot be negative", "error");
            return;
        }
        if(discount > 100){
            showFormResponse("addFormResponse", "Discount cannot be greater than 100", "error");
            return;
        }

        const yearlyPrice = monthlyPrice * 12 * (100 - discount) / 100;
        console.log("yearlyPrice:", yearlyPrice);

        const payload = {
            "name": planName,
            "benefits": benefits,
            "monthlyPrice": monthlyPrice,
            "yearlyPrice": yearlyPrice,
            "basePlanID": basicPlanID
        };

        console.log("Payload:", JSON.stringify(payload)); // Debugging log

        // Retrieve auth token from local storage
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        console.log("Auth Token:", authToken); // Debugging log

        // Set up the request with headers and JSON body
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload),
        };
        // Send POST request to backend
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=add_membershipPlan", requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to add membership plan");
                }
                return response.json();
            })
            .then(result => {
                if(result.message){
                    showToast(result.message, "success");
                    //set inputs to null
                    document.getElementById("basePlanID").value = '';
                    document.getElementById("name").value = '';
                    document.getElementById("benefits").value = '';
                    document.getElementById("monthlyPrice").value = '';
                    document.getElementById("discount").value = '';
                }else{
                    showToast(result.error, "error");
                }
                fetchMemberPlans();
            })
            .catch(error => {
                const errorMsg = error.error || "Failed to add membership plan.";
                showToast("Failed to add membership plan", "error");
                showFormResponse("addFormResponse", errorMsg, "error");
            });
    });

    //update membership plan status
    function updateMembershipPlanStatus(membershipPlanId, status) {
        const selectedPlanDetails = allPlans.find(plan => plan.membership_plan_id === membershipPlanId);
        const payload = {
            "membership_plan_id": membershipPlanId,
            "name": selectedPlanDetails.plan_name,
            "status": status,
        };

        const authToken = localStorage.getItem("authToken");

        const requestOptions = {
            method: 'PUT', // Using PUT method for update
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json', // Sending JSON data
            },
            body: JSON.stringify(payload), // Stringify the data
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=update_membershipPlan", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to update membership plan");
                return response.json();
            })
            .then(data => {
                if (data.message) {
                    showToast("Membership plan status updated successfully", "success");
                    fetchMemberPlans(); // Refresh the equipment list
                } else {
                    const errorMsg = data.error || "Failed to update membership plan.";
                    showToast(data.error, "error");
                    showFormResponse("updateFormResponse", errorMsg, "error");
                }
            })
            .catch(error => console.error("Error updating membership plan:", error));
    }

    function showFormResponse(formType, message, type) {
        console.log("Displaying message:", message, "Type:", type); // Debugging log
        const responseContainer = document.getElementById(formType);
        responseContainer.textContent = message;
        responseContainer.className = `form-response ${type}`;
        responseContainer.style.display = "block";

        // Hide the message after 3 seconds
        setTimeout(() => {
            responseContainer.style.display = "none";
        }, 3000);
    }

    function showToast(message, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
    
        container.appendChild(toast);
    
        setTimeout(() => {
            toast.remove();
        }, 4000);
      }


}