export function initMember_workoutMealPlans() {
  console.log('Initializing single-day meal planner');

  const mealPlannerContainer = document.getElementById('meal-planner');
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
    mealPlannerContainer.innerHTML = '';

    const column = document.createElement('div');
    column.className = 'meal-column';

    const title = document.createElement('h3');
    title.textContent = `Meal Plan for Today`;
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
    mealPlannerContainer.appendChild(column);
  }

  async function sendMealPlanToBackend() {
    const mealPlan = collectMealPlanData();
    const authToken = localStorage.getItem("authToken");

    console.log(mealPlan);

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
      alert("Meal plan saved successfully!");
    } else {
      alert("Failed to save meal plan: " + result.message);
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
}
