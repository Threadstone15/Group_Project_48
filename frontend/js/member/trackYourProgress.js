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
                } else if (data.error && data.error === "No current workout plan found") {
                    //show a popup message to navigate into the workout plan page
                    const selectWorkoutPlanPopup = document.getElementById("select-workout-plan-popup");
                    selectWorkoutPlanPopup.style.display = "block";
                    //adding dark overlay around popup
                    document.getElementById("overlay").style.display = "block";
                } else if (data.error) {
                    // Handle other errors
                    showToast(data.error, "error");
                } else {
                    // Successfully fetched the weekly progress
                    currentWeekProgressInfo = data;
                    currentWeekWorkoutProgress = JSON.parse(currentWeekProgressInfo.weekly_progress);  //converting the JSON string into js object
                    currentWeekNo = currentWeekProgressInfo.week_number;
                    // console.log("current week workout progress: ", currentWeekWorkoutProgress);
                    displayCurrentWeekProgress(currentWeekWorkoutProgress);
                    //fetch and display previous progess of the member
                    fetchPreviousProgressOfMember();
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

    //attaching event listener to the popup button
    const selectWorkoutPlanPopupBtn = document.getElementById("select-workout-plan-popup-button");
    selectWorkoutPlanPopupBtn.addEventListener("click", () => {
        const selectWorkoutPlanPopup = document.getElementById("select-workout-plan-popup");
        selectWorkoutPlanPopup.style.display = "none"; // Hide the popup
        document.getElementById("overlay").style.display = "none"; // Hide the dark overlay
        navigate("member/workoutPlans"); // Navigate to the workout plan page
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
                    showToast("You have not created/selected a workout plan", "error");
                } else {
                    const currentWorkoutPlan = data;
                    startNewWeekProgress(currentWorkoutPlan.workout_plan_id, JSON.parse(currentWorkoutPlan.description));
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
        const initial_weekly_progress = workoutPlanDescription.map((day, index) => {
            return {
                day: day.day,
                dayCompletedPercetange: 0,
                exercises: day.exercises.map(exercise => ({
                    name: exercise.name,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    sets_completed: 0
                }))
            };
        });
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const payload = {
            workout_plan_id: workoutPlanId,
            week_number: currentWeekNo,
            weekly_progress: initial_weekly_progress
        };
        const requestOptions = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload), //convertinng the js object into JSON string -> JSON.stringify()
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
                if (data.error) {
                    showToast("An error has occured. Please try again later", "error");
                } else {
                    //hide the start progress div
                    document.getElementById("progress-start").style.display = "none";
                    // Successfully started a new weekly progress
                    fetchLastWeeklyPogressOfMember();
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
        // console.log("Current Week Progress:", progress);
        // displaying end week button
        const endWeekBtn = document.getElementById("end-week-progress-btn");
        endWeekBtn.style.display = "block";

        const logProgressForms = document.getElementById("log-progress-forms");
        logProgressForms.innerHTML = ""; // Clear previous content

        // set week number
        const weekNo = document.getElementById("week-no");
        weekNo.innerHTML = `Week ${currentWeekProgressInfo.week_number}  Started on ${currentWeekProgressInfo.started_at}`;

        progress.forEach((dayProgress, dayIndex) => {
            const dayCard = document.createElement("div");
            dayCard.className = "day-card";

            const dayTitle = document.createElement("h4");
            dayTitle.textContent = `Day ${dayProgress.day}`;
            dayCard.appendChild(dayTitle);

            //showing completed percentage
            const dayProgressPercentage = document.createElement("p");
            dayProgressPercentage.innerHTML = `Day Progress : ${dayProgress.dayCompletedPercetange} %`;
            dayCard.appendChild(dayProgressPercentage);

            // Exercises list
            dayProgress.exercises.forEach((exercise, exIndex) => {
                const exerciseContainer = document.createElement("div");
                exerciseContainer.className = "exercise-container";

                const name = document.createElement("p");
                name.innerHTML = `<strong>Exercise:</strong> ${exercise.name}`;
                exerciseContainer.appendChild(name);

                const setsReps = document.createElement("p");
                setsReps.innerHTML = `<strong>Sets:</strong> ${exercise.sets}, <strong>Reps:</strong> ${exercise.reps}`;
                exerciseContainer.appendChild(setsReps);

                const setsCompletedLabel = document.createElement("label");
                setsCompletedLabel.textContent = "Sets Completed: ";
                setsCompletedLabel.className = "sets-completed-label";

                const setsCompletedInput = document.createElement("input");
                setsCompletedInput.type = "number";
                setsCompletedInput.min = 0;
                setsCompletedInput.value = exercise.sets_completed || 0;
                setsCompletedInput.name = `day${dayIndex}-exercise${exIndex}`;
                setsCompletedInput.className = "sets-completed-input";

                setsCompletedLabel.appendChild(setsCompletedInput);
                exerciseContainer.appendChild(setsCompletedLabel);

                dayCard.appendChild(exerciseContainer);
            });

            // Update button
            const updateBtn = document.createElement("button");
            updateBtn.innerHTML = "Update Progress";
            updateBtn.classList.add("update-button");

            dayCard.appendChild(updateBtn);
            logProgressForms.appendChild(dayCard);

            updateBtn.addEventListener("click", () => {
                let allCompletedNoOfSets = 0;
                let allRequiredNoOfSets = 0;

                dayProgress.exercises.forEach((exercise, exIndex) => {
                    const inputName = `day${dayIndex}-exercise${exIndex}`;
                    const input = document.querySelector(`input[name="${inputName}"]`); //getting the input field by inputNmae which waas set eaarlir
                    const newCompletedSets = parseInt(input.value);

                    if (isNaN(newCompletedSets) || newCompletedSets < 0 || newCompletedSets > exercise.sets) {
                        showToast("Invalid input for sets completed.", "error");
                        exit();
                    }
                    // Update the corresponding exercise in the main data structure
                    currentWeekWorkoutProgress[dayIndex].exercises[exIndex].sets_completed = newCompletedSets;

                    allCompletedNoOfSets += newCompletedSets;
                    allRequiredNoOfSets += exercise.sets;
                });

                // Update day-level completion
                currentWeekWorkoutProgress[dayIndex].dayCompletedPercetange = Math.round((allCompletedNoOfSets / allRequiredNoOfSets) * 100); //calculating the percentage of completed sets
                // console.log("progress after updating : ", currentWeekWorkoutProgress )
                //updating displaying percentage
                dayProgressPercentage.innerHTML = `Day Progress : ${dayProgress.dayCompletedPercetange} %`;
                updateWeeklyProgress();
            });
        });
    }
    // End week progress button
    const endWeekBtn = document.getElementById("end-week-progress-btn");
    endWeekBtn.addEventListener("click", () => {
        //end current week progress 
        currentWeekNo += 1; // Increment the week number for the next week
        //fetch the current workout plan of member -> member must have changed the workout plan
        fetchCurrentWorkoutPlan(); //within the function, the new week progress will be started with the updated weekNo->then last weekly progress will be fetched and displayed
        fetchPreviousProgressOfMember(); //refreshing previous progress by fetching previous progress of member again
    });

    function updateWeeklyProgress() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("An error has occurred. Please log in again", "error");
            navigate("login");
            return;
        }
        const payload = {
            "workout_plan_id": currentWeekProgressInfo.workout_plan_id,
            "week_number": currentWeekNo,
            "weekly_progress": currentWeekWorkoutProgress
        };
        const requestOptions = {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            redirect: "follow"
        };
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=update_weekly_progress", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to update the weekly progress");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                } else {
                    showToast(data.message, "success");
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

    function fetchPreviousProgressOfMember() {
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
        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_previous_progress", requestOptions)
            .then(response => {
                return response.json().then(data => {
                    if (data.error && data.error === "Token expired") {
                        throw new Error("Token expired");
                    }
                    if (!response.ok) throw new Error("Failed to fetch the previous weekly progress");
                    return data;
                });
            })
            .then(data => {
                if (data.error) {
                    showToast(data.error, "error");
                } else {
                    // Successfully fetched the previous weekly progress
                    displayPreviousProgress(data);
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

    function displayPreviousProgress(previousProgress) {
        console.log("Previous Progress:", previousProgress);
        //display previous progress section
        const previousProgressSection = document.getElementById("previous-progress-container");
        previousProgressSection.style.display = "block"; // Show the section

        const previousWeekCardsContainer = document.getElementById("week-cards-container");
        previousWeekCardsContainer.innerHTML = ""; // Clear previous content

        previousProgress.forEach(week => {
            const weekCard = document.createElement("div");
            weekCard.className = "week-progress-card";

            const weekTitle = document.createElement("h4");
            weekTitle.textContent = `Week ${week.week_number}  Started on ${week.started_at}`;
            weekCard.appendChild(weekTitle);

            const weekly_progress = JSON.parse(week.weekly_progress); //converting the JSON string into js object
            weekly_progress.forEach((day) => {
                //showing progress percentage for each day
                // const dayCard = document.createElement("div");
                // dayCard.className = "day-progress-card";
                // const dayTitle = document.createElement("p");
                // dayTitle.textContent = `Day ${day.day} - Progress: ${day.dayCompletedPercetange} %`;
                // dayCard.appendChild(dayTitle);

                // weekCard.appendChild(dayCard);
                // Card for each day
                const dayCard = document.createElement("div");
                dayCard.className = "day-progress-card";

                // Day title and percentage text
                const dayTitle = document.createElement("p");
                dayTitle.textContent = `Day ${day.day} - Progress: ${day.dayCompletedPercetange} %`;
                dayCard.appendChild(dayTitle);

                // Progress bar container
                const progressBar = document.createElement("div");
                progressBar.className = "progress-bar";

                // Filled portion of the progress bar
                const progressFill = document.createElement("div");
                progressFill.className = "progress-fill";
                progressFill.style.width = `${day.dayCompletedPercetange}%`;

                // Append fill to progress bar
                progressBar.appendChild(progressFill);
                dayCard.appendChild(progressBar);

                // Append day card to week card
                weekCard.appendChild(dayCard);
            });
            previousWeekCardsContainer.appendChild(weekCard);
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