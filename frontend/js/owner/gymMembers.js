// Sample test data
const members = [
    { "Member ID": "EQ123", "Name": "James", "Membership Plan": "Free", "Status": "Active", "Contact Number": "077322223", "Assigned Trainer": "Bond" },
];
console.log(equipments);
// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("memberTable").querySelector("tbody");
    tableBody.innerHTML = "";
    members.forEach((member) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${member["Member ID"]}</td>
            <td>${member["Name"]}</td>
            <td>${member["Membership Plan"]}</td>
            <td>${member["Status"]}</td>
            <td>${member["Contact Number"]}</td>
            <td>${member["Assigned Trainer"]}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateTable);
