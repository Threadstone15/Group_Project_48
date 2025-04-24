export function initTrainer_createWorkoutPlans() {
  console.log("Initializing workout meal plans");

  // DOM Elements
  const plansTableBody = document.getElementById('plansTableBody');
  const totalPlansElement = document.getElementById('totalPlans');
  const viewPlanModal = document.getElementById('viewPlanModal');
  const planDetails = document.getElementById('planDetails');
  const closeModalBtn = document.querySelector('.close-btn');
  const editPlanModal = document.getElementById('editPlanModal');
  const closeEditBtn = document.querySelector('.close-edit-btn');
  const editPlanForm = document.getElementById('editPlanForm');
  const editMemberName = document.getElementById('editMemberName');
  const editPhone = document.getElementById('editPhone');
  const editDescription = document.getElementById('editDescription');
  const editPlanId = document.getElementById('editPlanId');
  const saveEditBtn = document.getElementById('saveEditBtn');
  const editExercisesContainer = document.getElementById('editExercisesContainer');

  // Global variables
  let workoutPlans = [];

  // Initialize the page
  fetchWorkoutPlans();

  // Event listeners
  closeModalBtn.addEventListener('click', () => {
    viewPlanModal.classList.add('hidden');
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === viewPlanModal) {
      viewPlanModal.classList.add('hidden');
    }
  });

  closeEditBtn.addEventListener('click', () => {
    editPlanModal.classList.add('hidden');
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === editPlanModal) {
      editPlanModal.classList.add('hidden');
    }
  });

  saveEditBtn.addEventListener('click', saveEditedPlan);

  // Fetch workout plans created by this trainer
  async function fetchWorkoutPlans() {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Auth token not found. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_created_workout_plans", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout plans');
      }

      const data = await response.json();
      workoutPlans = data || [];

      // Sort by created date (newest first)
      workoutPlans.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Update total plans count
      totalPlansElement.textContent = workoutPlans.length;

      // Render the plans table
      renderWorkoutPlansTable();
      console.log(workoutPlans);

    } catch (error) {
      console.error('Error fetching workout plans:', error);
      alert('Error fetching workout plans. Please try again.');
    }
  }

  function renderWorkoutPlansTable() {
    plansTableBody.innerHTML = '';

    if (workoutPlans.length === 0) {
      plansTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No workout plans found</td></tr>';
      return;
    }

    workoutPlans.forEach(plan => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${plan.member_name || 'N/A'}</td>
        <td>${plan.phone || 'N/A'}</td>
        <td>${new Date(plan.created_at).toLocaleDateString()}</td>
        <td>
          <button class="action-btn view-btn" data-id="${plan.id}">View</button>
          <button class="action-btn edit-btn" data-id="${plan.id}">Edit</button>
          <button class="action-btn delete-btn" data-id="${plan.id}">Delete</button>
        </td>
      `;
      plansTableBody.appendChild(row);
    });

    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', handleViewPlan);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', handleEditPlan);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDeletePlan);
    });
  }

  function handleViewPlan(e) {
    const planId = e.target.dataset.id;
    const plan = workoutPlans.find(p => p.id == planId);
    if (!plan) {
      console.error("Plan not found for ID:", planId);
      return;
    }

    console.log("Displaying plan details for plan ID:", plan.id);
    displayPlanDetails(plan);
    viewPlanModal.classList.remove('hidden');
  }

  function displayPlanDetails(plan) {
    let detailsHTML = `<h3>Plan for ${plan.member_name}</h3>`;

    if (!plan.description) {
      planDetails.innerHTML = '<p>No workout plan description available.</p>';
      return;
    }

    try {
      const workoutPlan = JSON.parse(plan.description);

      if (Array.isArray(workoutPlan)) {
        workoutPlan.forEach(day => {
          detailsHTML += `
            <div class="day-plan">
              <h3>Day ${day.day}</h3>
              ${day.exercises.map(exercise => `
                <div class="exercise">
                  <p><strong>${exercise.name}</strong></p>
                  <p>${exercise.sets} sets × ${exercise.reps} reps</p>
                </div>
              `).join('')}
            </div>
          `;
        });
      } else {
        detailsHTML += '<p>Invalid workout plan format</p>';
      }
    } catch (e) {
      console.error('Error parsing workout plan:', e);
      detailsHTML += '<p>Error loading workout plan details</p>';
    }

    planDetails.innerHTML = detailsHTML;
  }

  function handleEditPlan(e) {
    const planId = e.target.dataset.id;
    const plan = workoutPlans.find(p => p.id == planId);
    if (!plan) return alert('Workout plan not found.');

    try {
      const dayWisePlan = JSON.parse(plan.description || '[]');
      editExercisesContainer.innerHTML = '';

      dayWisePlan.forEach((dayObj, dayIndex) => {
        const dayTitle = document.createElement('h3');
        dayTitle.textContent = `Day ${dayObj.day}`;
        editExercisesContainer.appendChild(dayTitle);

        dayObj.exercises.forEach((exerciseObj, exIndex) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'exercise-edit-block';

          const nameInput = document.createElement('input');
          nameInput.value = exerciseObj.name;
          nameInput.placeholder = 'Exercise Name';
          nameInput.classList.add('exercise-input');

          const setsInput = document.createElement('input');
          setsInput.type = 'number';
          setsInput.value = exerciseObj.sets;
          setsInput.placeholder = 'Sets';
          setsInput.classList.add('sets-input');

          const repsInput = document.createElement('input');
          repsInput.type = 'number';
          repsInput.value = exerciseObj.reps;
          repsInput.placeholder = 'Reps';
          repsInput.classList.add('reps-input');

          wrapper.append(nameInput, setsInput, repsInput);
          editExercisesContainer.appendChild(wrapper);
        });
      });

      // Fill member info
      editMemberName.textContent = plan.member_name;
      editPhone.textContent = plan.phone;
      editPlanId.value = plan.id;

      editPlanModal.classList.remove('hidden');
    } catch (error) {
      console.error('Error parsing workout plan:', error);
      alert('Error loading workout plan for editing.');
    }
  }

  async function saveEditedPlan() {
    const planId = editPlanId.value;
    const exerciseBlocks = document.querySelectorAll('.exercise-edit-block');
    
    const updatedPlan = {
      days: []
    };

    let currentDay = null;
    
    editExercisesContainer.querySelectorAll('*').forEach(element => {
      if (element.tagName === 'H3') {
        if (currentDay) {
          updatedPlan.days.push(currentDay);
        }
        const dayNumber = parseInt(element.textContent.replace('Day ', ''));
        currentDay = {
          day: dayNumber,
          exercises: []
        };
      } else if (element.classList.contains('exercise-edit-block')) {
        const name = element.querySelector('.exercise-input').value;
        const sets = parseInt(element.querySelector('.sets-input').value);
        const reps = parseInt(element.querySelector('.reps-input').value);
        
        if (currentDay) {
          currentDay.exercises.push({
            name: name,
            sets: sets,
            reps: reps
          });
        }
      }
    });

    if (currentDay) {
      updatedPlan.days.push(currentDay);
    }

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("Auth token not found. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=edit_created_workout_plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: planId,
          description: JSON.stringify(updatedPlan.days)
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update workout plan');
      }

      alert('Workout plan updated successfully!');
      editPlanModal.classList.add('hidden');
      await fetchWorkoutPlans();

    } catch (err) {
      console.error(err);
      alert('Error updating plan: ' + err.message);
    }
  }

  async function handleDeletePlan(e) {
    const planId = e.target.dataset.id;
    console.log("Deleting plan with ID:", planId);

    if (confirm('Are you sure you want to delete this workout plan?')) {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          alert("Auth token not found. Please log in.");
          return;
        }

        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=delete_created_workout_plans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ id: planId })
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to delete workout plan');
        }

        alert('Workout plan deleted successfully');
        await fetchWorkoutPlans();

      } catch (error) {
        console.error('Error deleting workout plan:', error);
        alert('Error deleting workout plan. Please try again.');
      }
    }
  }
}