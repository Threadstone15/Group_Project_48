import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";

export function initMember_trackProgress() {
    console.log("initialzing trackProgress.js");
    fetchLastWeeklyPogressOfMember();

    let currentWeekProgressInfo = null;
    let currentWeekWorkoutProgress = null;
    console.log("initialzing trackProgress.js");

    function fetchLastWeeklyPogressOfMember() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const requestOptions = {
            method: "GET",
            headers: { "Authorization": `Bearer ${authToken}` },
            redirect: "follow"
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_last_weekly_progress", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to fetch the last weekly progress");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                } else {
                    currentWeekProgressInfo = data;
                    currentWeekWorkoutProgress = JSON.parse(currentWeekProgressInfo.weekly_progress);
                    displayCurrentWeekProgress(currentWeekWorkoutProgress);
                }
            })
            .catch(error => {
                console.error("API Error:", error.message);
                if (error.message === "Token expired") {
                    runSessionTimedOut();
                } else {
                    showToast(error.message, "error");
                }
            });
    }

    function displayCurrentWeekProgress(progress) {
        console.log(progress);
        const logProgressForms = document.getElementById("log-progress-forms");
        logProgressForms.innerHTML = ""; // Clear previous content

        console.log("hehe1");

        // Set week number
        const weekNo = document.getElementById("week-no");
        weekNo.innerHTML = `Week ${currentWeekProgressInfo.week_number}`;

        progress.forEach((dayProgress, dayIndex) => {
            const dayCard = document.createElement("div");
            dayCard.className = "day-card";

            const dayTitle = document.createElement("h4");
            dayTitle.textContent = `Day ${dayProgress.day}`;
            dayCard.appendChild(dayTitle);

            //real time day -> according to exercise day
            if (dayProgress.completedAt !== null) {
                const dayProgressDate = document.createElement("p");
                dayProgressDate.textContent = `Date : ${dayProgress.completedAt}`;
                dayCard.appendChild(dayProgressDate);
            }

            // Exercises list
            dayProgress.exercises.forEach((exercise, exIndex) => {
                const exerciseContainer = document.createElement("div");
                exerciseContainer.style.margin = "10px 0";

                const name = document.createElement("p");
                name.innerHTML = `<strong>Exercise:</strong> ${exercise.name}`;
                exerciseContainer.appendChild(name);

                const setsReps = document.createElement("p");
                setsReps.innerHTML = `<strong>Sets:</strong> ${exercise.sets}, <strong>Reps:</strong> ${exercise.reps}`;
                exerciseContainer.appendChild(setsReps);

                const setsCompletedLabel = document.createElement("label");
                setsCompletedLabel.textContent = "Sets Completed: ";
                const setsCompletedInput = document.createElement("input");
                setsCompletedInput.type = "number";
                setsCompletedInput.min = 0;
                setsCompletedInput.value = exercise.sets_completed || 0;
                setsCompletedInput.name = `day${dayIndex}-exercise${exIndex}`;
                setsCompletedInput.style.marginLeft = "10px";

                setsCompletedLabel.appendChild(setsCompletedInput);
                exerciseContainer.appendChild(setsCompletedLabel);

                dayCard.appendChild(exerciseContainer);
            });

            // Update button
            const updateBtn = document.createElement("button");
            updateBtn.textContent = "Update Progress";
            updateBtn.classList.add("update-button");

            updateBtn.addEventListener("click", () => {
                let allCompleted = true;

                dayProgress.exercises.forEach((exercise, exIndex) => {
                    const inputName = `day${dayIndex}-exercise${exIndex}`;
                    const input = document.querySelector(`input[name="${inputName}"]`);
                    const newCompletedSets = parseInt(input.value);

                    if (isNaN(newCompletedSets) || newCompletedSets < 0 || newCompletedSets > exercise.sets) {
                        showToast("Invalid input for sets completed.", "error");
                        return;
                    }

                    // Update the corresponding exercise in the main data structure
                    currentWeekWorkoutProgress[dayIndex].exercises[exIndex].sets_completed = newCompletedSets;

                    if (newCompletedSets < exercise.sets) {
                        allCompleted = false;
                    }
                });

                // Update day-level completion
                currentWeekWorkoutProgress[dayIndex].completed = allCompleted;

                if (allCompleted) {
                    const today = new Date().toISOString().split("T")[0];
                    currentWeekWorkoutProgress[dayIndex].completedAt = today;
                } else {
                    currentWeekWorkoutProgress[dayIndex].completedAt = null;
                }

                showToast(`Day ${dayProgress.day} progress updated`, "success");
                console.log("Updated Progress:", currentWeekWorkoutProgress[dayIndex]);
            });


            dayCard.appendChild(updateBtn);
            logProgressForms.appendChild(dayCard);
        });
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