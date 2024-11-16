// Sample test data
const payments = [
    { "Member ID": "123", "Name": "Aang", "Membership Plan": "Premium", "Payment Status": "Paid"  },
 ];

// Function to populate the table with test data
function populateTable() {
    const tableBody = document.getElementById("paymentsTable").querySelector("tbody");
    tableBody.innerHTML = "";
    payments.forEach((payment) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${payment["Member ID"]}</td>
            <td>${payment["Name"]}</td>
            <td>${payment["Membership Plan"]}</td>
            <td>${payment["Payment Status"]}</td>
        `;
        tableBody.appendChild(row);
    });
}


// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateTable);
