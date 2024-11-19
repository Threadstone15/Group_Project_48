console.log("JS loaded");

const plansTable = document.getElementById("plansTable");

if (plansTable) {
    fetchMemberPlans();
} else {
    console.warn("plan table not found. Skipping fetch.");
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

            const tableBody = plansTable.getElementsByTagName("tbody")[0];
            tableBody.innerHTML = "";

            if (data.length > 0) {
                data.forEach(membershipPlan => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${membershipPlan['membership_plan_id']}</td>
                        <td>${membershipPlan['plan_name']}</td>
                        <td>${membershipPlan['benefits']}</td>
                        <td>${membershipPlan['monthlyPrice']}</td>
                        <td>${membershipPlan['yearlyPrice']}</td>
                        <td>
                            <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                            <button class="delete-button" onclick="deleteMembershipPlan('${membershipPlan['membership_plan_id']}')">Delete</button>
                        </td>
                    `;

                    tableBody.appendChild(row);
                });
            } else {
                const noDataRow = document.createElement("tr");
                noDataRow.innerHTML = `<td colspan="6" style="text-align: center;">No membership plans found</td>`;
                tableBody.appendChild(noDataRow);
            }
        })
        .catch(error => console.error("Error fetching membership plans:", error));
}

//adding membership plans
document.getElementById('plansForm').addEventListener('submit', (event) => {
    event.preventDefault();

    console.log("Add membership plan form submitted");

    const planName = document.getElementById("name").value;
    const benefits = document.getElementById("benefits").value;
    const monthlyPriceValue = document.getElementById("monthlyPrice").value;
    const discountValue = document.getElementById("discount").value;

    const monthlyPrice = parseFloat(monthlyPriceValue);
    const discount = parseFloat(discountValue);

    if (!planName || !benefits || monthlyPriceValue === '' || discountValue === '') {
        showFormResponse("addFormResponse", "Fields cannot be empty", "error");
        return;
    }

    const yearlyPrice = monthlyPrice * 12 * (100 - discount) / 100;
    console.log("yearlyPrice:", yearlyPrice);

    const payload = {
        "name": planName,
        "benefits": benefits,
        "monthlyPrice": monthlyPrice,
        "yearlyPrice": yearlyPrice
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
            .then(result => {
                console.log("membership plan deleted successfully:", result);
                fetchMemberPlans();
                deletePopup.style.display = "none"; // Close the confirmation popup
            })
            .catch(error => console.error("Error deleting membership plan:", error));
    };

    document.getElementById("cancelDelete").onclick = () => {
        deletePopup.style.display = "none"; // Close the confirmation popup if canceled
    };
}



//updating plan
function openUpdatePopup(button) {
    const row = button.closest('tr'); // Get the row containing the clicked button
    const planId = row.cells[0].textContent; // membershp paln ID
    const name = row.cells[1].textContent; // Name
    const benefits = row.cells[2].textContent;
    const monthlyPrice = parseFloat(row.cells[3].textContent);
    const yearlyPrice = parseFloat(row.cells[4].textContent);


    const discount = 100 - ((yearlyPrice * 100) / (monthlyPrice * 12));

    // Fill the update form with the selected row's data
    document.getElementById("updatePlanId").value = planId;
    document.getElementById("updatePlanName").value = name;
    document.getElementById("updateBenefits").value = benefits;
    document.getElementById("updateMonthlyPrice").value = monthlyPrice;
    document.getElementById("updateDiscount").value = discount;

    // Show the update popup
    document.getElementById("updatePopup").style.display = "block";
}

document.getElementById("closeUpdatePopup").onclick = () => {
    document.getElementById("updatePopup").style.display = "none"; // Close the update popup
};

document.getElementById("updateForm").addEventListener("submit", function (event) {
    event.preventDefault();

    console.log("Update plan form submitted");

    const planId = document.getElementById("updatePlanId").value;
    const planName = document.getElementById("updatePlanName").value;
    const benefits = document.getElementById("updateBenefits").value;
    const monthlyPrice = document.getElementById("updateMonthlyPrice").value;
    const discount = document.getElementById("updateDiscount").value;

    if (!planName || !benefits || monthlyPrice === '' || discount === '') {
        showFormResponse("updateFormResponse", "Fields cannot be empty", "error");
        return;
    }


    const yearlyPrice = monthlyPrice * 12 * (100 - discount) / 100;
    console.log("yearlyPrice:", yearlyPrice);

    const payload = {
        "membership_plan_id": planId,
        "name": planName,
        "benefits": benefits,
        "monthlyPrice": parseFloat(monthlyPrice),
        "yearlyPrice": parseFloat(yearlyPrice)
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


function showFormResponse(formType, message, type) {
    console.log("Displaying message:", message, "Type:", type); // Debugging log
    const responseContainer = document.getElementById(formType);
    responseContainer.textContent = message;
    responseContainer.className = `form-response ${type}`;
    responseContainer.style.display = "block";

    // console.log("Form response style:", responseContainer.style.display); // Check display style


    // Hide the message after 3 seconds
    setTimeout(() => {
        responseContainer.style.display = "none";
    }, 3000);
}


