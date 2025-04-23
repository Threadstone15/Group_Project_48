export function initMember_myPlans() {
    console.log("initializing myPlans.js");
  
    const workoutBtn = document.getElementById('workoutBtn');
    const mealBtn = document.getElementById('mealBtn');
    const planTypeModal = document.getElementById('planTypeModal');
    const planListModal = document.getElementById('planListModal');
    const plansContainer = document.getElementById('plansContainer');
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
  
        // Save all plans to localStorage
        localStorage.setItem(`${category}_plans`, JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching plans:", error);
        alert("An error occurred while fetching your plans.");
      }
    }
  
    function renderPlans(category, plans) {
      plansContainer.innerHTML = '';
  
      plans.forEach(plan => {
        const div = document.createElement('div');
        div.classList.add('plan-item');
  
        if (category === 'workout') {
          try {
            const description = JSON.parse(plan.description);
            description.forEach(day => {
              const dayDiv = document.createElement('div');
              dayDiv.innerHTML = `<strong>Day ${day.day}:</strong>`;
              day.exercises.forEach(ex => {
                const exDiv = document.createElement('div');
                exDiv.textContent = `${ex.name} - ${ex.sets} sets x ${ex.reps} reps`;
                dayDiv.appendChild(exDiv);
              });
              div.appendChild(dayDiv);
            });
          } catch (e) {
            div.textContent = "Invalid workout plan format.";
          }
        } else {
          try {
            const meals = JSON.parse(plan.description);
            meals.forEach(meal => {
              const mealDiv = document.createElement('div');
              mealDiv.innerHTML = `<strong>${meal.meal}:</strong> ${meal.items}`;
              div.appendChild(mealDiv);
            });
          } catch (e) {
            div.textContent = plan.description;
          }
        }
  
        plansContainer.appendChild(div);
      });
    }
  }
  