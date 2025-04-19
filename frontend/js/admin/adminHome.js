export function initAdmin_home() {
    console.log("Initializing adminHome.js");

    const noticeContent = document.getElementById("noticeContent");
    const readCheckbox = document.getElementById("readCheckbox");
    const dateDisplay = document.getElementById("dateDisplay");
    const progressBar = document.getElementById('gymProgress');
    const memberCountText = document.getElementById('memberCount');

    let notices = [];
    let currentNoticeIndex = 0;

    const today = new Date();
    const options = { weekday: 'long' };
    const dayOfWeek = today.toLocaleDateString('en-US', options);
    const formattedDate = `${dayOfWeek}, ${today.toLocaleDateString()}`;
    dateDisplay.textContent = formattedDate;

    function fetchAndDisplayNotices() {

        console.log("Fetching notices...");
        const formData = new FormData();
        formData.append("action", "get_personal_notices");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) return console.error("Auth token not found. Please log in.");

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php", {
            method: "POST",
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log("Fetched notices:", data);
                notices = data.filter(notice => {
                    const publishDate = new Date(notice.PublishDate);
                    const expiryDate = new Date(publishDate);
                    const duration = parseInt(notice.duration) || 0;
                    expiryDate.setDate(publishDate.getDate() + duration);
                
                    console.log(`Publish Date: ${publishDate}, Expiry Date: ${expiryDate}`);
                
                    return publishDate <= today && expiryDate >= today;
                });
                currentNoticeIndex = 0;
                displayNotice();
            })
            .catch(error => {
                console.error("Failed to load notices:", error);
                noticeContent.textContent = "Failed to load notices.";
            });
    }

    function displayNotice() {
        if (currentNoticeIndex < notices.length) {
            const currentNotice = notices[currentNoticeIndex];
            noticeContent.textContent = currentNotice.description;
            readCheckbox.checked = !!currentNotice.is_read;
            readCheckbox.style.display = "inline";
        } else {
            noticeContent.textContent = "No more notices.";
            readCheckbox.style.display = "none";
        }
    }

    readCheckbox.addEventListener("change", function () {
        if (currentNoticeIndex >= notices.length) return;

        const currentNotice = notices[currentNoticeIndex];
        const newStatus = this.checked;

        fetch("mark_notice_read.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: currentNotice.id, is_read: newStatus })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    notices[currentNoticeIndex].is_read = newStatus;
                    // Optional: auto-move to next notice if marked read
                    if (newStatus) {
                        currentNoticeIndex++;
                        displayNotice();
                    }
                } else {
                    console.error("Failed to update notice status.");
                }
            })
            .catch(err => console.error("Error marking notice read/unread:", err));
    });

    function updateGymData() {
        console.log("Updating gym data...");
        const formData = new FormData();
        formData.append("action", "get_gym_crowd");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) return console.error("Auth token not found. Please log in.");

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        })
            .then(res => res.json())
            .then(gymData => {
                const totalMembers = gymData.count;
                const percentagePresent = gymData.percentage;

                console.log("Total Members:", totalMembers);
                console.log("Percentage Present:", percentagePresent);

                progressBar.value = percentagePresent;
                memberCountText.textContent = `Members Present: ${totalMembers} (${Math.round(percentagePresent)}%)`;
            })
            .catch(error => console.error("Error fetching gym data:", error));
    }

    // Init functions
    fetchAndDisplayNotices();
    updateGymData();

    window.addEventListener('message', (event) => {
        if (event.data.call === 'SHOW_TOAST') {
            const container = document.getElementById('global-toast-container');
            const toast = document.createElement('div');
            toast.className = `global-toast ${event.data.toastType}`;
            toast.innerHTML = event.data.message;
            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 4000);
        }
    });
}
