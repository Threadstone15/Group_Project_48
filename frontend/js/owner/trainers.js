import { navigate } from "../router.js";
export function initOwner_trainers() {
    console.log("Initializing trainers.js");
    
    const applicationTable = document.getElementById("applicationTable");
    const rejectedTable = document.getElementById("rejectedTable");

    if (applicationTable && rejectedTable) {
        fetchApplications();
    } else {
        console.warn("One or both tables not found. Skipping fetch.");
    }

    function fetchApplications() {
        console.log("Fetching applications");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            navigate("login");
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };
        //do from here
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
}