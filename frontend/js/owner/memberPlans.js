// Sample test data
const plans = [
    { "Plan ID": "001", "Name": "free", "Monthly Price": "Rs.500", "Yearly Price": "Rs.5600", "Benefits": "free" },
];
console.log(equipments);
// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("plansTable").querySelector("tbody");
    tableBody.innerHTML = "";
    plans.forEach((plan) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${plan["Plan ID"]}</td>
            <td>${plan["Name"]}</td>
            <td>${plan["Monthly Price"]}</td>
            <td>${plan["Yearly Price"]}</td>
            <td>${plan["Benefits"]}</td>
            <td>
                <a href="updateEquipment.php?id=${plan['Equipment ID']}" class="button update-button">Update</a>
                <button class="button delete-button" onclick="handleDelete('${plan["Equipment ID"]}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function handleDelete(planId) {
    const popup = document.getElementById("deletePopup");
    const overlay = document.getElementById("overlay");
    popup.style.display = "block";
    overlay.style.display = "block";

    document.getElementById("confirmDelete").onclick = function() {
        deleteEquipment(planId);
        popup.style.display = "none";
        overlay.style.display = "none";
    };

    document.getElementById("cancelDelete").onclick = function() {
        popup.style.display = "none";
        overlay.style.display = "none";
    };

    document.getElementById("closePopup").onclick = function() {
        popup.style.display = "none";
        overlay.style.display = "none";
    };
}


// Function to delete equipment from the test data array and refresh the table
function deleteEquipment(planId) {
    const index = equipments.findIndex(plan => plan["Equipment ID"] === planId);
    if (index > -1) {
        equipments.splice(index, 1);
        populateTable();
    }
}

// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateTable);