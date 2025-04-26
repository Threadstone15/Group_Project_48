export function initMember_workoutMealPlans() {
  console.log('Initializing single-day meal planner');

  const mealPlanner = document.getElementById('meal-planner');
  const mealPlannerContainer = document.getElementById('meal-planner-container');
  const mealPlannerCloseButton = document.getElementById('closeMealPlannerBtn');
  const generatePlannerButton = document.getElementById('generate-meal-planner');
  const requestBtn = document.getElementById('request-planner');
  const modal = document.getElementById('requestModal');
  const closeBtn = document.querySelector('.close1-btn');
  const messageArea = document.getElementById('modal1-message-area');
  const noTrainerMsg = document.getElementById('no-trainer-msg');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const trainerMessage = document.getElementById('trainerMessage');

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
      const res = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=request_meal_plan', {
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

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  function generateMealPlanner() {
    mealPlannerContainer.style.display = 'block';
    mealPlanner.innerHTML = '';

    const column = document.createElement('div');
    column.className = 'meal-column';

    const title = document.createElement('h3');
    title.textContent = `Meal Planner`;
    column.appendChild(title);

    const mealContainer = document.createElement('div');
    mealContainer.className = 'meal-container';

    mealTypes.forEach((meal) => {
      const mealRow = document.createElement('div');
      mealRow.className = 'meal-row';

      mealRow.innerHTML = `
        <label>${meal}</label>
        <input type="text" placeholder="Meal name" class="meal-name" data-meal-type="${meal}">
        <input type="time" class="meal-time">
        <input type="number" placeholder="Calories" class="meal-calories">
      `;

      mealContainer.appendChild(mealRow);
    });

    column.appendChild(mealContainer);

    const saveButton = document.createElement('button');
    saveButton.className = 'save-meal-plan-btn';
    saveButton.textContent = 'Save Meal Plan';
    saveButton.addEventListener('click', sendMealPlanToBackend);

    column.appendChild(saveButton);
    mealPlanner.appendChild(column);
  }

  mealPlannerCloseButton.addEventListener('click', () => {
    mealPlannerContainer.style.display = 'none';
    mealPlanner.innerHTML = '';
  });

  async function sendMealPlanToBackend() {
    const mealPlan = collectMealPlanData();
    const authToken = localStorage.getItem("authToken");

    if (!mealPlan) {
      return;
    }

    if (!authToken) {
      alert("Auth token not found. Please log in.");
      return;
    }

    const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=create_meal_plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        meal_plan: mealPlan
      })
    });

    const result = await response.json();
    if (response.ok) {
      showToast("Meal plan saved successfully!", "success");
      mealPlannerContainer.style.display = 'none';
      mealPlanner.innerHTML = '';
    } else {
      showToast("Failed to save meal plan. Please try again later", "error");
    }
  }

  function collectMealPlanData() {
    const mealRows = document.querySelectorAll('.meal-row');
    const plan = [];

    mealRows.forEach(row => {
      const type = row.querySelector('.meal-name').dataset.mealType;
      const name = row.querySelector('.meal-name').value;
      const time = row.querySelector('.meal-time').value;
      const calories = row.querySelector('.meal-calories').value;

      if (!name || !time || !calories) {
        showToast("All fields are required", "error");
        return null; // Stop and return nothing
      }

      plan.push({
        type,
        name,
        time,
        calories: parseInt(calories) || 0
      });
    });

    return plan;
  }

  generatePlannerButton.addEventListener('click', generateMealPlanner);

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
