import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";

export function initMember_myPlans() {
    console.log("initializing myPlans.js");

    // Initialize DOM elements
    const workoutBtn = document.getElementById('workoutBtn');
    const mealBtn = document.getElementById('mealBtn');
    const planListModal = document.getElementById('planListModal');
    const planListTitle = document.getElementById('planListTitle');
    //spinner
    const spinner = document.getElementById("loading-spinner");

    let selectedCategory = ''; // "workout" or "meal"
    let currentlyTrackedPlanId = null; // Track which plan is currently being tracked

    // Fetch currently tracked plan when initializing
    fetchCurrentlyTrackedPlan();

    // Event listeners for main buttons
    workoutBtn?.addEventListener('click', () => {
        // Show spinner while fetching data
        spinner.classList.remove("hidden");
        selectedCategory = 'workout';
        fetchPlansFromBackend(selectedCategory).then(() => {
            planListTitle.textContent = 'Workout Plans';
            const allPlans = JSON.parse(localStorage.getItem(`${selectedCategory}_plans`)) || [];
            //if there are no plans, show a message
            if(allPlans.error && allPlans.error == "No workout plans found"){
                showToast("No workout plans found. Please create a workout plan through the workout planner section", "error");
                return;
            }
            renderPlans(selectedCategory, allPlans);
            planListModal?.classList.remove('hidden');
        });
        // Hide spinner after fetching data
        spinner.classList.add("hidden");
    });

    mealBtn?.addEventListener('click', () => {
        // Show spinner while fetching data
        spinner.classList.remove("hidden");
        selectedCategory = 'meal';
        fetchPlansFromBackend(selectedCategory).then(() => {
            planListTitle.textContent = 'Meal Plans';
            const allPlans = JSON.parse(localStorage.getItem(`${selectedCategory}_plans`)) || [];
            //if there are no plans, show a message
            if(allPlans.error && allPlans.error == "No meal plans found"){
                showToast("No meal plans found. Please create a meal plan through the meal planner section", "error");
                return;
            }
            renderPlans(selectedCategory, allPlans);
            planListModal?.classList.remove('hidden');
        });
        // Hide spinner after fetching data
        spinner.classList.add("hidden");
    });

    // Plan list modal handler
    planListModal?.addEventListener('click', async (e) => {
        if (e.target.classList.contains('close-btn')) {
            switch(e.target.id){
                case 'close-planListModal':
                    planListModal?.classList.add('hidden');
                    break;
            }
            // planListModal?.classList.add('hidden');
        } else if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            const category = e.target.dataset.category;
            //display confirmation popup
            const confirmationMessage = "Are you sure you want to delete this plan?";
            showConfirmationPopup(confirmationMessage, function () {
                deletePlan(id, category);
            });
            // if (confirm("Are you sure you want to delete this plan?")) {
            //     await deletePlan(id, category);
            // }
        } else if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const category = e.target.dataset.category;
            const allPlans = JSON.parse(localStorage.getItem(`${category}_plans`)) || [];
            const plan = allPlans.find(plan => plan.id == id);

            if (plan) {
                // Check if it's a trainer plan (can't edit)
                if (plan.trainer_id) {
                    showToast("You cannot edit a plan created by your trainer", "error");
                    return;
                }

                try {
                    const parsedDescription = JSON.parse(plan.description);
                    if (category === 'meal') {
                        // Set up meal plan edit modal
                        document.getElementById('editMealPlanId').value = plan.id;
                        document.getElementById('editMealPlanCategory').value = category;
                        renderMealInputs(parsedDescription);
                        document.getElementById('editMealPlanModal').classList.remove('hidden');
                    } else {
                        // Set up workout plan edit modal
                        document.getElementById('editWorkoutPlanId').value = plan.id;
                        document.getElementById('editWorkoutPlanCategory').value = category;
                        renderWorkoutInputs(parsedDescription);
                        document.getElementById('editWorkoutPlanModal').classList.remove('hidden');
                    }
                } catch (e) {
                    console.error("Error parsing plan description:", e);
                    showToast("Error loading plan details. The format may be invalid.", "error");
                }

                document.getElementById('editPlanModal').classList.remove('hidden');
            }
        } else if (e.target.classList.contains('track-btn')) {
            const id = e.target.dataset.id;
            const category = e.target.dataset.category;

            if (category !== 'workout') {
                showToast("You can only track workout plans.", "error");
                return;
            }

            if (currentlyTrackedPlanId == id) {
                // if (confirm("This plan is already being tracked. Do you want to stop tracking it?")) {
                //     await stopTrackingPlan(id);
                // }
                //display confirmation popup
                const confirmationMessage = "This plan is already being tracked. Do you want to stop tracking it?";
                showConfirmationPopup(confirmationMessage, function () {
                    stopTrackingPlan(id);
                });
            } else {
                if (currentlyTrackedPlanId) {
                    // if (!confirm("You're already tracking another plan. Switching will lose your progress tracking. Continue?")) {
                    //     return;
                    // }
                    const confirmationMessage = "You're already tracking another plan. Switching will lose your progress tracking for the this plan. Continue?";
                    showConfirmationPopup(confirmationMessage, function () {
                        trackPlan(id);
                    });
                    return;
                }
                // Track the new plan
                trackPlan(id);
                // if (confirm("Do you want to track this workout plan? You can only track one plan at a time.")) {
                //     await trackPlan(id);
                // }
            }
        } else if (e.target.classList.contains('view-btn')) {
            const id = e.target.dataset.id;
            const category = e.target.dataset.category;
            const allPlans = JSON.parse(localStorage.getItem(`${category}_plans`)) || [];
            const plan = allPlans.find(plan => plan.id == id);

            if (plan) {
                displayPlanDetails(plan, category);
            }
        }
    });


    // Meal Plan Form Submission
    document.getElementById('editMealPlanForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const planId = document.getElementById('editMealPlanId').value;
        const category = document.getElementById('editMealPlanCategory').value;
        const authToken = localStorage.getItem('authToken');

        // Create description in the array format
        let description = ['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => {
            const nameInput = document.querySelector(`[name="${meal}_name"]`);
            const timeInput = document.querySelector(`[name="${meal}_time"]`);
            const caloriesInput = document.querySelector(`[name="${meal}_calories"]`);

            return {
                type: meal.charAt(0).toUpperCase() + meal.slice(1), // Capitalize first letter
                name: nameInput?.value || '',
                time: timeInput?.value || '',
                calories: parseInt(caloriesInput?.value) || 0
            };
        });

        const updatedPlan = {
            id: planId,
            description: JSON.stringify(description),
        };

        const endpoint = `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=update_meal_plan`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(updatedPlan),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update plan.');

            document.getElementById('editMealPlanModal').classList.add('hidden');
            await fetchPlansFromBackend(category);
            showToast('Meal plan updated successfully!', "success");
        } catch (error) {
            console.error('Error updating meal plan:', error);
            showToast('An error occurred while updating the plan.', "error");
        }
    });

    // Workout Plan Form Submission
    document.getElementById('editWorkoutPlanForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const planId = document.getElementById('editWorkoutPlanId').value;
        const category = document.getElementById('editWorkoutPlanCategory').value;
        const authToken = localStorage.getItem('authToken');

        let description = [];
        const dayHeaders = document.querySelectorAll('#workoutInputs h4');

        dayHeaders.forEach((header, dayIndex) => {
            const dayExercises = [];
            const exerciseRows = header.nextElementSibling?.querySelectorAll('.exercise-row') || [];

            exerciseRows.forEach(row => {
                const nameInput = row.querySelector(`[name^="exercise_day_${dayIndex}_name_"]`);
                const setsInput = row.querySelector(`[name^="exercise_day_${dayIndex}_sets_"]`);
                const repsInput = row.querySelector(`[name^="exercise_day_${dayIndex}_reps_"]`);

                dayExercises.push({
                    name: nameInput?.value || '',
                    sets: parseInt(setsInput?.value) || 0,
                    reps: parseInt(repsInput?.value) || 0
                });
            });

            description.push({
                day: dayIndex + 1,
                exercises: dayExercises
            });
        });

        const updatedPlan = {
            id: planId,
            description: JSON.stringify(description),
        };

        const endpoint = `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=update_workout_plan`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(updatedPlan),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to update plan.');

            document.getElementById('editWorkoutPlanModal').classList.add('hidden');
            await fetchPlansFromBackend(category);
            showToast('Workout plan updated successfully!', "success");
        } catch (error) {
            console.error('Error updating workout plan:', error);
            showToast('An error occurred while updating the plan', "error");
        }
    });

    // Close modal when clicking outside of it
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // Close buttons handler
    document.getElementById('close-planDetailsModal').addEventListener('click', () => {
        document.getElementById('planDetailsModal').classList.add('hidden');
    });
    document.getElementById('close-editMealPlanModal').addEventListener('click', () => {
        document.getElementById('editMealPlanModal').classList.add('hidden');
    });
    document.getElementById('close-editWorkoutPlanModal').addEventListener('click',() => {
        document.getElementById('editWorkoutPlanModal').classList.add('hidden');
    });
    // document.querySelectorAll('.close-btn').forEach(btn => {
    //     btn.addEventListener('click', () => {
    //         document.querySelectorAll('.modal').forEach(modal => {
    //             modal.classList.add('hidden');
    //         });
    //     });
    // });

    // Helper functions
    function displayPlanDetails(plan, category) {
        const detailsModal = document.getElementById('planDetailsModal');
        const detailsContent = document.getElementById('planDetailsContent');
        const detailsTitle = document.getElementById('planDetailsTitle');

        if (!detailsModal || !detailsContent || !detailsTitle) return;

        detailsTitle.textContent = plan.name || 'Plan Details';

        let detailsHTML = `
        <div class="plan-meta">
            <p><strong>Created By:</strong> ${plan.trainer_id ? (plan.trainer_name ? `Trainer: ${plan.trainer_name}` : `Trainer #${plan.trainer_id}`) : 'Personal'}</p>
            <p><strong>Created On:</strong> ${new Date(plan.created_at).toLocaleString()}</p>
        </div>
    `;

        try {
            const parsedDescription = JSON.parse(plan.description);

            if (category === 'workout') {
                detailsHTML += '<div class="workout-plan-details">';
                if (Array.isArray(parsedDescription)) {
                    parsedDescription.forEach(day => {
                        detailsHTML += `
                        <div class="workout-day">
                            <h3>Day ${day.day}</h3>
                            <ul class="exercise-list">
                    `;

                        if (day.exercises && Array.isArray(day.exercises)) {
                            day.exercises.forEach(ex => {
                                detailsHTML += `
                                <li class="exercise-item">
                                    <span class="exercise-name">${ex.name || 'Unnamed Exercise'}</span>
                                    <span class="exercise-sets-reps">${ex.sets || 0} sets × ${ex.reps || 0} reps</span>
                                </li>
                            `;
                            });
                        }

                        detailsHTML += `
                            </ul>
                        </div>
                    `;
                    });
                }
                detailsHTML += '</div>';
            } else {
                detailsHTML += '<div class="meal-plan-details">';
                if (Array.isArray(parsedDescription)) {
                    detailsHTML += `
                    <div class="meal-plan-grid">
                        <div class="meal-header">Meal</div>
                        <div class="meal-header">Name</div>
                        <div class="meal-header">Time</div>
                        <div class="meal-header">Calories</div>
                `;

                    parsedDescription.forEach(meal => {
                        detailsHTML += `
                        <div class="meal-type">${meal.type || '-'}</div>
                        <div class="meal-name">${meal.name || '-'}</div>
                        <div class="meal-time">${meal.time || '-'}</div>
                        <div class="meal-calories">${meal.calories || '0'} kcal</div>
                    `;
                    });

                    detailsHTML += `</div>`;
                }
                detailsHTML += '</div>';
            }
        } catch (e) {
            console.error("Error parsing plan description:", e);
            detailsHTML += `
            <div class="plan-description-error">
                <p>Could not parse plan details. Showing raw content:</p>
                <pre>${plan.description}</pre>
            </div>
        `;
        }

        detailsContent.innerHTML = detailsHTML;
        detailsModal.classList.remove('hidden');
    }


    async function fetchCurrentlyTrackedPlan() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return;

        try {
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_tracked_plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            });

            const data = await response.json();
            if (response.ok && data.plan_id) {
                currentlyTrackedPlanId = data.plan_id;
            } else {
                currentlyTrackedPlanId = null;
            }
        } catch (error) {
            console.error("Error fetching tracked plan:", error);
            currentlyTrackedPlanId = null;
        }
    }

    async function trackPlan(planId) {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Auth token not found. Please log in.", "error");
            setTimeout(() => {
                runSessionTimedOut();
            }, 4000);
            return;
        }
        console.log("Tracking plan with ID:", planId);

        try {
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=track_plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ plan_id: planId })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to track plan.");

            currentlyTrackedPlanId = planId;
            showToast("Plan is now being tracked!", "success");

            // Refresh the plans list to update the track button status
            await fetchPlansFromBackend('workout');
            const allPlans = JSON.parse(localStorage.getItem('workout_plans')) || [];
            renderPlans('workout', allPlans);
        } catch (error) {
            console.error("Error tracking plan:", error);
            showToast("An error occurred while tracking the plan.", "error");
        }
    }

    async function stopTrackingPlan(planId) {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Auth token not found. Please log in again.", "error");
            setTimeout(() => {
                runSessionTimedOut();
            }, 4000);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=stop_tracking_plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ plan_id: planId })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to stop tracking plan.");

            currentlyTrackedPlanId = null;
            showToast("Plan is no longer being tracked.", "success");

            // Refresh the plans list to update the track button status
            await fetchPlansFromBackend('workout');
            const allPlans = JSON.parse(localStorage.getItem('workout_plans')) || [];
            renderPlans('workout', allPlans);
        } catch (error) {
            console.error("Error stopping tracking plan:", error);
            showToast("An error occurred while stopping tracking the plan.", "error");
        }
    }

    async function fetchPlansFromBackend(category) {
        console.log("Fetching plans from backend...");

        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            showToast("Auth token not found. Please log in.", "error");
            setTimeout(() => {
                runSessionTimedOut();
            }, 4000);
            return;
        }

        const endpoint = category === 'workout'
            ? `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_workout_plans`
            : `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_meal_plans`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch plans.");
            console.log("Data received from backend:", data);

            localStorage.setItem(`${category}_plans`, JSON.stringify(data));
        } catch (error) {
            console.error("Error fetching plans:", error);
            showToast("An error occurred while fetching your plans.", "error");
        }
    }

    function renderPlans(category, plans) {
        const tableBody = document.getElementById('plansTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = ''; // Clear existing rows

        plans.forEach((plan, index) => {
            const row = document.createElement('tr');

            const createdBy = plan.trainer_id
                ? plan.trainer_name ? `Trainer: ${plan.trainer_name}` : `Trainer #${plan.trainer_id}`
                : 'Personal';

            // Create action buttons
            let actionButtons = `
              <button class="view-btn" data-id="${plan.id}" data-category="${category}">View</button>
          `;

            if (category === 'workout') {
                // For workout plans, add track button
                const isTracked = plan.id == currentlyTrackedPlanId;
                actionButtons += `
                  <button class="track-btn ${isTracked ? 'tracking' : ''}" 
                          data-id="${plan.id}" 
                          data-category="${category}">
                      ${isTracked ? 'Stop Tracking' : 'Track'}
                  </button>
              `;
            }

            // Add edit/delete buttons only for personal plans
            if (!plan.trainer_id) {
                actionButtons += `
                  <button class="edit-btn" data-id="${plan.id}" data-category="${category}">Edit</button>
                  <button class="delete-btn" data-id="${plan.id}" data-category="${category}">Delete</button>
              `;
            }

            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${createdBy}</td>
              <td>${new Date(plan.created_at).toLocaleDateString()}</td>
              <td class="actions-cell">${actionButtons}</td>
          `;

            tableBody.appendChild(row);
        });
    }

    function renderMealInputs(description) {
        const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']; // Note: Capitalized to match your data
        const container = document.getElementById('mealInputs');
        if (!container) return;

        container.innerHTML = '';

        // Convert the array format to the expected object format if needed
        let mealData = {};
        if (Array.isArray(description)) {
            description.forEach(meal => {
                const type = meal.type.toLowerCase(); // Convert to lowercase for consistency
                mealData[type] = {
                    name: meal.name,
                    time: meal.time,
                    calories: meal.calories
                };
            });
        } else {
            mealData = description;
        }

        meals.forEach(meal => {
            const type = meal.toLowerCase(); // Convert to lowercase for matching
            const data = mealData[type] || { time: '', calories: '', name: '' };
            container.innerHTML += `
            <div class="meal-input-group">
                <label>${meal}:</label>
                <input type="text" name="${type}_name" placeholder="Meal Name" value="${data.name || ''}">
                <input type="text" name="${type}_time" placeholder="Time" value="${data.time || ''}">
                <input type="number" name="${type}_calories" placeholder="Calories" value="${data.calories || ''}">
            </div>
        `;
        });
    }

    function renderWorkoutInputs(description) {
        const container = document.getElementById('workoutInputs');
        if (!container) return;

        container.innerHTML = '';

        if (Array.isArray(description)) {
            description.forEach((day, i) => {
                const dayHeader = document.createElement('h4');
                dayHeader.textContent = `Day ${day.day || i + 1}`;
                container.appendChild(dayHeader);

                const exercisesContainer = document.createElement('div');
                exercisesContainer.className = 'exercises-container';
                container.appendChild(exercisesContainer);

                if (day.exercises && Array.isArray(day.exercises)) {
                    day.exercises.forEach((ex, j) => {
                        const exerciseDiv = document.createElement('div');
                        exerciseDiv.className = 'exercise-row';
                        exerciseDiv.innerHTML = `
                          <input type="text" name="exercise_day_${i}_name_${j}" placeholder="Exercise Name" value="${ex.name || ''}">
                          <input type="number" name="exercise_day_${i}_sets_${j}" placeholder="Sets" value="${ex.sets || ''}">
                          <input type="number" name="exercise_day_${i}_reps_${j}" placeholder="Reps" value="${ex.reps || ''}">
                      `;
                        exercisesContainer.appendChild(exerciseDiv);
                    });
                }
            });
        }
    }

    async function deletePlan(planId, category) {
        const authToken = localStorage.getItem("authToken");
        const endpoint = category === 'workout'
            ? `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=delete_workout_plan`
            : `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=delete_meal_plan`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ id: planId })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to delete plan.");
            showToast("Plan deleted successfully.", "success");

            // If we're deleting the currently tracked plan, stop tracking it
            if (currentlyTrackedPlanId == planId) {
                currentlyTrackedPlanId = null;
            }

            await fetchPlansFromBackend(category);
            const updatedPlans = JSON.parse(localStorage.getItem(`${category}_plans`)) || [];
            renderPlans(category, updatedPlans);
        } catch (error) {
            console.error("Error deleting plan:", error);
            showToast("An error occurred while deleting the plan.", "error");
        }
    }

    function showConfirmationPopup(message, onConfirmCallback) {
        const popupMessageElement = document.getElementById("popupMessage");
        popupMessageElement.textContent = message; // Set the custom message

        // Store the callback function to be triggered if confirmed
        document.getElementById("confirmBtn").onclick = function () {
            onConfirmCallback();  // Execute the callback function
            hideConfirmationPopup(); // Close the popup
        };

        // Show the popup and overlay
        document.getElementById("confirmationPopup").style.display = "block";
        document.getElementById("overlay").style.display = "block";
    }

    // Function to hide the confirmation popup
    function hideConfirmationPopup() {
        document.getElementById("confirmationPopup").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    }

    // Event listener for the "No" button (cancel action)
    document.getElementById("cancelBtn").addEventListener("click", hideConfirmationPopup);

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