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
      `;

      const [startHours, startMinutes] = classObj.start_time.split(':').map(Number);
      const classDateTime = new Date(classObj.date);
      classDateTime.setHours(startHours, startMinutes, 0, 0);

      const currentDate = new Date();
      if (classDateTime > currentDate) {
        events += `
          <div class="event-handle">
            <button class="update-button" id="updateClass" data-class-id="${classObj.class_id}" >Update</button>
            <button class="delete-button" id="deleteClass" data-class-id="${classObj.class_id}">Delete</button>
          </div>
        `;
      }
      events += `</div>`;  //adding closing div to make sure all elements are fit inside one div -> for styling
    }
  });

  if (events === "") {
    events = `<div class="no-event"><h3>No Classes Scheduled</h3></div>`;
  }
  eventsContainer.innerHTML = events;
}

//attaching event handlers for class events
eventsContainer.addEventListener('click', (event) => {
  if (event.target.id == "updateClass") {
    const classId = event.target.getAttribute('data-class-id');
    openUpdatePopup(classId);
  }
  if (event.target.id == "deleteClass") {
    const classId = event.target.getAttribute('data-class-id');
    openDeletePopup(classId);
  }
});

function openUpdatePopup(class_id) {
  const selectedClass = allClasses.find(cls => cls.class_id === class_id);

  document.getElementById("updateClassId").value = selectedClass.class_id;
  document.getElementById("updateClassName").value = selectedClass.className;
  document.getElementById("updateClassDate").value = selectedClass.date;
  document.getElementById("updateStartTime").value = selectedClass.start_time;
  document.getElementById("updateEndTime").value = selectedClass.end_time;
  document.getElementById("updateDescription").value = selectedClass.description;

  document.getElementById("updatePopup").style.display = "block";
}

document.getElementById("closeUpdatePopup").onclick = () => {
  document.getElementById("updatePopup").style.display = "none";
};

//update class infoo
document.getElementById("updateForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const classId = document.getElementById("updateClassId").value;
  const className = document.getElementById("updateClassName").value;
  const classDate = document.getElementById("updateClassDate").value;
  const startTime = document.getElementById("updateStartTime").value;
  const endTime = document.getElementById("updateEndTime").value;
  const description = document.getElementById("updateDescription").value;

  if (!classDate || !startTime || !endTime || !className || !description) {
    showFormResponse("updateFormResponse", "Fields cannot be empty", "error");
    return;
  }
  if (startTime && endTime && startTime >= endTime) {
    showFormResponse("updateFormResponse", " End time must be after start time", "error");
    return;
  }

  //min clz duration is 1hr
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  if (durationMinutes < 60) {
    showFormResponse("updateFormResponse", "Minimum class duration is 1 hour", "error");
    return;
  }
  // start time and end time must be between 8am - 10pm
  if (startH < 8 || endH > 22 || (endH === 22 && endM > 0)) {
    showFormResponse("updateFormResponse", "Classes must be between 8:00 AM and 10:00 PM", "error");
    return;
  }

  const payload = {
    "class_id": classId,
    "className": className,
    "description": description,
    "date": classDate,
    "start_time": startTime,
    "end_time": endTime
  };

  const authToken = localStorage.getItem("authToken");

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    redirect: 'follow'
  };

  fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=update_class", requestOptions)
    .then(response => {
      return response.json().then(data => {
        if (data.error && data.error === "Token expired") {
          throw new Error("Token expired");
        }
        if (!response.ok) throw new Error("Failed to update the class");
        return data;
      });
    })
    .then(data => {
      if (data.message) {
        switch (data.message) {
          case "Class details updated successfully":
            showToast(data.message, "success");
            setTimeout(() => {
              document.getElementById("updatePopup").style.display = "none";
            }, 3000);
            fetchClasses();
            break;
          case "Requested Time Slot is not available":
            showToast(`${data.message} <br> ${data.conflicts}`, "error");
            break;
        }
      }
      if (data.error) {
        showToast(data.error, "error");
      }
    })
    .catch(error => {
      console.warn(error.message);
      if (error.message === "Token expired") {
        showToast("Your session has timed out. Please log in again", "error");
        setTimeout(() => {
          runSessionTimedOut();
        }, 4000);
      } else {
        console.error("Error: " + error.message);
      }
    });
});

function openDeletePopup(class_id) {
  const deletePopup = document.getElementById("deletePopup");
  deletePopup.style.display = "block";

  document.getElementById("confirmDelete").onclick = () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      showToast("Auth token not found. Please log in.");
      navigate("login");
      return;
    }

    const requestOptions = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      redirect: 'follow'
    };

    fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=delete_class&class_id=${class_id}`, requestOptions)
      .then(response => {
        return response.json().then(data => {
          if (data.error && data.error === "Token expired") {
            throw new Error("Token expired");
          }
          if (!response.ok) throw new Error("Failed to delete the class");
          return data;
        });
      })
      .then(data => {
        if (data.message) {
          showToast(data.message, "success");
          setTimeout(() => {
            document.getElementById("updatePopup").style.display = "none";
          }, 3000);
          setTimeout(() => {
            deletePopup.style.display = "none";
          }, 3000);
          fetchClasses();
        }
        if (data.error) {
          showToast(data.error, "error");
        }
      })
      .catch(error => {
        console.warn(error.message);
        if (error.message === "Token expired") {
          showToast("Your session has timed out. Please log in again", "error");
          setTimeout(() => {
            runSessionTimedOut();
          }, 4000);
        } else {
          console.error("Error: " + error.message);
        }
      });
  };

  document.getElementById("cancelDelete").onclick = () => {
    deletePopup.style.display = "none";
  };
  document.getElementById("closeDeletePopup").onclick = () => {
    deletePopup.style.display = "none";
  };
}

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
  fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_classes", requestOptions)
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

function showFormResponse(formType, message, type) {
  const responseContainer = document.getElementById(formType);
  responseContainer.textContent = message;
  responseContainer.className = `form-response ${type}`;
  responseContainer.style.display = "block";

  setTimeout(() => {
    responseContainer.style.display = "none";
  }, 5000);
}


