export function initAdmin_paymentStat() {
    console.log("Initializing paymentStatus.js");

    let payments = [];

    

    function fetchPaymentsFromBackend() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
            redirect: "follow",
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_all_payments", requestOptions)
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch payments");
                return response.json();
            })
            .then((data) => {
                console.log("Fetched payments:", data);
            
                // If your API returns data wrapped in an object
                if (Array.isArray(data)) {
                    payments = data;
                } else if (Array.isArray(data.data)) {
                    payments = data.data;
                } else {
                    console.error("Unexpected data format", data);
                    payments = [];
                }
            
                populateTable();
            })
            
            .catch((error) => console.error("Error fetching payments:", error));
    }

    // Date range filter
    window.filterByDate = function () {
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;

        const filtered = payments.filter(payment => {
            const date = payment.Date;
            return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
        });

        populateTable(filtered);
    };

    function populateTable(filteredPayments = payments) {
        const tableBody = document.getElementById("paymentsTable").querySelector("tbody");
        tableBody.innerHTML = "";
        filteredPayments.forEach((payment) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${payment["Member ID"]}</td>
                <td>${payment["Name"]}</td>
                <td>${payment["Membership Plan"]}</td>
                <td>${payment["Payment Status"]}</td>
                <td>${payment["Date"]}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    fetchPaymentsFromBackend();
}
