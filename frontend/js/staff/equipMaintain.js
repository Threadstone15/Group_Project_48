// Sample test data
const equipments = [
    { "Maintainence ID": "23897", "Equipment ID": "123", "Maintainence Date": "2023-01-15", "Details": "repaired", "Next Maintainence Date": "2025-09-05" },
]
console.log(equipments);
// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("equipmentsTable").querySelector("tbody");
    tableBody.innerHTML = "";
    equipments.forEach((equipment) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${equipment["Maintainence ID"]}</td>
            <td>${equipment["Equipment ID"]}</td>
            <td>${equipment["Maintainence Date"]}</td>
            <td>${equipment["Details"]}</td>
            <td>${equipment["Next Maintainence Date"]}</td>
        `;
        tableBody.appendChild(row);
    });
}
populateTable();