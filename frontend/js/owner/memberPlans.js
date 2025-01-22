export function initOwner_memberPlans() {
    console.log("initializing memberplas.js");

    const plansTable = document.getElementById("plansTable");
    const customPlansTable = document.getElementById("CustomPlansTable");

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

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_membershipPlans", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch membership plans list");
                return response.json();
            })
            .then(data => {
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
                    const allPlans = data;

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
    }

    function populateBasicPlansTable(plans, tableBody) {
        plans.forEach(membershipPlan => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${membershipPlan['membership_plan_id']}</td>
            <td>${membershipPlan['plan_name']}</td>
            <td>${membershipPlan['benefits']}</td>
            <td>${membershipPlan['monthlyPrice']}</td>
            <td>${membershipPlan['yearlyPrice']}</td>
            <td>
                <button class="update-button" onclick="openBasicUpdatePopup(this)">Update</button>
            </td>
        `;

            tableBody.appendChild(row);
        });
    }

    function populateCustomPlansTable(plans, tableBody, allPlans) {
        plans.forEach(membershipPlan => {
            const row = document.createElement("tr");

            // Find the base plan name using base_plan_id
            const basePlan = allPlans.find(plan => plan.membership_plan_id === membershipPlan.base_plan_id);
            const basePlanName = basePlan ? basePlan.plan_name : "Unknown Plan";

            // Combine base plan name with custom plan benefits
            const combinedBenefits = `${basePlanName} plan features + ${membershipPlan.benefits}`;

            row.innerHTML = `
            <td>${membershipPlan['membership_plan_id']}</td>
            <td>${membershipPlan['plan_name']}</td>
            <td>${combinedBenefits}</td>
            <td>${membershipPlan['monthlyPrice']}</td>
            <td>${membershipPlan['yearlyPrice']}</td>
            <td>${membershipPlan['base_plan_id']}</td>
            <td>
                <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                <button class="delete-button" onclick="deleteMembershipPlan('${membershipPlan['membership_plan_id']}')">Delete</button>
            </td>
        `;

            tableBody.appendChild(row);
        });
    }

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
                showFormResponse("addFormResponse", result.message, "success");
                fetchMemberPlans();
            })
            .catch(error => {
                const errorMsg = error.error || "Failed to add membership plan.";
                showFormResponse("addFormResponse", errorMsg, "error");
            });
    });

    document.getElementById("closePopup").onclick = () => {
        document.getElementById("deletePopup").style.display = "none"; // Close the update popup
    };


    //deleting membership plan
    function deleteMembershipPlan(membership_plan_id) {
        console.log(`Delete button clicked for membership plan ID: ${membership_plan_id}`);

        // Show confirmation popup
        const deletePopup = document.getElementById("deletePopup");
        deletePopup.style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Auth token not found. Please log in.");
                return;
            }

            console.log("Auth Token:", authToken); // Debugging log

            // Set up the request with headers for the DELETE method
            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    // 'Content-Type': 'application/json'  // Ensure we send JSON content
                },
                redirect: 'follow'
            };

            fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=delete_membershipPlan&membership_plan_id=${membership_plan_id}`, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to delete membership plan");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.message) {
                        showFormResponse("deleteResponse", data.message, "success");
                        fetchMemberPlans();
                        setTimeout(() => {
                            deletePopup.style.display = "none";
                        }, 3000);
                    } else {
                        const errorMsg = data.error || "Failed to delete membership plan.";
                        showFormResponse("deleteResponse", errorMsg, "error");
                    }
                })
                .catch(error => console.error("Error deleting membership plan:", error));
        };

        document.getElementById("cancelDelete").onclick = () => {
            deletePopup.style.display = "none"; // Close the confirmation popup if canceled
        };
    }



    //updat popup for custom plan
    function openUpdatePopup(button) {
        const row = button.closest('tr'); // Get the row containing the clicked button
        const planId = row.cells[0].textContent; // membershp paln ID
        const name = row.cells[1].textContent; // Name

        const benefitsCellContent = row.cells[2].textContent; // Full cell content
        const benefitsParts = benefitsCellContent.split("plan features +");
        const customBenefits = benefitsParts[1] ? benefitsParts[1].trim() : ""; // Extracted custom benefits

        const monthlyPrice = parseFloat(row.cells[3].textContent);
        const yearlyPrice = parseFloat(row.cells[4].textContent);
        const basicPlanID = row.cells[5].textContent;



        const discount = 100 - ((yearlyPrice * 100) / (monthlyPrice * 12));
        const roundedDiscount = Math.floor(discount);

        // Fill the update form with the selected row's data
        document.getElementById("updatePlanId").value = planId;
        document.getElementById("updatePlanName").value = name;
        document.getElementById("updateBenefits").value = customBenefits;
        document.getElementById("updateMonthlyPrice").value = monthlyPrice;
        document.getElementById("updateDiscount").value = roundedDiscount;
        document.getElementById("updateBasePlanID").value = basicPlanID;

        // Show the update popup
        document.getElementById("updatePopup").style.display = "block";
    }

    document.getElementById("closeUpdatePopup").onclick = () => {
        document.getElementById("updatePopup").style.display = "none"; // Close the update popup
    };

    //update custom plan
    document.getElementById("updateForm").addEventListener("submit", function (event) {
        event.preventDefault();

        console.log("Update custom plan form submitted");

        const planId = document.getElementById("updatePlanId").value;
        const planName = document.getElementById("updatePlanName").value;
        const benefits = document.getElementById("updateBenefits").value;
        const monthlyPrice = document.getElementById("updateMonthlyPrice").value;
        const discount = document.getElementById("updateDiscount").value;
        const basicPlanID = document.getElementById("updateBasePlanID").value;

        if (!basicPlanID || !planName || !benefits || monthlyPrice === '' || discount === '') {
            showFormResponse("updateFormResponse", "Fields cannot be empty", "error");
            return;
        }

        if (monthlyPrice < 0 || discount < 0) {
            showFormResponse("updateFormResponse", "Price or discount cannot be negative", "error");
            return;
        }

        const yearlyPrice = monthlyPrice * 12 * (100 - discount) / 100;
        console.log("yearlyPrice:", yearlyPrice);

        const payload = {
            "membership_plan_id": planId,
            "name": planName,
            "benefits": benefits,
            "monthlyPrice": parseFloat(monthlyPrice),
            "yearlyPrice": parseFloat(yearlyPrice),
            "basePlanID": basicPlanID
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
                    // alert("Equipment updated successfully!");
                    showFormResponse("updateFormResponse", data.message, "success");
                    // document.getElementById("updatePopup").style.display = "none"; // Close the popup
                    setTimeout(() => {
                        document.getElementById("updatePopup").style.display = "none";
                    }, 3000);
                    fetchMemberPlans(); // Refresh the equipment list
                } else {
                    const errorMsg = data.error || "Failed to update membership plan.";
                    showFormResponse("updateFormResponse", errorMsg, "error");
                }
            })
            .catch(error => console.error("Error updating membership plan:", error));
    });


    //update popup for basci plan
    function openBasicUpdatePopup(button) {
        const row = button.closest('tr'); // Get the row containing the clicked button
        const planId = row.cells[0].textContent; // membershp paln ID
        const name = row.cells[1].textContent; // Name
        const benefits = row.cells[2].textContent;
        const monthlyPrice = parseFloat(row.cells[3].textContent);
        const yearlyPrice = parseFloat(row.cells[4].textContent);


        const discount = 100 - ((yearlyPrice * 100) / (monthlyPrice * 12));
        const roundedDiscount = Math.floor(discount);


        // Fill the update form with the selected row's data
        document.getElementById("updateBasicPlanId").value = planId;
        document.getElementById("updateBasicPlanName").value = name;
        document.getElementById("updateBasicBenefits").value = benefits;
        document.getElementById("updateBasicMonthlyPrice").value = monthlyPrice;
        document.getElementById("updateBasicDiscount").value = roundedDiscount;

        // Show the update popup
        document.getElementById("updateBasicPopup").style.display = "block";
    }

    document.getElementById("closeBasicUpdatePopup").onclick = () => {
        document.getElementById("updateBasicPopup").style.display = "none"; // Close the update popup
    };

    //update basic plan
    document.getElementById("updateBasicForm").addEventListener("submit", function (event) {
        event.preventDefault();

        console.log("Update basic plan form submitted");

        const planId = document.getElementById("updateBasicPlanId").value;
        const planName = document.getElementById("updateBasicPlanName").value;
        const benefits = document.getElementById("updateBasicBenefits").value;
        const monthlyPrice = document.getElementById("updateBasicMonthlyPrice").value;
        const discount = document.getElementById("updateBasicDiscount").value;
        const basicPlanID = planId;

        if (!basicPlanID || !planName || !benefits || monthlyPrice === '' || discount === '') {
            showFormResponse("updateBasicFormResponse", "Fields cannot be empty", "error");
            return;
        }

        if (monthlyPrice < 0 || discount < 0) {
            showFormResponse("updateBasicFormResponse", "Price or discount cannot be negative", "error");
            return;
        }

        const yearlyPrice = monthlyPrice * 12 * (100 - discount) / 100;
        console.log("yearlyPrice:", yearlyPrice);

        const payload = {
            "membership_plan_id": planId,
            "name": planName,
            "benefits": benefits,
            "monthlyPrice": parseFloat(monthlyPrice),
            "yearlyPrice": parseFloat(yearlyPrice),
            "basePlanID": basicPlanID
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
                    // alert("Equipment updated successfully!");
                    showFormResponse("updateBasicFormResponse", data.message, "success");
                    // document.getElementById("updatePopup").style.display = "none"; // Close the popup
                    setTimeout(() => {
                        document.getElementById("updateBasicPopup").style.display = "none";
                    }, 3000);
                    fetchMemberPlans(); // Refresh the equipment list
                } else {
                    const errorMsg = data.error || "Failed to update membership plan.";
                    showFormResponse("updateBasicFormResponse", errorMsg, "error");
                }
            })
            .catch(error => console.error("Error updating membership plan:", error));
    });

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


}