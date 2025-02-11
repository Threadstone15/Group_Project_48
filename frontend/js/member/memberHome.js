const noticeContent = document.getElementById("noticeContent");
const readCheckbox = document.getElementById("readCheckbox");
let notices = [];
let currentNoticeIndex = 0;

const crowdStatus = document.getElementById("crowdStatus");
const memberCount = document.getElementById("memberCount");
const crowdIndicator = document.getElementById("crowdIndicator");
const dateDisplay = document.getElementById("dateDisplay");
const toggleCheckbox = document.getElementById("toggle");
const progressBar = document.getElementById('gymProgress');


const today = new Date();
const options = { weekday: 'long' };
const dayOfWeek = today.toLocaleDateString('en-US', options);
const formattedDate = `${dayOfWeek}, ${today.toLocaleDateString()}`;
dateDisplay.textContent = formattedDate;


toggleCheckbox.addEventListener("change", function () {
    const arrived = this.checked ? 1 : 0; 
    console.log("Arrived:", arrived);
    updateAttendance(arrived);
});

function updateAttendance(arrived) {
    const formData = new FormData();
    formData.append("date", new Date().toISOString().split('T')[0]); // Current date in YYYY-MM-DD format
    formData.append("time", new Date().toLocaleTimeString()); // Current time
    formData.append("arrived", arrived);
    formData.append("action", "update_attendance");

    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
        console.error("Auth token not found. Please log in.");
        return;
    }

    const requestOptions = {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData,
        redirect: 'follow'
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php", requestOptions)
        .then(response => {
            if (!response.ok) throw new Error("Failed to update attendance");
            return response.json();
        })
        .then(result => {
            console.log("Attendance updated successfully:", result);
            alert("Attendance updated successfully!");
        })
        .catch(error => {
            console.error("Error updating attendance:", error);
            alert("Failed to update attendance");
        });
}

fetch("get_notices.php")
 .then(response => response.json())
 .then(data => {
     notices = data;
     displayNotice();
 });

function displayNotice() {
 if (currentNoticeIndex < notices.length) {
     noticeContent.textContent = notices[currentNoticeIndex].content;
     readCheckbox.checked = false;
 } else {
     noticeContent.textContent = "No more notices.";
     readCheckbox.style.display = "none";
 }
}

readCheckbox.addEventListener("change", function() {
 if (this.checked && currentNoticeIndex < notices.length) {
     const noticeId = notices[currentNoticeIndex].id;

     // Mark the notice as read in the backend
     fetch("mark_notice_read.php", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ id: noticeId })
     })
     .then(response => response.json())
     .then(data => {
         if (data.success) {
             currentNoticeIndex++;
             displayNotice();
         }
     });
 }
});

function updateGymData() {
    const formData = new FormData();
    formData.append("action", "get_daily_attendance");

    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
        console.error("Auth token not found. Please log in.");
        return;
    }

    const requestOptions = {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData,
        redirect: 'follow'
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php", requestOptions)
        .then(response => response.json())
        .then(gymData => {
            const totalMembers = gymData.count;
            const percentagePresent = gymData.percentage;

            console.log("Total Members:", totalMembers);
            console.log("Percentage Present:", percentagePresent);

            progressBar.value = percentagePresent;

            const memberCountText = document.getElementById('memberCount');
            memberCountText.textContent = `Members Present: ${totalMembers} (${Math.round(percentagePresent)}%)`;

        })
        .catch(error => console.error("Error fetching gym data:", error));
}
function loadHTMLFile(url, targetElement) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.querySelector(targetElement).innerHTML = data;
        })
        .catch(error => console.error('Error loading HTML:', error));
}

// Function to load a CSS file dynamically
function loadCSSFile(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

// Function to load a JS file dynamically
function loadJSFile(url) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    document.body.appendChild(script);
}

// Loading the calendar component
window.onload = function () {
    loadHTMLFile('/Group_Project_48/frontend/components/calendar/calendar.html', '#calendar-placeholder');
    loadCSSFile('/Group_Project_48/frontend/components/calendar/calendar.css'); 
    loadJSFile('/Group_Project_48/frontend/components/calendar/calendar.js');
    updateGymData();
};
