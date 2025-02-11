const noticeContent = document.getElementById("noticeContent");
const readCheckbox = document.getElementById("readCheckbox");
let notices = [];
let currentNoticeIndex = 0;

const crowdStatus = document.getElementById("crowdStatus");
const memberCount = document.getElementById("memberCount");
const crowdIndicator = document.getElementById("crowdIndicator");
const dateDisplay = document.getElementById("dateDisplay");
const toggleCheckbox = document.getElementById("toggle");

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

fetch("get_gym_data.php")
        .then(response => response.json())
        .then(gymData => {
            dateDisplay.textContent = gymData.date;
            memberCount.textContent = `Members Present: ${gymData.members_present}`;
            crowdStatus.textContent = `Crowd Level: ${gymData.crowd_level}`;

            if (gymData.crowd_level === "Low") {
                crowdIndicator.classList.add("low");
            } else if (gymData.crowd_level === "Moderate") {
                crowdIndicator.classList.add("moderate");
            } else if (gymData.crowd_level === "High") {
                crowdIndicator.classList.add("high");
            }
    })
    .catch(error => console.error("Error fetching gym data:", error));

//loading task-calendar component
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
};
