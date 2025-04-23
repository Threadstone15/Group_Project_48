export function initTrainer_createMealPlans() {
  console.log("initializing workout meal plans");
  // Get DOM Elements
  const workoutDaysContainer = document.querySelector('.workout-days-container');
  const workoutPlannerContainer = document.getElementById('workout-planner');
  const generatePlannerButton = document.getElementById('generate-planner');
  const workoutDaysInput = document.getElementById('workout-days');

  // Function to generate the workout planner
  function generateWorkoutPlanner() {
    const workoutDays = parseInt(workoutDaysInput.value);

    if (!workoutDays || workoutDays < 1 || workoutDays > 7) {
      alert('Please enter a valid number of days (1-7).');
      return;
    }

    workoutDaysContainer.style.display = 'none';
    workoutPlannerContainer.innerHTML = '';

    // Generate planner columns for each day
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
  }

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
      showEditModal(exerciseRow.querySelector('.exercise-name'), exerciseRow.querySelector('.exercise-sets'), exerciseRow.querySelector('.exercise-reps'))
    );
    exerciseRow.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-exercise-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => showDeleteModal(exerciseRow));
    exerciseRow.appendChild(deleteButton);

    container.appendChild(exerciseRow);
  }

  // Function to show a modal
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
    closeButton.addEventListener('click', () =>
      document.body.removeChild(modalOverlay)
    );
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

  // Function to show edit modal
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
      onCancel: () => console.log('Edit canceled.'),
    });
  }

  // Function to show delete modal
  function showDeleteModal(exerciseRow) {
    const content = `<p>Are you sure you want to delete this exercise?</p>`;
    showModal({
      title: 'Delete Exercise',
      content,
      onConfirm: () => {
        exerciseRow.remove();
        alert('Exercise deleted successfully!');
      },
      onCancel: () => console.log('Delete canceled.'),
    });
  }

  // Attach event listener
  generatePlannerButton.addEventListener('click', generateWorkoutPlanner);

}