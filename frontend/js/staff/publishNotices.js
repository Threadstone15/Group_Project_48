export function initStaff_publishNotice() {
    console.log("initializing publish notice js");

    const noticeTable = document.getElementById("equipmentsTable");

    // Initialize notice data if the table exists
    if (noticeTable) {
        fetchNoticeList();
    } else {
        console.warn("Notice table not found. Skipping fetch.");
    }

    // Fetch the list of notices from the backend
    function fetchNoticeList() {
        console.log("Fetching Notices");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_notices", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch notice list");
                return response.json();
            })
            .then(data => {
                console.log("Fetched notice list:", data);

                const tableBody = noticeTable.getElementsByTagName("tbody")[0];
                tableBody.innerHTML = "";

                if (data.length > 0) {
                    data.forEach(notice => {
                        const row = document.createElement("tr");

                        row.innerHTML = `
                        <td>${notice['notice_id']}</td>
                        <td>${notice['publisher_id']}</td>
                        <td>${notice['title']}</td>
                        <td>${notice['description']}</td>
                        <td>
                            <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                            <button class="delete-button" onclick="deleteNotice('${notice['notice_id']}')">Remove</button>
                        </td>
                    `;

                        tableBody.appendChild(row);
                    });
                } else {
                    const noDataRow = document.createElement("tr");
                    noDataRow.innerHTML = `<td colspan="5" style="text-align: center;">No notices found</td>`;
                    tableBody.appendChild(noDataRow);
                }
            })
            .catch(error => console.error("Error fetching notice list:", error));
    }

    // Add a new notice
    document.getElementById("publishBtn").addEventListener("click", function () {
        const noticeInput = document.getElementById("noticeInput").value;
        const noticeInputTopic = document.getElementById("noticeInputTopic").value;

        if (!noticeInput.trim()) {
            alert("Notice content cannot be empty!");
            return;
        }
        if (!noticeInputTopic.trim()) {
            alert("Notice title cannot be empty!");
            return;
        }

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const formData = new FormData();
        formData.append("title", noticeInputTopic);
        formData.append("description", noticeInput);
        formData.append("action", "add_notice");

        const requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData,
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to add notice");
                return response.text();
            })
            .then(result => {
                console.log("Notice added successfully:", result);
                fetchNoticeList(); // Refresh the notice list
                document.getElementById("noticeInput").value = ""; // Clear the input field
                location.reload();
            })
            .catch(error => console.error("Error adding notice:", error));
    });

    // Delete a notice
    function deleteNotice(noticeId) {
        console.log(`Delete button clicked for notice ID: ${noticeId}`);

        const deletePopup = document.getElementById("deletePopup");
        deletePopup.style.display = "block";

        document.getElementById("overlay").style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Auth token not found. Please log in.");
                return;
            }

            const requestOptions = {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                redirect: 'follow'
            };

            fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=delete_notice&notice_id=${noticeId}`, requestOptions)
                .then(response => {
                    if (!response.ok) throw new Error("Failed to delete notice");
                    return response.json();
                })
                .then(result => {
                    console.log("Notice deleted successfully:", result);
                    fetchNoticeList(); // Refresh the notice list
                    document.getElementById("overlay").style.display = "none";
                    deletePopup.style.display = "none";
                })
                .catch(error => console.error("Error deleting notice:", error));
        };

        document.getElementById("cancelDelete").onclick = () => {
            deletePopup.style.display = "none";
            document.getElementById("overlay").style.display = "none";
        };
    }

    // Open the update popup for editing a notice
    function openUpdatePopup(button) {
        const row = button.closest("tr");
        const noticeId = row.cells[0].textContent;
        //const publisherId = row.cells[1].textContent;
        const title = row.cells[2].textContent;
        const description = row.cells[3].textContent;


        document.getElementById("overlay").style.display = "block";


        document.getElementById("updateNoticeId").value = noticeId;
        //document.getElementById("updatePublisherId").value = publisherId;
        document.getElementById("updateNoticeTitle").value = title;
        document.getElementById("updateNoticeDescription").value = description;

        document.getElementById("updatePopup").style.display = "block";
        document.getElementById("closeUpdatePopup").onclick = () => {
            document.getElementById("updatePopup").style.display = "none"; // Close the update popup
            document.getElementById("overlay").style.display = "none";
        };

    }

    // Update a notice
    document.getElementById("updateForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const noticeId = document.getElementById("updateNoticeId").value;
        const title = document.getElementById("updateNoticeTitle").value;
        const description = document.getElementById("updateNoticeDescription").value;

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const formData = JSON.stringify({
            notice_id: noticeId,
            title: title,
            description: description
        });

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: formData,
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=update_notice", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to update notice");
                return response.json();
            })
            .then(result => {
                console.log("Notice updated successfully:", result);
                fetchNoticeList(); // Refresh the notice list
                document.getElementById("updatePopup").style.display = "none";
            })
            .catch(error => console.error("Error updating notice:", error));
    });

    // Close the delete popup
    document.getElementById("closePopup").addEventListener("click", function () {
        const popup = document.getElementById("deletePopup");
        popup.style.display = "none";
        document.getElementById("overlay").style.display = "none";
    });

}