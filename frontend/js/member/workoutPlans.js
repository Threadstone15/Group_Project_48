export function initMember_workoutPlans() {
  console.log('initializing workoutPlans.js');

  // Get DOM Elements
  const workoutDaysContainer = document.querySelector('.workout-days-container');
  const workoutPlannerContainer = document.getElementById('workout-planner');
  const generatePlannerButton = document.getElementById('generate-planner');
  const workoutDaysInput = document.getElementById('workout-days');
  const requestBtn = document.getElementById('request-planner');
  const modal = document.getElementById('requestModal');
  const closeBtn = document.querySelector('.close1-btn');
  const messageArea = document.getElementById('modal1-message-area');
  const noTrainerMsg = document.getElementById('no-trainer-msg');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const trainerMessage = document.getElementById('trainerMessage');
  const plannerModal = document.getElementById('plannerModal');
  const closePlannerBtn = document.getElementById('closePlannerBtn');


  const authToken = localStorage.getItem('authToken');
  let assignedTrainerId = null;

  requestBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=check_trainer', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      console.log(data);
      modal.classList.remove('hidden1');
      if (data && data.trainer_id) {
        assignedTrainerId = data.trainer_id;
        messageArea.classList.remove('hidden1');
        noTrainerMsg.classList.add('hidden1');
      } else {
        messageArea.classList.add('hidden1');
        noTrainerMsg.classList.remove('hidden1');
      }
    } catch (err) {
      alert('Error checking trainer status.');
      console.error(err);
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden1');
    trainerMessage.value = '';
  });

  sendMessageBtn.addEventListener('click', async () => {
    const message = trainerMessage.value.trim();
    if (!message) return alert('Please enter a message.');

    try {
      const res = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=request_workout_plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          message: message,
          trainer_id: assignedTrainerId
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to send message.');

      alert('Request sent successfully!');
      modal.classList.add('hidden1');
      trainerMessage.value = '';
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    }
  });

  // Function to generate the workout planner
  function generateWorkoutPlanner() {
    const workoutDays = parseInt(workoutDaysInput.value);

    if (!workoutDays || workoutDays < 1 || workoutDays > 7) {
      showToast('Please enter a valid number of days (1-7)', 'error');
      return;
    }

    plannerModal.classList.remove('hidden1');

    // workoutDaysContainer.style.display = 'none';
    workoutPlannerContainer.innerHTML = '';

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

      workoutPlannerContainer.appendChild(column);
    }

    // Optionally, add a save button
    const saveButton = document.createElement('button');
    saveButton.className = 'save-workout-btn';
    saveButton.textContent = 'Save Workout Plan';
    saveButton.addEventListener('click', sendWorkoutPlanToBackend);
    workoutPlannerContainer.appendChild(saveButton);
  }

  closePlannerBtn.addEventListener('click', () => {
    plannerModal.classList.add('hidden1');
  });

  // Function to add an exercise row
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

  // Modal utility
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

  // Edit modal
  function showEditModal(exerciseInput, setsInput, repsInput) {
    const content = `
      <label>Exercise Name:</label>
      <input type="text" value="${exerciseInput.value}" id="edit-exercise-name">
      <label>No. of Sets:</label>
      <input type="number" value="${setsInput.value}" id="edit-sets">
      <label>No. of Reps:</label>
      <input type="number" value="${repsInput.value}" id="edit-reps">
    `;
    showModal({
      title: 'Edit Exercise',
      content,
      onConfirm: () => {
        exerciseInput.value = document.getElementById('edit-exercise-name').value;
        setsInput.value = document.getElementById('edit-sets').value;
        repsInput.value = document.getElementById('edit-reps').value;
        alert('Exercise updated successfully!');
      },
      onCancel: () => console.log('Edit canceled.')
    });
  }

  // Delete modal
  function showDeleteModal(exerciseRow) {
    const content = `<p>Are you sure you want to delete this exercise?</p>`;
    showModal({
      title: 'Delete Exercise',
      content,
      onConfirm: () => {
        exerciseRow.remove();
        alert('Exercise deleted successfully!');
      },
      onCancel: () => console.log('Delete canceled.')
    });
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

  function validateWorkoutPlanner() {
    const inputs = document.querySelectorAll('.workout-planner input, .workout-planner select, .workout-planner textarea');

    for (let input of inputs) {
      if (input.value.trim() === '') {
        showToast('Fields cannot be empty' ,"error");
        return false;
      }
    }
    return true;
  }


  // Send workout plan to backend
  async function sendWorkoutPlanToBackend() {
    const workoutPlan = collectWorkoutPlanData();
    const authToken = localStorage.getItem("authToken");
    console.log(workoutPlan);

    if (!validateWorkoutPlanner()) {
      return;
    }

    if (!authToken) {
      alert("Auth token not found. Please log in.");
      return;
    }

    const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=create_workout_plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        workout_plan: workoutPlan
      })
    });

    const result = await response.json();
    if (response.ok) {
      showToast("Workout plan saved successfully!", "success");
      plannerModal.classList.add('hidden1');
    } else {
      showToast("Failed to save workout plan: " + result.message, "error");
    }
  }




  // Initialize
  generatePlannerButton.addEventListener('click', generateWorkoutPlanner);

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
