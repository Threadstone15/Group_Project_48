export function initTrainer_planRequests() {
    console.log("initializing plan requests");

    // DOM Elements
    const workoutRequestsBtn = document.getElementById('workoutRequestsBtn');
    const mealRequestsBtn = document.getElementById('mealRequestsBtn');
    const workoutBadge = document.getElementById('workoutBadge');
    const mealBadge = document.getElementById('mealBadge');
    const requestsTableContainer = document.getElementById('requestsTableContainer');
    const requestsTableBody = document.getElementById('requestsTableBody');
    const tableTitle = document.getElementById('tableTitle');
    const workoutPlannerContainer = document.getElementById('workoutPlannerContainer');
    const workoutDaysContainer = document.getElementById('workoutDaysContainer');
    const workoutDaysInput = document.getElementById('workoutDaysInput');
    const workoutPlanner = document.getElementById('workoutPlanner');
    const generateWorkoutBtn = document.getElementById('generateWorkoutBtn');
    const mealPlannerContainer = document.getElementById('mealPlannerContainer');
    const mealPlanner = document.getElementById('mealPlanner');
    const saveMealPlanBtn = document.getElementById('saveMealPlanBtn');
    const spinner = document.getElementById("loading-spinner");
  
    // Global variables
    let currentRequests = [];
    let currentRequestType = '';
    let currentMemberId = '';
    let currentRequestId = '';
    spinner.classList.remove("hidden");
    // Initialize the page
    fetchRequests();
  
    // Event listeners
    workoutRequestsBtn.addEventListener('click', () => showRequests('workout'));
    mealRequestsBtn.addEventListener('click', () => showRequests('meal'));
    generateWorkoutBtn.addEventListener('click', generateWorkoutPlanner);
    saveMealPlanBtn.addEventListener('click', sendMealPlanToBackend);
  
    // Fetch all requests from backend
    async function fetchRequests() {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          alert("Auth token not found. Please log in.");
          return;
        }
  
        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_requests", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
  
        const data = await response.json();
        console.log(data);
        spinner.classList.add("hidden");
        currentRequests = data || [];
        
        // Update badge counts
        const workoutCount = currentRequests.filter(req => req.workout_plan == 1).length;
        const mealCount = currentRequests.filter(req => req.workout_plan == 0).length;

        console.log(workoutCount, mealCount);
        
        workoutBadge.textContent = workoutCount;
        mealBadge.textContent = mealCount;
        
      } catch (error) {
        console.error('Error fetching requests:', error);
        showToast("There are no requests", "error");
        spinner.classList.add("hidden");
      }
    }
  
    // Show requests based on type
    function showRequests(type) {
      currentRequestType = type;
      const filteredRequests = currentRequests.filter(req => 
        type === 'workout' ? req.workout_plan === 1 : req.workout_plan === 0
      );
  
      // Update UI
      tableTitle.textContent = `${type === 'workout' ? 'Workout' : 'Meal'} Plan Requests`;
      requestsTableBody.innerHTML = '';
  
      if (filteredRequests.length === 0) {
        requestsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No requests found</td></tr>';
      } else {
        filteredRequests.forEach(request => {
          console.log(request);
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${request.full_name}</td>
            <td>${request.member_id}</td>
            <td>${request.message || 'No message'}</td>
            <td>${request.created_at}</td>
            <td>
              <button class="action-btn accept-btn" data-id="${request.id}" data-member-id="${request.member_id}">Generate</button>
              <button class="action-btn reject-btn" data-id="${request.id}">Reject</button>
            </td>
          `;
          requestsTableBody.appendChild(row);
        });
      }
  
      // Add event listeners to action buttons
      document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', handleAccept);
      });
  
      document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', handleReject);
      });
  
      // Show the table
      requestsTableContainer.classList.remove('hidden');
      workoutPlannerContainer.classList.add('hidden');
      mealPlannerContainer.classList.add('hidden');
    }
  
    // Handle accept button click
    function handleAccept(e) {
      const requestId = e.target.dataset.id;
      currentMemberId = e.target.dataset.member_id;
      currentRequestId = e.target.dataset.id;
      console.log("currentRequestId", currentRequestId);
      
      if (currentRequestType === 'workout') {
        showWorkoutPlanner();
      } else {
        showMealPlanner();
      }
    }
  
    // Handle reject button click
    async function handleReject(e) {
      const requestId = e.target.dataset.id;
      
      showModal({
        title: 'Confirm Rejection',
        content: `
          <p>Are you sure you want to reject this request?</p>
          <label for="rejectReason">Reason for rejection:</label>
          <textarea id="rejectReason" rows="3" style="width: 100%; padding: 8px;" placeholder="Enter reason for rejection..."></textarea>
        `,
        onConfirm: async () => {
          const rejectReason = document.getElementById('rejectReason').value.trim();
          
          if (!rejectReason) {
            alert('Please provide a reason for rejection.');
            return;
          }
          
          try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
              alert("Auth token not found. Please log in.");
              return;
            }
  
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=reject_request`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify({
                request_id: requestId,
                reason: rejectReason
              })
            });
  
            if (!response.ok) {
              throw new Error('Failed to reject request');
            }
  
            // Remove the request from the UI
            e.target.closest('tr').remove();
            
            // Update the badge count
            if (currentRequestType === 'workout') {
              workoutBadge.textContent = parseInt(workoutBadge.textContent) - 1;
            } else {
              mealBadge.textContent = parseInt(mealBadge.textContent) - 1;
            }
            
            alert('Request rejected successfully');
            
          } catch (error) {
            console.error('Error rejecting request:', error);
            showToast("Error rejecting request: " + error.message, 'error');
          }
        },
        onCancel: () => {
          console.log('Rejection cancelled');
        }
      });
    }
  
    // Show workout planner
    function showWorkoutPlanner() {
      requestsTableContainer.classList.add('hidden');
      workoutPlannerContainer.classList.remove('hidden');
      mealPlannerContainer.classList.add('hidden');
      
      // Reset the planner
      workoutDaysContainer.style.display = 'block';
      workoutPlanner.innerHTML = '';
    }
  
    // Show meal planner
    function showMealPlanner() {
      requestsTableContainer.classList.add('hidden');
      workoutPlannerContainer.classList.add('hidden');
      mealPlannerContainer.classList.remove('hidden');
      
      // Generate the meal planner
      generateMealPlanner();
    }
  
    // Generate workout planner
    function generateWorkoutPlanner() {
      const workoutDays = parseInt(workoutDaysInput.value);
  
      if (!workoutDays || workoutDays < 1 || workoutDays > 7) {
        alert('Please enter a valid number of days (1-7).');
        return;
      }
  
      workoutDaysContainer.style.display = 'none';
      workoutPlanner.innerHTML = '';
  
      for (let i = 1; i <= workoutDays; i++) {
        const column = document.createElement('div');
        column.className = 'workout-column';
  
        const title = document.createElement('h3');
        title.textContent = `Day ${i}`;
        column.appendChild(title);
  
        const exerciseContainer = document.createElement('div');
        exerciseContainer.className = 'exercise-container';
        column.appendChild(exerciseContainer);
  
        addExerciseRow(exerciseContainer);
  
        const addExerciseButton = document.createElement('button');
        addExerciseButton.className = 'add-exercise-btn';
        addExerciseButton.textContent = 'Add another exercise';
        addExerciseButton.addEventListener('click', () =>
          addExerciseRow(exerciseContainer)
        );
        column.appendChild(addExerciseButton);
  
        workoutPlanner.appendChild(column);
      }
  
      // Add save button
      const saveButton = document.createElement('button');
      saveButton.className = 'save-workout-btn';
      saveButton.textContent = 'Save Workout Plan';
      saveButton.addEventListener('click', sendWorkoutPlanToBackend);
      workoutPlanner.appendChild(saveButton);
    }
  
    // Add exercise row to workout planner (removed edit button)
    function addExerciseRow(container) {
      const exerciseRow = document.createElement('div');
      exerciseRow.className = 'exercise-row';
  
      exerciseRow.innerHTML = `
        <input type="text" placeholder="Exercise name" class="exercise-name">
        <input type="number" placeholder="No. of sets" class="exercise-sets">
        <input type="number" placeholder="No. of reps" class="exercise-reps">
      `;
  
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-exercise-btn';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => showDeleteModal(exerciseRow));
      exerciseRow.appendChild(deleteButton);
  
      container.appendChild(exerciseRow);
    }
  
    // Generate meal planner
    function generateMealPlanner() {
      mealPlanner.innerHTML = '';
  
      const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  
      mealTypes.forEach((meal) => {
        const mealRow = document.createElement('div');
        mealRow.className = 'meal-row';
  
        mealRow.innerHTML = `
          <label>${meal}</label>
          <input type="text" placeholder="Meal name" class="meal-name" data-meal-type="${meal}">
          <input type="time" class="meal-time">
          <input type="number" placeholder="Calories" class="meal-calories">
        `;
  
        mealPlanner.appendChild(mealRow);
      });
  
      saveMealPlanBtn.classList.remove('hidden');
    }
  
    // Collect workout plan data
    function collectWorkoutPlanData() {
      const workoutColumns = document.querySelectorAll('.workout-column');
      const workoutPlan = [];
  
      workoutColumns.forEach((column, index) => {
        const day = index + 1;
        const exercises = [];
  
        const exerciseRows = column.querySelectorAll('.exercise-row');
        exerciseRows.forEach(row => {
          const name = row.querySelector('.exercise-name').value;
          const sets = parseInt(row.querySelector('.exercise-sets').value);
          const reps = parseInt(row.querySelector('.exercise-reps').value);
  
          if (name && sets && reps) {
            exercises.push({ name, sets, reps });
          }
        });
  
        workoutPlan.push({ day, exercises });
      });
  
      return workoutPlan;
    }
  
    // Send workout plan to backend
    async function sendWorkoutPlanToBackend() {
      const workoutPlan = collectWorkoutPlanData();
      const authToken = localStorage.getItem("authToken");
  
      if (!authToken) {
        alert("Auth token not found. Please log in.");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=create_workout_plan_for_member", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            request_id: currentRequestId,
            workout_plan: workoutPlan
          })
        });
  
        const result = await response.json();
        if (response.ok) {
          showToast("Workout plan saved successfully!", 'success');
          // Optionally refresh the requests list
          fetchRequests();
          // Reset the UI
          workoutPlannerContainer.classList.add('hidden');
        } else {
          alert("Failed to save workout plan: " + result.message);
        }
      } catch (error) {
        console.error('Error saving workout plan:', error);
        showToast('Error saving workout plan. Please try again.', 'error');
      }
    }
  
    // Collect meal plan data
    function collectMealPlanData() {
      const mealRows = document.querySelectorAll('.meal-row');
      const plan = [];
  
      mealRows.forEach(row => {
        const type = row.querySelector('.meal-name').dataset.mealType;
        const name = row.querySelector('.meal-name').value;
        const time = row.querySelector('.meal-time').value;
        const calories = row.querySelector('.meal-calories').value;
  
        plan.push({
          type,
          name,
          time,
          calories: parseInt(calories) || 0
        });
      });
  
      return plan;
    }
  
    // Send meal plan to backend
    async function sendMealPlanToBackend() {
      const mealPlan = collectMealPlanData();
      const authToken = localStorage.getItem("authToken");
  
      if (!authToken) {
        alert("Auth token not found. Please log in.");
        return;
      }
  
      try {
        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=create_meal_plan_for_member", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({
            request_id: currentRequestId,
            meal_plan: mealPlan
          })
        });
  
        const result = await response.json();
        if (response.ok) {
          showToast("Meal plan saved successfully!", 'success');
          // Optionally refresh the requests list
          fetchRequests();
          // Reset the UI
          mealPlannerContainer.classList.add('hidden');
        } else {
          alert("Failed to save meal plan: " + result.message);
        }
      } catch (error) {
        console.error('Error saving meal plan:', error);
        showToast('Error saving meal plan. Please try again.', 'error');
      }
    }
  
    // Modal functions (removed showEditModal since we don't need it anymore)
    function showDeleteModal(rowElement) {
      showModal({
        title: 'Delete Exercise',
        content: '<p>Are you sure you want to delete this exercise?</p>',
        onConfirm: () => {
          rowElement.remove();
        },
        onCancel: () => {}
      });
    }
  
    function showModal({ title, content, onConfirm, onCancel }) {
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay';
  
      const modal = document.createElement('div');
      modal.className = 'modal';
  
      const modalHeader = document.createElement('div');
      modalHeader.className = 'modal-header';
      modalHeader.innerHTML = `<h3>${title}</h3>`;
      const closeButton = document.createElement('button');
      closeButton.className = 'close-btn';
      closeButton.textContent = '×';
      closeButton.addEventListener('click', () => document.body.removeChild(modalOverlay));
      modalHeader.appendChild(closeButton);
  
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.innerHTML = content;
  
      const modalFooter = document.createElement('div');
      modalFooter.className = 'modal-footer';
  
      const confirmButton = document.createElement('button');
      confirmButton.className = 'confirm-btn';
      confirmButton.textContent = 'Confirm';
      confirmButton.addEventListener('click', () => {
        onConfirm();
        document.body.removeChild(modalOverlay);
      });
  
      const cancelButton = document.createElement('button');
      cancelButton.className = 'cancel-btn';
      cancelButton.textContent = 'Cancel';
      cancelButton.addEventListener('click', () => {
        onCancel();
        document.body.removeChild(modalOverlay);
      });
  
      modalFooter.appendChild(confirmButton);
      modalFooter.appendChild(cancelButton);
  
      modal.appendChild(modalHeader);
      modal.appendChild(modalContent);
      modal.appendChild(modalFooter);
  
      modalOverlay.appendChild(modal);
      document.body.appendChild(modalOverlay);
    }
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerText = message;
  
      container.appendChild(toast);
  
      setTimeout(() => {
          toast.remove();
      }, 4000);
    }


}