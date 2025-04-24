export function initTrainer_home() {
    console.log("initializing trainer home js");
    const noticeContent = document.getElementById("noticeContent");
    const readCheckbox = document.getElementById("readCheckbox");
    const dateDisplay = document.getElementById("dateDisplay");
    const progressBar = document.getElementById('gymProgress');
    const memberCountText = document.getElementById('memberCount');
    const noticeCountText = document.getElementById('noticeCount');
    const spinner = document.getElementById("loading-spinner");
    const noticeModal = document.getElementById("noticeModal");

    let notices = [];
    let currentNoticeIndex = 0;

    const today = new Date();
    const options = { weekday: 'long' };
    const dayOfWeek = today.toLocaleDateString('en-US', options);
    const formattedDate = `${dayOfWeek}, ${today.toLocaleDateString()}`;
    dateDisplay.textContent = formattedDate;

    document.getElementById("viewNoticesBtn").onclick = function () {
        displayNotice();
    };

    document.getElementById("prevNoticeBtn").onclick = function () {
        if (currentNoticeIndex > 0) {
            currentNoticeIndex--;
            displayNotice();
        }
    };

    document.getElementById("nextNoticeBtn").onclick = function () {
        if (currentNoticeIndex < notices.length - 1) {
            currentNoticeIndex++;
            displayNotice();
        }
    };

    document.getElementById("closeModal").onclick = function () {
        noticeModal.style.display = "none";
    };

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    function fetchAndDisplayNotices() {
        console.log("Fetching notices...");
        spinner.classList.remove("hidden");

        const formData = new FormData();
        formData.append("action", "get_personal_notices");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            spinner.classList.add("hidden");
            return;
        }

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                notices = data.filter(notice => {
                    const publishDate = new Date(notice.PublishDate);
                    const expiryDate = new Date(publishDate);
                    const duration = parseInt(notice.duration) || 0;
                    expiryDate.setDate(publishDate.getDate() + duration);

                    return publishDate <= today && expiryDate >= today;
                });

                currentNoticeIndex = 0;
                noticeCountText.textContent = `Notices Available: ${notices.length}`;
            })
            .catch(error => {
                console.error("Failed to load notices:", error);
                noticeContent.textContent = "Failed to load notices.";
                showToast("Failed to fetch notices.", "error");
            })
            .finally(() => {
                spinner.classList.add("hidden");
            });
    }

    function displayNotice() {
        const total = notices.length;

        if (total === 0) {
            document.getElementById("modalNoticeTitle").textContent = "No Notices Available";
            document.getElementById("modalNoticeDescription").textContent = "";
            document.getElementById("markAsReadBtn").style.display = "none";
            document.getElementById("prevNoticeBtn").style.display = "none";
            document.getElementById("nextNoticeBtn").style.display = "none";
            document.getElementById("noticeIndexDisplay").style.display = "none";
        } else {
            const currentNotice = notices[currentNoticeIndex];
            document.getElementById("modalNoticeTitle").textContent = currentNotice.title;
            document.getElementById("modalNoticeDescription").textContent = currentNotice.description;

            document.getElementById("noticeIndexDisplay").textContent = `${currentNoticeIndex + 1} of ${total}`;
            document.getElementById("prevNoticeBtn").disabled = currentNoticeIndex === 0;
            document.getElementById("nextNoticeBtn").disabled = currentNoticeIndex === total - 1;

            const markBtn = document.getElementById("markAsReadBtn");
            markBtn.style.display = "inline-block";
            markBtn.onclick = function () {
                markNoticeAsRead(currentNotice.notice_id);
            };
        }

        noticeModal.style.display = "flex";
    }

    function markNoticeAsRead(noticeId) {
        console.log("Marking notice as read... ", noticeId);

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            showToast("Authentication error. Please log in.", "error");
            return;
        }

        spinner.classList.remove("hidden");

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=mark_notice_as_read", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notice_id: noticeId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message) {
                    showToast("Marked as read!");
                    if (notice.length > 1) {
                        currentNoticeIndex++;
                        noticeCountText.textContent = `Notices Available: ${notices.length - currentNoticeIndex}`;
                        displayNotice();             
                    }

                } else {
                    console.error("Failed to mark notice as read.", data);
                    showToast("Failed to mark as read.", "error");
                }
            })
            .catch(err => {
                console.error("Error marking notice as read:", err);

            })
            .finally(() => {
                spinner.classList.add("hidden");
            });
    }

    function updateGymData() {
        spinner.classList.remove("hidden");
        console.log("Updating gym data...");

        const formData = new FormData();
        formData.append("action", "get_gym_crowd");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            spinner.classList.add("hidden");
            return;
        }

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        })
            .then(res => res.json())
            .then(gymData => {
                const totalMembers = gymData.count;
                const percentagePresent = gymData.percentage;

                progressBar.value = percentagePresent;
                memberCountText.textContent = `Members Present: ${totalMembers} (${Math.round(percentagePresent)}%)`;
            })
            .catch(error => {
                console.error("Error fetching gym data:", error);
                showToast("Failed to load gym data.", "error");
            })
            .finally(() => {
                spinner.classList.add("hidden");
            });
    }

    // Init
    fetchAndDisplayNotices();
    updateGymData();
}