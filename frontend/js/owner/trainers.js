// Sample test data
const trainers = [
    { "Trainer ID": "EQ123", "Name": "James", "Specialties": "cdhbch", "Members Assigned": "csb" },
];
console.log(equipments);
// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("trainerTable").querySelector("tbody");
    tableBody.innerHTML = "";
    trainers.forEach((trainer) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${trainer["Trainer ID"]}</td>
            <td>${trainer["Name"]}</td>
            <td>${trainer["Specialties"]}</td>
            <td>${trainer["Members Assigned"]}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateTable);
