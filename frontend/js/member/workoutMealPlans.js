export function initMember_workoutMealPlan() {
  console.log('initializing workoutMealPlan.js');
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

  // =============Meal Planner=============

// Function to initialize meal planner
export function initMember_mealPlan() {
  console.log('initializing mealPlan.js');
  
  // Get DOM Elements
  const mealDaysContainer = document.querySelector('.meal-days-container');
  const mealPlannerContainer = document.getElementById('meal-planner');
  const generateMealPlanButton = document.getElementById('generate-meal-plan');
  const mealDaysInput = document.getElementById('meal-days');

  // Function to generate the meal planner
  function generateMealPlanner() {
    const mealDays = parseInt(mealDaysInput.value);

    if (!mealDays || mealDays < 1 || mealDays > 7) {
      alert('Please enter a valid number of days (1-7).');
      return;
    }

    mealDaysContainer.style.display = 'none';
    mealPlannerContainer.innerHTML = '';

    // Generate planner columns for each day
    for (let i = 1; i <= mealDays; i++) {
      const column = document.createElement('div');
      column.className = 'day-column';

      const title = document.createElement('h3');
      title.textContent = `Day ${i}`;
      column.appendChild(title);

      // Add meal type dropdown
      const mealTypeSelect = document.createElement('select');
      mealTypeSelect.className = 'meal-type';
      ['Breakfast', 'Lunch', 'Dinner', 'Snack'].forEach(type => {
        const option = document.createElement('option');
        option.value = type.toLowerCase();
        option.textContent = type;
        mealTypeSelect.appendChild(option);
      });
      column.appendChild(mealTypeSelect);

      // Create meal table
      const mealTable = document.createElement('table');
      mealTable.className = 'meal-table';
      mealTable.innerHTML = `
        <thead>
          <tr>
            <th>Meal</th>
            <th>Ingredients</th>
            <th>Grams/Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      `;
      column.appendChild(mealTable);

      // Add initial meal row
      addMealRow(mealTable.querySelector('tbody'));

      // Add "Add Meal" button
      const addMealButton = document.createElement('button');
      addMealButton.className = 'add-meal-btn';
      addMealButton.textContent = `Add ${mealTypeSelect.value}`;
      addMealButton.addEventListener('click', () => 
        addMealRow(mealTable.querySelector('tbody'))
      );
      
      // Update button text when meal type changes
      mealTypeSelect.addEventListener('change', () => {
        addMealButton.textContent = `Add ${mealTypeSelect.value}`;
      });

      column.appendChild(addMealButton);
      mealPlannerContainer.appendChild(column);
    }

    // Add save button
    const saveButton = document.createElement('button');
    saveButton.className = 'save-plan-btn';
    saveButton.textContent = 'Save Meal Plan';
    saveButton.addEventListener('click', saveMealPlan);
    mealPlannerContainer.appendChild(saveButton);
  }

  // Function to add a meal row
  function addMealRow(tbody) {
    const mealRow = document.createElement('tr');
    mealRow.className = 'meal-row';

    mealRow.innerHTML = `
      <td><input type="text" placeholder="Meal name" class="meal-name"></td>
      <td><input type="text" placeholder="Ingredients" class="meal-ingredients"></td>
      <td><input type="text" placeholder="Amount" class="meal-quantity"></td>
    `;

    const editButton = document.createElement('button');
    editButton.className = 'edit-meal-btn';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () =>
      showEditMealModal(
        mealRow.querySelector('.meal-name'),
        mealRow.querySelector('.meal-ingredients'),
        mealRow.querySelector('.meal-quantity')
      )
    );

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-meal-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => showDeleteModal(mealRow));

    const actionCell = document.createElement('td');
    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);
    mealRow.appendChild(actionCell);

    tbody.appendChild(mealRow);
  }

  // Function to show edit meal modal
  function showEditMealModal(mealInput, ingredientsInput, quantityInput) {
    const content = `
      <label>Meal Name:</label>
      <input type="text" value="${mealInput.value}" id="edit-meal-name">
      <label>Ingredients:</label>
      <input type="text" value="${ingredientsInput.value}" id="edit-ingredients">
      <label>Quantity:</label>
      <input type="text" value="${quantityInput.value}" id="edit-quantity">
    `;
    showModal({
      title: 'Edit Meal',
      content,
      onConfirm: () => {
        mealInput.value = document.getElementById('edit-meal-name').value;
        ingredientsInput.value = document.getElementById('edit-ingredients').value;
        quantityInput.value = document.getElementById('edit-quantity').value;
        alert('Meal updated successfully!');
      },
      onCancel: () => console.log('Edit canceled.'),
    });
  }

  // Function to save meal plan (reusing the same showModal function from workout planner)
  function saveMealPlan() {
    const mealPlans = [];
    const dayColumns = document.querySelectorAll('.day-column');
    
    dayColumns.forEach(column => {
      const dayNumber = column.querySelector('h3').textContent.replace('Day ', '');
      const mealType = column.querySelector('.meal-type').value;
      const meals = [];
      
      column.querySelectorAll('.meal-row').forEach(row => {
        meals.push({
          name: row.querySelector('.meal-name').value,
          ingredients: row.querySelector('.meal-ingredients').value,
          quantity: row.querySelector('.meal-quantity').value
        });
      });
      
      mealPlans.push({
        day: dayNumber,
        mealType,
        meals
      });
    });

    console.log('Meal Plan to Save:', mealPlans);
    alert('Meal plan saved successfully!');
  }

  // Attach event listener
  generateMealPlanButton.addEventListener('click', generateMealPlanner);
}