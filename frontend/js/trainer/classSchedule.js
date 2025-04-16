import { runSessionTimedOut } from "../routeConfig.js";
import { navigate } from "../router.js";

export function initTrainer_classSchedule() {
    console.log("initializing clss schedule js");

    document.getElementById('scheduleClassForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const classDate = document.getElementById("classDate").value;
        const startTime = document.getElementById("startTime").value;
        const endTime = document.getElementById("endTime").value;
        const className = document.getElementById("lessonName").value;
        const description = document.getElementById("description").value;


        if (!classDate || !startTime || !endTime || !className || !description) {
            showFormResponse("class-schedule-form-response", "Fields cannot be empty", "error");
            return;
        }
        if (startTime && endTime && startTime >= endTime) {
            showFormResponse("class-schedule-form-response", " End time must be after start time", "error");
            return;
        }

        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() + 7);

        const selectedDate = new Date(classDate);

        if (selectedDate < today) {
            showFormResponse("class-schedule-form-response", "Class date cannot be in the past", "error");
            return;
        }
        //trainer should schedule the class minimun 7 days prior to the disired date
        if (selectedDate < minDate) {
            showFormResponse(
                "class-schedule-form-response",
                "Please select a date at least 7 days from today (For member convenience, classes must be scheduled at least 7 days in advance)",
                "error"
            );
            return;
        }

        //min clz duration is 1hr
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (durationMinutes < 60) {
            showFormResponse("class-schedule-form-response", "Minimum class duration is 1 hour", "error");
            return;
        }
        // start time and end time must be between 8am - 10pm
        if (startH < 8 || endH > 22 || (endH === 22 && endM > 0)) {
            showFormResponse("class-schedule-form-response", "Classes must be between 8:00 AM and 10:00 PM", "error");
            return;
        }

        const payload = {
            "className": className,
            "description": description,
            "date": classDate,
            "start_time": startTime,
            "end_time": endTime
        };

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            navigate('login');
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload),
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=add_class", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to schedule the class");
                    return data;
                });
            })
            .then(data => {
                if (data.message) {
                    switch (data.message) {
                        case "Class is Scheduled Successfully":
                            showToast(data.message, "success");
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
    });

    function showFormResponse(formType, message, type) {
        console.log("Displaying message:", message, "Type:", type); // Debugging log
        const responseContainer = document.getElementById(formType);
        responseContainer.textContent = message;
        responseContainer.className = `form-response ${type}`;
        responseContainer.style.display = "block";

        setTimeout(() => {
            responseContainer.style.display = "none";
        }, 5000);
    }

    function showToast(message, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}