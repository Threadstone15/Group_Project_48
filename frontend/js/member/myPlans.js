export function initMember_myPlans() {
    console.log("initializing myPlans.js");
  
    const workoutBtn = document.getElementById('workoutBtn');
    const mealBtn = document.getElementById('mealBtn');
    const planTypeModal = document.getElementById('planTypeModal');
    const planListModal = document.getElementById('planListModal');
    const planListTitle = document.getElementById('planListTitle');
  
    let selectedCategory = ''; // "workout" or "meal"
  
    workoutBtn.addEventListener('click', () => {
      selectedCategory = 'workout';
      fetchPlansFromBackend(selectedCategory).then(() => {
        planTypeModal.classList.remove('hidden');
      });
    });
  
    mealBtn.addEventListener('click', () => {
      selectedCategory = 'meal';
      fetchPlansFromBackend(selectedCategory).then(() => {
        planTypeModal.classList.remove('hidden');
      });
    });
  
    planTypeModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('secondary-btn')) {
        const planType = e.target.getAttribute('data-type'); // "personal" or "trainer"
        const allPlans = JSON.parse(localStorage.getItem(`${selectedCategory}_plans`)) || [];
  
        const filteredPlans = planType === 'personal'
          ? allPlans.filter(plan => plan.trainer_id === null)
          : allPlans.filter(plan => plan.trainer_id !== null);
  
        planListTitle.textContent = `${planType.charAt(0).toUpperCase() + planType.slice(1)} ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Plans`;
        renderPlans(selectedCategory, filteredPlans);
  
        planTypeModal.classList.add('hidden');
        planListModal.classList.remove('hidden');
      } else if (e.target.classList.contains('close-btn')) {
        planTypeModal.classList.add('hidden');
      }
    });
  
    planListModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-btn')) {
        planListModal.classList.add('hidden');
      } else if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        const category = e.target.dataset.category;
        if (confirm("Are you sure you want to delete this plan?")) {
          deletePlan(id, category);
        }
      } else if (e.target.classList.contains('edit-btn')) {
        const id = e.target.dataset.id;
        const category = e.target.dataset.category;
        const allPlans = JSON.parse(localStorage.getItem(`${category}_plans`)) || [];
        const plan = allPlans.find(plan => plan.id == id);
    
        if (plan) {
          document.getElementById('editPlanId').value = plan.id;
          document.getElementById('editPlanCategory').value = category;
          document.getElementById('planName').value = plan.name;
    
          try {
            const parsedDescription = JSON.parse(plan.description);
            if (category === 'meal') {
              document.getElementById('mealDetails').classList.remove('hidden');
              document.getElementById('workoutDetails').classList.add('hidden');
              renderMealInputs(parsedDescription);
            } else {
              document.getElementById('workoutDetails').classList.remove('hidden');
              document.getElementById('mealDetails').classList.add('hidden');
              renderWorkoutInputs(parsedDescription);
            }
          } catch (e) {
            console.error("Error parsing plan description:", e);
            alert("Error loading plan details. The format may be invalid.");
          }
    
          document.getElementById('editPlanModal').classList.remove('hidden');
        }
      }
    });
  
    async function fetchPlansFromBackend(category) {
      console.log("Fetching plans from backend...");
  
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Auth token not found. Please log in.");
        return;
      }
  
      const endpoint = category === 'workout'
        ? `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_workout_plans`
        : `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=get_meal_plans`;
  
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch plans.");
        console.log("Data received from backend:", data);
  
        localStorage.setItem(`${category}_plans`, JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching plans:", error);
        alert("An error occurred while fetching your plans.");
      }
    }
  
    function renderPlans(category, plans) {
      const tableBody = document.getElementById('plansTableBody');
      tableBody.innerHTML = ''; // Clear existing rows
  
      plans.forEach((plan, index) => {
        const row = document.createElement('tr');
  
        const trainerText = plan.trainer_id ? `Trainer #${plan.trainer_id}` : 'Personal';
  
        let details = '';
        try {
          const parsed = JSON.parse(plan.description);
          if (category === 'workout') {
            if (Array.isArray(parsed)) {
              parsed.forEach(day => {
                details += `<strong>Day ${day.day}:</strong><br>`;
                if (day.exercises && Array.isArray(day.exercises)) {
                  day.exercises.forEach(ex => {
                    details += `${ex.name} - ${ex.sets} sets x ${ex.reps} reps<br>`;
                  });
                }
              });
            }
          } else {
            if (typeof parsed === 'object' && parsed !== null) {
              Object.entries(parsed).forEach(([mealType, mealData]) => {
                details += `<strong>${mealType}</strong> - ${mealData.name || ''}<br>
                            <em>Time:</em> ${mealData.time || ''} | <em>Calories:</em> ${mealData.calories || ''}<br>`;
              });
            }
          }
        } catch (e) {
          console.error("Error parsing plan description:", e);
          details = plan.description || "Invalid format or empty description.";
        }
  
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${details}</td>
          <td>${trainerText}</td>
          <td>${new Date(plan.created_at).toLocaleString()}</td>
          <td>
            <button class="edit-btn" data-id="${plan.id}" data-category="${category}">Edit</button>
            <button class="delete-btn" data-id="${plan.id}" data-category="${category}">Remove</button>
          </td>
        `;
  
        tableBody.appendChild(row);
      });  
    }
  
    function renderMealInputs(description) {
      const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
      const container = document.getElementById('mealInputs');
      container.innerHTML = '';
    
      meals.forEach(meal => {
        const data = description[meal] || { time: '', calories: '', name: '' };
        container.innerHTML += `
          <div>
            <label>${meal.charAt(0).toUpperCase() + meal.slice(1)}:</label>
            <input type="text" name="${meal}_name" placeholder="Meal Name" value="${data.name || ''}">
            <input type="text" name="${meal}_time" placeholder="Time" value="${data.time || ''}">
            <input type="number" name="${meal}_calories" placeholder="Calories" value="${data.calories || ''}">
          </div>
        `;
      });
    }
  
    function renderWorkoutInputs(description) {
      const container = document.getElementById('workoutInputs');
      container.innerHTML = '';
    
      if (Array.isArray(description)) {
        description.forEach((day, i) => {
          const dayHeader = document.createElement('h4');
          dayHeader.textContent = `Day ${day.day || i + 1}`;
          container.appendChild(dayHeader);
          
          if (day.exercises && Array.isArray(day.exercises)) {
            day.exercises.forEach((ex, j) => {
              const exerciseDiv = document.createElement('div');
              exerciseDiv.className = 'exercise-row';
              exerciseDiv.innerHTML = `
                <input type="text" name="exercise_day_${i}_name_${j}" placeholder="Exercise Name" value="${ex.name || ''}">
                <input type="number" name="exercise_day_${i}_sets_${j}" placeholder="Sets" value="${ex.sets || ''}">
                <input type="number" name="exercise_day_${i}_reps_${j}" placeholder="Reps" value="${ex.reps || ''}">
              `;
              container.appendChild(exerciseDiv);
            });
          }
        });
      }
    }
  
    document.getElementById('addWorkoutRow').addEventListener('click', () => {
      const container = document.getElementById('workoutInputs');
      const dayCount = container.querySelectorAll('h4').length;
      const exerciseCount = container.querySelectorAll('.exercise-row').length;
      
      const exerciseDiv = document.createElement('div');
      exerciseDiv.className = 'exercise-row';
      exerciseDiv.innerHTML = `
        <input type="text" name="exercise_day_${dayCount}_name_${exerciseCount}" placeholder="Exercise Name">
        <input type="number" name="exercise_day_${dayCount}_sets_${exerciseCount}" placeholder="Sets">
        <input type="number" name="exercise_day_${dayCount}_reps_${exerciseCount}" placeholder="Reps">
      `;
      container.appendChild(exerciseDiv);
    });
  
    document.getElementById('editPlanForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const planId = document.getElementById('editPlanId').value;
      const category = document.getElementById('editPlanCategory').value;
      const planName = document.getElementById('planName').value;
      const authToken = localStorage.getItem('authToken');
    
      let description = {};
    
      if (category === 'meal') {
        description = ['breakfast', 'lunch', 'dinner', 'snack'].reduce((acc, meal) => {
          acc[meal] = {
            name: document.querySelector(`[name="${meal}_name"]`).value,
            time: document.querySelector(`[name="${meal}_time"]`).value,
            calories: parseInt(document.querySelector(`[name="${meal}_calories"]`).value) || 0
          };
          return acc;
        }, {});
      } else {
        description = [];
        const dayHeaders = document.querySelectorAll('#workoutInputs h4');
        
        dayHeaders.forEach((header, dayIndex) => {
          const dayExercises = [];
          const exerciseRows = header.nextElementSibling.querySelectorAll('.exercise-row') || [];
          
          exerciseRows.forEach(row => {
            dayExercises.push({
              name: row.querySelector(`[name^="exercise_day_${dayIndex}_name_"]`).value,
              sets: parseInt(row.querySelector(`[name^="exercise_day_${dayIndex}_sets_"]`).value) || 0,
              reps: parseInt(row.querySelector(`[name^="exercise_day_${dayIndex}_reps_"]`).value) || 0
            });
          });
          
          description.push({
            day: dayIndex + 1,
            exercises: dayExercises
          });
        });
      }
    
      const updatedPlan = {
        id: planId,
        name: planName,
        description: JSON.stringify(description),
      };
    
      const endpoint = category === 'workout'
        ? `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=update_workout_plan`
        : `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=update_meal_plan`;
    
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedPlan),
        });
    
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update plan.');
    
        document.getElementById('editPlanModal').classList.add('hidden');
        await fetchPlansFromBackend(category);
        alert('Plan updated successfully!');
      } catch (error) {
        console.error('Error updating plan:', error);
        alert('An error occurred while updating the plan.');
      }
    });
  
    async function deletePlan(planId, category) {
      const authToken = localStorage.getItem("authToken");
      const endpoint = category === 'workout'
        ? `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=delete_workout_plan`
        : `http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=delete_meal_plan`;
  
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ id: planId })
        });
  
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to delete plan.");
        alert("Plan deleted successfully.");
  
        await fetchPlansFromBackend(category);
        const updatedPlans = JSON.parse(localStorage.getItem(`${category}_plans`)) || [];
        renderPlans(category, updatedPlans);
      } catch (error) {
        console.error("Error deleting plan:", error);
        alert("An error occurred while deleting the plan.");
      }
    }
  
    // Close modal when clicking outside of it
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });
  
    document.querySelectorAll('.close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal').classList.add('hidden');
      });
    });
}