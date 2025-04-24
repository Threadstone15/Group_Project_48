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
      
        // Global variables
        let currentRequests = [];
        let currentRequestType = '';
        let currentMemberId = '';
      
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
            currentRequests = data.requests || [];
            
            // Update badge counts
            const workoutCount = currentRequests.filter(req => req.workout_plan === 1).length;
            const mealCount = currentRequests.filter(req => req.workout_plan === 0).length;
            
            workoutBadge.textContent = workoutCount;
            mealBadge.textContent = mealCount;
            
          } catch (error) {
            console.error('Error fetching requests:', error);
            alert('Error fetching requests. Please try again.');
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
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${request.member_name}</td>
                <td>${request.message || 'No message'}</td>
                <td>${new Date(request.requested_time).toLocaleString()}</td>
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
          currentMemberId = e.target.dataset.memberId;
          
          if (currentRequestType === 'workout') {
            showWorkoutPlanner();
          } else {
            showMealPlanner();
          }
        }
      
        // Handle reject button click
        async function handleReject(e) {
          const requestId = e.target.dataset.id;
          
          try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
              alert("Auth token not found. Please log in.");
              return;
            }
      
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=reject_request&request_id=${requestId}`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${authToken}`
              }
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
            alert('Error rejecting request. Please try again.');
          }
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
      
        // Add exercise row to workout planner
        function addExerciseRow(container) {
          const exerciseRow = document.createElement('div');
          exerciseRow.className = 'exercise-row';
      
          exerciseRow.innerHTML = `
            <input type="text" placeholder="Exercise name" class="exercise-name">
            <input type="number" placeholder="No. of sets" class="exercise-sets">
            <input type="number" placeholder="No. of reps" class="exercise-reps">
          `;
      
          const editButton = document.createElement('button');
          editButton.className = 'edit-exercise-btn';
          editButton.textContent = 'Edit';
          editButton.addEventListener('click', () =>
            showEditModal(
              exerciseRow.querySelector('.exercise-name'),
              exerciseRow.querySelector('.exercise-sets'),
              exerciseRow.querySelector('.exercise-reps')
            )
          );
          exerciseRow.appendChild(editButton);
      
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
            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=create_workout_plan", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify({
                member_id: currentMemberId,
                workout_plan: workoutPlan
              })
            });
      
            const result = await response.json();
            if (response.ok) {
              alert("Workout plan saved successfully!");
              // Optionally refresh the requests list
              fetchRequests();
              // Reset the UI
              workoutPlannerContainer.classList.add('hidden');
            } else {
              alert("Failed to save workout plan: " + result.message);
            }
          } catch (error) {
            console.error('Error saving workout plan:', error);
            alert('Error saving workout plan. Please try again.');
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
            const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=create_meal_plan", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify({
                member_id: currentMemberId,
                meal_plan: mealPlan
              })
            });
      
            const result = await response.json();
            if (response.ok) {
              alert("Meal plan saved successfully!");
              // Optionally refresh the requests list
              fetchRequests();
              // Reset the UI
              mealPlannerContainer.classList.add('hidden');
            } else {
              alert("Failed to save meal plan: " + result.message);
            }
          } catch (error) {
            console.error('Error saving meal plan:', error);
            alert('Error saving meal plan. Please try again.');
          }
        }
      
        // Modal functions
        function showEditModal(nameInput, setsInput, repsInput) {
          showModal({
            title: 'Edit Exercise',
            content: `
              <label>Exercise Name:</label>
              <input type="text" id="editName" value="${nameInput.value}">
              <label>Sets:</label>
              <input type="number" id="editSets" value="${setsInput.value}">
              <label>Reps:</label>
              <input type="number" id="editReps" value="${repsInput.value}">
            `,
            onConfirm: () => {
              nameInput.value = document.getElementById('editName').value;
              setsInput.value = document.getElementById('editSets').value;
              repsInput.value = document.getElementById('editReps').value;
            },
            onCancel: () => {}
          });
        }
      
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
      
}