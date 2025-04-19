export function initAdmin_home() {
    console.log("Initializing adminHome.js");

    const noticeContent = document.getElementById("noticeContent");
    const readCheckbox = document.getElementById("readCheckbox");
    const dateDisplay = document.getElementById("dateDisplay");
    const progressBar = document.getElementById('gymProgress');
    const memberCountText = document.getElementById('memberCount');
    const noticeCountText = document.getElementById('noticeCount');

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
            // ✅ Update notice count
            noticeCountText.textContent = `Notices Available: ${notices.length}`;

        })
        .catch(error => {
            console.error("Failed to load notices:", error);
            noticeContent.textContent = "Failed to load notices.";
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
    
            // Index display
            document.getElementById("noticeIndexDisplay").textContent = `${currentNoticeIndex + 1} of ${total}`;
    
            // Show/hide nav buttons
            document.getElementById("prevNoticeBtn").disabled = currentNoticeIndex === 0;
            document.getElementById("nextNoticeBtn").disabled = currentNoticeIndex === total - 1;
    
            document.getElementById("markAsReadBtn").style.display = "inline-block";
            document.getElementById("markAsReadBtn").onclick = function () {
                markNoticeAsRead(currentNotice.notice_id);
            };
        }
    
        document.getElementById("noticeModal").style.display = "flex";
    }
    

    document.getElementById("closeModal").onclick = function () {
        document.getElementById("noticeModal").style.display = "none";
    };

    function markNoticeAsRead(noticeId) {
        console.log("Marking notice as read... ", noticeId);
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return console.error("Auth token not found. Please log in.");
    
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=mark_notice_as_read", {
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
                console.log("Notice marked as read.");
                currentNoticeIndex++;
                noticeCountText.textContent = `Notices Available: ${notices.length - currentNoticeIndex}`;
                displayNotice();  // show next
            } else {
                console.error("Failed to mark notice as read.", data);
            }
        })
        .catch(err => {
            console.error("Error marking notice as read:", err);
        });
    }
    

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
