let date = new Date();
let year = date.getFullYear();
let month = date.getMonth();

const day = document.querySelector(".calendar-dates");

const noticeContent = document.getElementById("noticeContent");
const readCheckbox = document.getElementById("readCheckbox");
let notices = [];
let currentNoticeIndex = 0;

const crowdStatus = document.getElementById("crowdStatus");
const memberCount = document.getElementById("memberCount");
const crowdIndicator = document.getElementById("crowdIndicator");
const dateDisplay = document.getElementById("dateDisplay");

const currdate = document
    .querySelector(".calendar-current-date");

const prenexIcons = document
    .querySelectorAll(".calendar-navigation span");

// Array of month names
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

// Function to generate the calendar
const manipulate = () => {

    let dayone = new Date(year, month, 1).getDay();
    let lastdate = new Date(year, month + 1, 0).getDate();
    let dayend = new Date(year, month, lastdate).getDay();
    let monthlastdate = new Date(year, month, 0).getDate();
    let lit = "";


    for (let i = dayone; i > 0; i--) {
        lit +=
            `<li class="inactive">${monthlastdate - i + 1}</li>`;
    }

    for (let i = 1; i <= lastdate; i++) {

        let isToday = i === date.getDate()
            && month === new Date().getMonth()
            && year === new Date().getFullYear()
            ? "active"
            : "";
        lit += `<li class="${isToday}">${i}</li>`;
    }

    for (let i = dayend; i < 6; i++) {
        lit += `<li class="inactive">${i - dayend + 1}</li>`
    }

    currdate.innerText = `${months[month]} ${year}`;
    day.innerHTML = lit;
}

manipulate();


prenexIcons.forEach(icon => {

    icon.addEventListener("click", () => {
        month = icon.id === "calendar-prev" ? month - 1 : month + 1;

 
        if (month < 0 || month > 11) {

            date = new Date(year, month, new Date().getDate());
            year = date.getFullYear();
            month = date.getMonth();
        }

        else {
            date = new Date();
        }

        manipulate();
    });
});

// Fetch unread notices from backend
fetch("get_notices.php")
 .then(response => response.json())
 .then(data => {
     notices = data;
     displayNotice();
 });

// Display the current notice
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
