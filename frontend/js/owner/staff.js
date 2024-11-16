// Sample test data
const staffMembers = [
    { "Staff Member ID": "EQ123", "Name": "James", "Salary": "50,000", "Salary Status": "pending", "Contact No": "0777575675"},
];

// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("staffMemberTable").querySelector("tbody");
    tableBody.innerHTML = "";
    staffMembers.forEach((staffMember) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${staffMember["Staff Member ID"]}</td>
            <td>${staffMember["Name"]}</td>
            <td>${staffMember["Salary"]}</td>
            <td>${staffMember["Salary Status"]}</td>
            <td>${staffMember["Contact No"]}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateTable);
