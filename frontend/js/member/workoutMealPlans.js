export function initMember_workoutMealPlans() {
    console.log('initializing mealPlans.js');
  
    // Get DOM Elements
    const mealDaysContainer = document.querySelector('.meal-days-container');
    const mealPlannerContainer = document.getElementById('meal-planner');
    const generatePlannerButton = document.getElementById('generate-meal-planner');
    const mealDaysInput = document.getElementById('meal-days');
  
    // Generate the meal planner
    function generateMealPlanner() {
      const mealDays = parseInt(mealDaysInput.value);
  
      if (!mealDays || mealDays < 1 || mealDays > 7) {
        alert('Please enter a valid number of days (1-7).');
        return;
      }
  
      mealDaysContainer.style.display = 'none';
      mealPlannerContainer.innerHTML = '';
  
      for (let i = 1; i <= mealDays; i++) {
        const column = document.createElement('div');
        column.className = 'meal-column';
  
        const title = document.createElement('h3');
        title.textContent = `Day ${i}`;
        column.appendChild(title);
  
        const mealContainer = document.createElement('div');
        mealContainer.className = 'meal-container';
        column.appendChild(mealContainer);
  
        addMealRow(mealContainer);
  
        const addMealButton = document.createElement('button');
        addMealButton.className = 'add-meal-btn';
        addMealButton.textContent = 'Add another meal';
        addMealButton.addEventListener('click', () =>
          addMealRow(mealContainer)
        );
        column.appendChild(addMealButton);
  
        mealPlannerContainer.appendChild(column);
      }
    }
  
    // Add a meal row
    function addMealRow(container) {
      const mealRow = document.createElement('div');
      mealRow.className = 'meal-row';
  
      mealRow.innerHTML = `
        <input type="text" placeholder="Meal name" class="meal-name">
        <input type="time" class="meal-time">
        <input type="number" placeholder="Calories" class="meal-calories">
      `;
  
      const editButton = document.createElement('button');
      editButton.className = 'edit-meal-btn';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () =>
        showEditModal(
          mealRow.querySelector('.meal-name'),
          mealRow.querySelector('.meal-time'),
          mealRow.querySelector('.meal-calories')
        )
      );
      mealRow.appendChild(editButton);
  
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-meal-btn';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => showDeleteModal(mealRow));
      mealRow.appendChild(deleteButton);
  
      container.appendChild(mealRow);
    }
  
    // Modal logic
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
  
    // Edit modal
    function showEditModal(nameInput, timeInput, caloriesInput) {
      const content = `
        <label>Meal Name:</label>
        <input type="text" value="${nameInput.value}" id="edit-meal-name">
        <label>Time:</label>
        <input type="time" value="${timeInput.value}" id="edit-meal-time">
        <label>Calories:</label>
        <input type="number" value="${caloriesInput.value}" id="edit-meal-calories">
      `;
  
      showModal({
        title: 'Edit Meal',
        content,
        onConfirm: () => {
          nameInput.value = document.getElementById('edit-meal-name').value;
          timeInput.value = document.getElementById('edit-meal-time').value;
          caloriesInput.value = document.getElementById('edit-meal-calories').value;
          alert('Meal updated successfully!');
        },
        onCancel: () => console.log('Edit canceled.'),
      });
    }
  
    // Delete modal
    function showDeleteModal(mealRow) {
      const content = `<p>Are you sure you want to delete this meal?</p>`;
      showModal({
        title: 'Delete Meal',
        content,
        onConfirm: () => {
          mealRow.remove();
          alert('Meal deleted successfully!');
        },
        onCancel: () => console.log('Delete canceled.'),
      });
    }
  
    // Attach event listener
    generatePlannerButton.addEventListener('click', generateMealPlanner);
  }
  