export function initMember_createPlan() {
  const workoutForm = document.getElementById('workout-form');
  const workoutList = document.getElementById('workout-list');

  // Event listener for form submission
  workoutForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get input values
    const workoutName = document.getElementById('workout-name').value;
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;

    const workoutItem = document.createElement('div');
    workoutItem.classList.add('workout-item');

    const workoutInfo = document.createElement('div');
    workoutInfo.classList.add('workout-info');
    workoutInfo.innerHTML = `
    <strong>${workoutName}</strong><br />
    Sets: ${sets} | Reps: ${reps}
  `;

    workoutItem.appendChild(workoutInfo);
    workoutList.appendChild(workoutItem);

    workoutForm.reset();
  });
}
