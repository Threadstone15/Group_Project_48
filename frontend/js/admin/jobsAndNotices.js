// Sample test data
export function initAdmin_jobs() {
    console.log("Initializing jobs.js");
    const notices = [
        { "Notice ID": "EQ123", "Publisher ID": "67", "Title": "blahhh", "Description": "jcbuebeuhrufbeu" },
    ];

    // Function to populate the table with test data
    function populateTable() {
        const tableBody = document.getElementById("jobsTable").querySelector("tbody");
        tableBody.innerHTML = "";
        notices.forEach((notice) => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${notice["Notice ID"]}</td>
            <td>${notice["Publisher ID"]}</td>
            <td>${notice["Title"]}</td>
            <td>${notice["Description"]}</td>
            <td>
                <a href="updateEquipment.php?id=${notice['Equipment ID']}" class="button update-button">Update</a>
                <button class="button delete-button" onclick="handleDelete('${notice["Equipment ID"]}')">Delete</button>
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

        document.getElementById("confirmDelete").onclick = function () {
            deleteEquipment(equipmentId);
            popup.style.display = "none";
            overlay.style.display = "none";
        };

        document.getElementById("cancelDelete").onclick = function () {
            popup.style.display = "none";
            overlay.style.display = "none";
        };

        document.getElementById("closePopup").onclick = function () {
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

}