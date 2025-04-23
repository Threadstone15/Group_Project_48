import { navigate } from "../../../js/router.js";
import { runSessionTimedOut } from "../../../js/routeConfig.js";

const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

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
  "December",
];

let allClasses = [];
fetchClasses();

//function to add days in days with class day and prev-date next-date on previous month and next month days and active on today
//generates and displays the calendar grid
function initCalendar() {
  const firstDay = new Date(year, month, 1); // First day of current month
  const lastDay = new Date(year, month + 1, 0); // Last day of current month
  const prevLastDay = new Date(year, month, 0); // Last day of previous month
  const prevDays = prevLastDay.getDate(); // Total days in previous month
  const lastDate = lastDay.getDate(); // Total days in current month
  const day = firstDay.getDay(); // Day of week for 1st of month (0=Sun, 6=Sat)
  const nextDays = 7 - lastDay.getDay() - 1; // Days needed from next month

  date.innerHTML = months[month] + " " + year;

  let days = "";

  //prev month's days
  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  //curent months days
  for (let i = 1; i <= lastDate; i++) {
    //check if class is present on that day -> here the current day is highlighted and class days are makred
    let event = false;
    allClasses.forEach((classObj) => {
      const dateObj = new Date(classObj.date);
      const classYear = dateObj.getFullYear();  // 2025
      const classMonth = dateObj.getMonth() + 1; // 4 (months are 0 indexed)
      const classDate = dateObj.getDate();       // 14
      if (
        classDate === i &&
        classMonth === month + 1 &&
        classYear === year
      ) {
        event = true;
      }
    });
    if (i === new Date().getDate() && year === new Date().getFullYear() && month === new Date().getMonth()) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
      if (event) {
        days += `<div class="day today active event">${i}</div>`;
      } else {
        days += `<div class="day today active">${i}</div>`;
      }
    } else { //not current date -> a regular day
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day ">${i}</div>`;
      }
    }
  }

  //nexxt month days
  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListner();
}

//function to add month and year on prev and next button
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);

initCalendar();

//function to add active on day
function addListner() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      getActiveDay(e.target.innerHTML);
      updateEvents(Number(e.target.innerHTML));
      activeDay = Number(e.target.innerHTML);
      //remove active
      days.forEach((day) => {
        day.classList.remove("active");
      });
      //if clicked prev-date or next-date switch to that month
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        //add active to clicked day afte month is change
        setTimeout(() => {
          //add active where no prev-date or next-date
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        //add active to clicked day afte month is changed
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  if (e.inputType === "deleteContentBackward") {
    if (dateInput.value.length === 3) {
      dateInput.value = dateInput.value.slice(0, 2);
    }
  }
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  showToast("Invalid Date", "error");
}

//function get active day day name and date and update eventday eventdate
function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;

  const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  document.getElementById("classDate").dataset.currentDate = formattedDate;
}

//function update events when a day is active  -> displays events for the selected day
function updateEvents(date) {
  let events = "";
  allClasses.forEach((classObj) => {
    const dateObj = new Date(classObj.date);
    const classYear = dateObj.getFullYear();
    const classMonth = dateObj.getMonth() + 1;
    const classDate = dateObj.getDate();

    if (date === classDate && month + 1 === classMonth && year === classYear) {
      events += `<div class="event">
          <div class="title">
            <i class="fas fa-circle"></i>
            <h3 class="event-title">${classObj.className}</h3>
          </div>
          <div class="event-time">
            <span>${classObj.start_time} - ${classObj.end_time}</span>
          </div>
          <div class="event-trainer">
            <span> Trainer Name : ${classObj.trainerName}</span>
          </div>
          <div class="event-desc">
            <span>${classObj.description}</span>
          </div>
          <div class="event-desc">
            <span> No of participants : ${classObj.noOfParticipants}</span>
          </div>
          ${Number(classObj.noOfParticipants) > 0 ?
          `
          <div class="event-handle">
            <button class="view-button" id="viewEnrolledList" data-class-id="${classObj.class_id}">View Enrolled List</button>
          </div>
        ` : ``
        }
      </div>`;
    }
  });

  if (events === "") {
    events = `<div class="no-event"><h3>No Classes Scheduled</h3></div>`;
  }
  eventsContainer.innerHTML = events;
}

//attaching event handlers for class events
eventsContainer.addEventListener('click', (event) => {
  if (event.target.id == "viewEnrolledList") {
    const classId = event.target.getAttribute('data-class-id');
    fetchEnrolledMemberListOfClass(classId);
  }
});

//fetching the classes
function fetchClasses() {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    showToast("Auth token not found. Please log in.", "error");
    navigate("login");
    return;
  }

  const requestOptions = {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${authToken}` },
    redirect: 'follow'
  };
  fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_classes", requestOptions)
    .then(response => {
      return response.json().then(data => {
        if (data.error && data.error === "Token expired") {
          throw new Error("Token expired");
        }
        if (!response.ok) throw new Error("Failed to fetch trainer classes/sessions");
        return data;
      });
    })
    .then(data => {
      if (data.error) {
        showToast(data.error, "error");
      }
      if (data.length > 0) {
        allClasses = data;
        initCalendar();
      }
    })
    .catch(error => {
      console.warn(error.message, "error");
      if (error.message === "Token expired") {
        showToast("Your session has timed out. Please log in again", "error");
        setTimeout(() => {
          runSessionTimedOut();
        }, 4000);
      } else {
        console.error("Error: " + error.message);
      }
    });
}

function fetchEnrolledMemberListOfClass(classId) {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    showToast("Auth token not found. Please log in.", "error");
    navigate("login");
    return;
  }
  const payload = {
    "class_id": classId
  }

  const requestOptions = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
  }

  fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_enrolled_member_list_of_class", requestOptions)
    .then(response => {
      return response.json().then(data => {
        if (data.error && data.error === "Token expired") {
          throw new Error("Token expired");
        }
        if (!response.ok) throw new Error("Failed to fetch enrolled list of members");
        return data;
      });
    })
    .then(data => {
      if (data.error) {
        showToast(data.error, "error");
      } else {
        console.log(data);
        displayEnrolledMemberList(data);
      }
    })
    .catch(error => {
      console.warn(error.message, "error");
      if (error.message === "Token expired") {
        showToast("Your session has timed out. Please log in again", "error");
        setTimeout(() => {
          runSessionTimedOut();
        }, 4000);
      } else {
        console.error("Error: " + error.message);
      }
    });
}

function displayEnrolledMemberList(participants) {
  const participantsTable = document.getElementById("participantsTable");
  //clearing table body
  const participantsTableBody = participantsTable.getElementsByTagName("tbody")[0];
  participantsTableBody.innerHTML = '';

  participants.forEach(participant => {
    console.log(participant.member_id);
    console.log(participant.phone);
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${participant['fullName']}</td>
            <td>${participant['phone']}</td>
        `;
    participantsTableBody.appendChild(row);
  });

  //displaying the popup
  document.getElementById("view-enrolled-members-popup").style.display = "block";
}

document.getElementById("close-enrolled-members-popup").onclick = () => {
  document.getElementById("view-enrolled-members-popup").style.display = "none";
};

function showToast(message, type) {
  // invoking toast container of parent window-> ownerHome.html
  if (window.parent !== window) {
    window.parent.postMessage({
      call: 'SHOW_TOAST',
      message: message,
      toastType: type
    }, '*');
  }
  // Fallback for direct access
  else {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
  }
}


