export function initTrainer_createMealPlans() {
  console.log("Initializing meal plans");

  let mealPlans = [];

  const tbody = document.getElementById("plansTableBody");
  const totalPlans = document.getElementById("totalPlans");
  const viewModal = document.getElementById("viewPlanModal");
  const viewDetails = document.getElementById("planDetails");
  const closeBtn = document.querySelector(".close-btn");

  const editModal = document.getElementById("editPlanModal");
  const closeEditBtn = document.querySelector(".close-edit-btn");
  const editMealsContainer = document.getElementById("editMealsContainer");
  const saveEditBtn = document.getElementById("saveEditBtn");

  async function fetchMealPlans() {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Auth token not found. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_created_meal_plans", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch meal plans");

      const data = await response.json();
      mealPlans = data || [];
      mealPlans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      renderPlans();
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      alert("Error fetching meal plans. Please try again.");
    }
  }

  function renderPlans() {
    tbody.innerHTML = "";
    mealPlans.forEach((plan) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${plan.member_name}</td>
        <td>${plan.phone}</td>
        <td>${new Date(plan.created_at).toLocaleString()}</td>
        <td>
          <button onclick="viewPlan(${plan.id})">View</button>
          <button onclick="editPlan(${plan.id})">Edit</button>
          <button data-id="${plan.id}" class="delete-btn">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    totalPlans.textContent = mealPlans.length;

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.onclick = handleDeletePlan;
    });
  }

  window.viewPlan = function (id) {
    const plan = mealPlans.find((p) => p.id === id);
    if (!plan) return;
    const meals = JSON.parse(plan.description);
    viewDetails.innerHTML = meals.map(
      (meal) => `<p><strong>${meal.type}</strong>: ${meal.name}, ${meal.time}, ${meal.calories} cal</p>`
    ).join("");
    viewModal.classList.remove("hidden");
  };

  window.editPlan = function (id) {
    const plan = mealPlans.find((p) => p.id === id);
    if (!plan) return;

    document.getElementById("editPlanId").value = id;
    document.getElementById("editMemberName").textContent = plan.member_name;
    document.getElementById("editPhone").textContent = plan.phone;

    const meals = JSON.parse(plan.description);
    editMealsContainer.innerHTML = "";
    meals.forEach((meal, index) => {
      const mealRow = document.createElement("div");
      mealRow.innerHTML = `
        <input type="text" placeholder="Type" value="${meal.type}" class="meal-type">
        <input type="text" placeholder="Name" value="${meal.name}" class="meal-name">
        <input type="time" value="${meal.time}" class="meal-time">
        <input type="number" placeholder="Calories" value="${meal.calories}" class="meal-calories">
        <hr>
      `;
      editMealsContainer.appendChild(mealRow);
    });

    editModal.classList.remove("hidden");
  };

  async function handleDeletePlan(e) {
    const id = e.target.dataset.id;
    if (confirm("Are you sure you want to delete this meal plan?")) {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          alert("Auth token not found. Please log in.");
          return;
        }

        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=delete_created_meal_plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ id })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to delete plan");

        alert("Meal plan deleted successfully");
        await fetchMealPlans();
      } catch (err) {
        console.error("Error deleting plan:", err);
        alert("Error deleting plan. Please try again.");
      }
    }
  }

  saveEditBtn.onclick = async () => {
    const id = parseInt(document.getElementById("editPlanId").value);
    const plan = mealPlans.find((p) => p.id === id);
    if (!plan) return;

    const types = document.querySelectorAll(".meal-type");
    const names = document.querySelectorAll(".meal-name");
    const times = document.querySelectorAll(".meal-time");
    const calories = document.querySelectorAll(".meal-calories");

    const updatedMeals = Array.from(types).map((_, i) => ({
      type: types[i].value,
      name: names[i].value,
      time: times[i].value,
      calories: parseInt(calories[i].value),
    }));

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Auth token not found. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=edit_created_meal_plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: id,
          description: JSON.stringify(updatedMeals)
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to update meal plan");

      alert("Meal plan updated successfully");
      editModal.classList.add("hidden");
      await fetchMealPlans();

    } catch (err) {
      console.error("Error updating plan:", err);
      alert("Error updating plan: " + err.message);
    }
  };

  closeBtn.onclick = () => viewModal.classList.add("hidden");
  closeEditBtn.onclick = () => editModal.classList.add("hidden");



  fetchMealPlans(); // Initial fetch when the function runs
}
