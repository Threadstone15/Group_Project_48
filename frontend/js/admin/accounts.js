// Sample test data
const equipments = [
    { "Equipment ID": "EQ123", "Name": "Treadmill", "Purchase Date": "2023-01-15", "Status": "Active", "Usable Duration": "2 years" },
    { "Equipment ID": "EQ124", "Name": "Dumbbell Set", "Purchase Date": "2022-07-10", "Status": "Inactive", "Usable Duration": "5 years" },
    { "Equipment ID": "EQ125", "Name": "Stationary Bike", "Purchase Date": "2021-05-22", "Status": "Active", "Usable Duration": "3 years" }
];
console.log(equipments);
// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("equipmentsTable").querySelector("tbody");
    tableBody.innerHTML = "";
    equipments.forEach((equipment) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${equipment["Equipment ID"]}</td>
            <td>${equipment["Name"]}</td>
            <td>${equipment["Purchase Date"]}</td>
            <td>${equipment["Status"]}</td>
            <td>${equipment["Usable Duration"]}</td>
            <td>
                <a href="updateEquipment.php?id=${equipment['Equipment ID']}" class="button update-button">Update</a>
                <button class="button delete-button" onclick="handleDelete('${equipment["Equipment ID"]}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function handleDelete(equipmentId) {
    const popup = document.getElementById("deletePopup");
    const overlay = document.getElementById("overlay");
    popup.style.display = "block";
    overlay.style.display = "block";

    document.getElementById("confirmDelete").onclick = function() {
        deleteEquipment(equipmentId);
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
function deleteEquipment(equipmentId) {
    const index = equipments.findIndex(equipment => equipment["Equipment ID"] === equipmentId);
    if (index > -1) {
        equipments.splice(index, 1);
        populateTable();
    }
}

// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateTable);