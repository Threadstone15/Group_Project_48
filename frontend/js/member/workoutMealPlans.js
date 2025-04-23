export function initMember_workoutMealPlans() {
  console.log('Initializing single-day meal planner');

  const mealPlannerContainer = document.getElementById('meal-planner');
  const generatePlannerButton = document.getElementById('generate-meal-planner');

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
