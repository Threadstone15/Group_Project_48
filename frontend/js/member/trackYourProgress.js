import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";

export function initMember_trackProgress() {
    console.log("initialzing trackProgress.js");
    fetchLastWeeklyPogressOfMember();

    let currentWeekProgressInfo = null;
    let currentWeekWorkoutProgress = null;
    let currentWeekNo = 1;

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
                if (data.error && data.error === "No progress found") {
                    // No progress found for the user
                    // ask the user to start with a new weekly progress
                    document.getElementById("progress-start").style.display = "block";
                } else if (data.error) {
                    // Handle other errors
                    showToast(data.error, "error");
                }else{
                    // Successfully fetched the weekly progress
                    currentWeekProgressInfo = data;
                    currentWeekWorkoutProgress = JSON.parse(currentWeekProgressInfo.weekly_progress);  //converting the JSON string into js object
                    currentWeekNo = currentWeekProgressInfo.week_number;
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
    //no progress found->fetching the currently selected workout plan of member and starting the weekly progress
    const startProgressBtn = document.getElementById("start-progress-btn");
    startProgressBtn.addEventListener("click", () => {
        fetchCurrentWorkoutPlan();
        // startNewWeekProgress();
    });

    function fetchCurrentWorkoutPlan() {
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
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_current_workout_plan", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to fetch the current workout plan");
                    return data;
                });
            })
            .then(data => {
                if (data.error && data.error === "No current workout plan found") {
                    showToast("You have not created/selected a workout plan yet", "error");  
                } else {
                    const currentWorkoutPlan = data;
                    startNewWeekProgress(currentWorkoutPlan.id, JSON.parse(currentWorkoutPlan.description));
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

    function startNewWeekProgress(workoutPlanId, workoutPlanDescription) {
        console.log("workout Plan description : ", workoutPlanDescription)
        const initial_weekly_progress = workoutPlanDescription.map((day, index) => {
            return {
                day: day.day,
                exercises: day.exercises.map(exercise => ({
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    sets_completed: 0
                }))
            };
        });
        console.log("initial_weekly_progress : ", initial_weekly_progress);
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const payload = {
            workout_plan_id: workoutPlanId,
            week_number: currentWeekNo,
            weekly_progress: JSON.stringify(initial_weekly_progress), //convertinng the js object into JSON string
        }
        const requestOptions = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            redirect: "follow"
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=add_weekly_progress", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to start a new weekly progress");
                    return data;
                });
            })
            .then(data => {
                //do from here
                if (data.error) {
                    showToast(data.error, "error");
                } else {
                    // Successfully started a new weekly progress
                    currentWeekProgressInfo = data;
                    currentWeekWorkoutProgress = JSON.parse(currentWeekProgressInfo.weekly_progress);  //converting the JSON string into js object
                    currentWeekNo = currentWeekProgressInfo.week_number;
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