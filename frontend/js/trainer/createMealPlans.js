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
      showToast("There are no meal plans created", "error");
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

  // ------------------- delete popup modal -------------------
  const deleteModal = document.getElementById('deleteConfirmationModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const closeModalBtn = deleteModal.querySelector('.close-btn');

  let currentDeletionId = null;

  //delete handler
  function handleDeletePlan(e) {
    currentDeletionId = e.target.dataset.id;
    deleteModal.classList.remove('hidden');
  }

  // Confirm deletion
  confirmDeleteBtn.onclick = async function() {
    if (!currentDeletionId) return;
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('Auth token not found');
        return;
      }

      const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=delete_created_meal_plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: currentDeletionId })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete plan");
      }
      
      console.log('Meal plan deleted successfully');
      showToast("Meal plan deleted successfully", 'success');
      await fetchMealPlans(); // Refresh the list
      deleteModal.classList.add('hidden');
      
    } catch (err) {
      console.error('Error deleting plan:', err);
      showToast("Error deleting plan: " + err.message, 'error');
    }
  };

  // Close modal handlers for delete model
  [cancelDeleteBtn, closeModalBtn].forEach(btn => {
    btn.onclick = () => deleteModal.classList.add('hidden');
  });

  // Close when clicking outside modal for delete model
  window.onclick = function(event) {
    if (event.target === deleteModal) {
      deleteModal.classList.add('hidden');
    }
  };

  // Update existing delete button listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = handleDeletePlan;
  });

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

      showToast("Meal plan updated successfully", 'success');
      editModal.classList.add("hidden");
      await fetchMealPlans();

    } catch (err) {
      console.error("Error updating plan:", err);
      showToast("Error updating plan: " + err.message, 'error');
    }
  };

  closeBtn.onclick = () => viewModal.classList.add("hidden");
  closeEditBtn.onclick = () => editModal.classList.add("hidden");

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


  fetchMealPlans(); // Initial fetch when the function runs
}