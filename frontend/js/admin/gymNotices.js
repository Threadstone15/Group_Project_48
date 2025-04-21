export function initAdmim_gymNotices() {
    console.log("initializing gym notices js");
    const spinner = document.getElementById("loading-spinner");
    const noticeTable = document.getElementById("equipmentsTable");

    if (noticeTable) {
        fetchNoticeList();
    } else {
        console.warn("Notice table not found. Skipping fetch.");
    }

    function showSpinner() {
        if (spinner) spinner.style.display = 'block';
    }

    function hideSpinner() {
        if (spinner) spinner.style.display = 'none';
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    function fetchNoticeList() {
        console.log("Fetching Notices");
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Auth token not found. Please log in.", "error");
            return;
        }

        showSpinner();

        const requestOptions = {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${authToken}` },
            redirect: 'follow'
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_notices", requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch notice list");
                return response.json();
            })
            .then(data => {
                console.log("Fetched notice list:", data);
                const tableBody = noticeTable.querySelector("tbody");
                tableBody.innerHTML = "";

                if (data.length > 0) {
                    data.forEach(notice => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td style="display: none;">${notice.notice_id}</td> <!-- hidden notice_id column -->
                            <td>${notice.Title}</td>
                            <td>${notice.Description}</td>
                            <td>${notice.PublisherFullName}</td>
                            <td>${notice.Phone}</td>
                            <td>${notice.Duration}</td>
                            <td>${notice.PublishedDate}</td>
                            <td>
                                <button class="update-button" onclick="openUpdatePopup(this)">Update</button>
                                <button class="delete-button" onclick="deleteNotice('${notice.notice_id}')">Remove</button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    const noDataRow = document.createElement("tr");
                    noDataRow.innerHTML = `<td colspan="7" style="text-align: center;">No notices found</td>`;
                    tableBody.appendChild(noDataRow);
                }

                hideSpinner();
            })
            .catch(error => {
                console.error("Error fetching notice list:", error);
                showToast("Error fetching notice list", "error");
                hideSpinner();
            });
    }

    document.getElementById("publishBtn").addEventListener("click", function () {
        const noticeInput = document.getElementById("noticeInput").value.trim();
        const noticeInputTopic = document.getElementById("noticeInputTopic").value.trim();
        const noticeDuration = document.getElementById("noticeDuration").value.trim();

        if (!noticeInput || !noticeInputTopic || !noticeDuration || isNaN(noticeDuration) || noticeDuration <= 0) {
            showToast("Please fill all fields correctly", "error");
            return;
        }

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Auth token not found. Please log in.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("title", noticeInputTopic);
        formData.append("description", noticeInput);
        formData.append("duration", noticeDuration);
        formData.append("action", "add_notice");

        showSpinner();

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData,
            redirect: 'follow'
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add notice");
                return response.text();
            })
            .then(() => {
                showToast("Notice published successfully!", "success");
                fetchNoticeList();
                document.getElementById("noticeInput").value = "";
                document.getElementById("noticeInputTopic").value = "";
                document.getElementById("noticeDuration").value = "";
            })
            .catch(error => {
                console.error("Error adding notice:", error);
                showToast("Error publishing notice", "error");
            })
            .finally(hideSpinner);
    });

    window.deleteNotice = function (noticeId) {
        document.getElementById("overlay").style.display = "block";
        const popup = document.getElementById("deletePopup");
        popup.style.display = "block";

        document.getElementById("confirmDelete").onclick = () => {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                showToast("Auth token not found. Please log in.", "error");
                return;
            }

            showSpinner();

            fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=delete_notice&notice_id=${noticeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                redirect: 'follow'
            })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to delete notice");
                    return response.json();
                })
                .then(() => {
                    showToast("Notice deleted successfully!", "success");
                    fetchNoticeList();
                    popup.style.display = "none";
                    document.getElementById("overlay").style.display = "none";
                })
                .catch(error => {
                    console.error("Error deleting notice:", error);
                    showToast("Error deleting notice", "error");
                })
                .finally(hideSpinner);
        };

        window.setupDeletePopupHandlers();
    };

    window.setupDeletePopupHandlers = function () {
        document.getElementById("cancelDelete").onclick = window.closeDeletePopup;
        document.getElementById("closePopup").onclick = window.closeDeletePopup;
    };

    window.closeDeletePopup = function () {
        document.getElementById("deletePopup").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    };

    window.openUpdatePopup = function (button) {
        const row = button.closest("tr");
        document.getElementById("updateNoticeId").value = row.cells[0].textContent;
        document.getElementById("updateNoticeTitle").value = row.cells[1].textContent;
        document.getElementById("updateNoticeDescription").value = row.cells[2].textContent;
        document.getElementById("updateNoticeDuration").value = row.cells[5].textContent;

        document.getElementById("overlay").style.display = "block";
        document.getElementById("updatePopup").style.display = "block";
    };

    window.closeUpdatePopup = () => {
        document.getElementById("updatePopup").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    };
    document.getElementById("closeUpdatePopup").onclick = window.closeUpdatePopup;

    document.getElementById("updateForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const noticeId = document.getElementById("updateNoticeId").value;
        const title = document.getElementById("updateNoticeTitle").value.trim();
        const description = document.getElementById("updateNoticeDescription").value.trim();
        const duration = document.getElementById("updateNoticeDuration").value.trim();

        if (!title || !description || !duration || isNaN(duration) || duration <= 0) {
            showToast("Invalid input in update form", "error");
            return;
        }

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Auth token not found. Please log in.", "error");
            return;
        }

        const payload = JSON.stringify({ notice_id: noticeId, title, description, duration });

        showSpinner();

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=update_notice", {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: payload,
            redirect: 'follow'
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to update notice");
                return response.json();
            })
            .then(() => {
                showToast("Notice updated successfully!", "success");
                window.closeUpdatePopup();
                fetchNoticeList();
            })
            .catch(error => {
                console.error("Error updating notice:", error);
                showToast("Error updating notice", "error");
            })
            .finally(hideSpinner);
    });
}

