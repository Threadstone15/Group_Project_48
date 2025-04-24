export function initTrainer_createWorkoutPlans() {
    console.log("initializing workout meal plans");
    
      const authToken = localStorage.getItem('authToken'); // Assuming authToken is stored in localStorage
    
      if (!authToken) {
        alert('Trainer ID or Auth Token not found.');
        return;
      }
    
      fetchPlans(authToken);

    
    function fetchPlans(authToken) {
      fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_created_workout_plans`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log('Fetched plans:', data);
          if (data && Array.isArray(data.plans)) {
            document.getElementById('planCount').textContent = data.plans.length;
            populateTable(data.plans);
          } else {
            alert('No plans found.');
          }
        })
        .catch(error => {
          console.error('Error fetching plans:', error);
          alert('Failed to fetch plans.');
        });
    }
    
    function populateTable(plans) {
      const tbody = document.querySelector('#plansTable tbody');
      tbody.innerHTML = ''; // Clear existing rows
    
      plans.forEach(plan => {
        const tr = document.createElement('tr');
    
        const nameTd = document.createElement('td');
        nameTd.textContent = plan.member_name || 'N/A';
        tr.appendChild(nameTd);
    
        const phoneTd = document.createElement('td');
        phoneTd.textContent = plan.phone_number || 'N/A';
        tr.appendChild(phoneTd);
    
        const actionsTd = document.createElement('td');
    
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.className = 'action-btn view-btn';
        viewBtn.addEventListener('click', () => viewPlan(plan.id));
        actionsTd.appendChild(viewBtn);
    
        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.className = 'action-btn update-btn';
        updateBtn.addEventListener('click', () => updatePlan(plan.id));
        actionsTd.appendChild(updateBtn);
    
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.addEventListener('click', () => deletePlan(plan.id));
        actionsTd.appendChild(deleteBtn);
    
        tr.appendChild(actionsTd);
        tbody.appendChild(tr);
      });
    }
    
    function viewPlan(planId) {
      // Implement view functionality
      alert(`Viewing plan ID: ${planId}`);
    }
    
    function updatePlan(planId) {
      // Implement update functionality
      alert(`Updating plan ID: ${planId}`);
    }
    
    function deletePlan(planId) {
      if (confirm('Are you sure you want to delete this plan?')) {
        const authToken = localStorage.getItem('authToken');
        fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=delete_workout_plan&id=${planId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
          .then(response => response.json())
          .then(data => {
            alert(data.message || 'Plan deleted.');
            fetchPlans(authToken);
          })
          .catch(error => {
            console.error('Error deleting plan:', error);
            alert('Failed to delete plan.');
          });
      }
    }
    
  
  }