export function initMember_myPlans() {
    console.log("initialzing myPlans.js");
    // Sample workout data
    const workoutData = [
      { name: "Push-ups", sets: 3, reps: 15 },
      { name: "Squats", sets: 4, reps: 20 },
      { name: "Lunges", sets: 3, reps: 12 },
      { name: "Plank", sets: 3, reps: "45 seconds" },
      { name: "Burpees", sets: 3, reps: 10 },
      { name: "Deadlifts", sets: 4, reps: 8 },
      { name: "Pull-ups", sets: 4, reps: 10 }
    ];
  
    const exerciseList = document.getElementById("exercise-list");
    const showMoreBtn = document.getElementById("show-more-btn");
  
    let exercisesToShow = 3;
  
    // Function to display exercises
    function displayExercises() {
      exerciseList.innerHTML = "";
      const exercisesToDisplay = workoutData.slice(0, exercisesToShow);
  
      exercisesToDisplay.forEach(exercise => {
        const exerciseItem = document.createElement("div");
        exerciseItem.classList.add("exercise-item");
  
        const exerciseInfo = document.createElement("div");
        exerciseInfo.classList.add("exercise-info");
  
        const exerciseName = document.createElement("p");
        exerciseName.classList.add("exercise-name");
        exerciseName.textContent = exercise.name;
  
        const setsReps = document.createElement("p");
        setsReps.classList.add("exercise-sets-reps");
        setsReps.textContent = `Sets: ${exercise.sets}, Reps: ${exercise.reps}`;
  
        exerciseInfo.appendChild(exerciseName);
        exerciseInfo.appendChild(setsReps);
  
        exerciseItem.appendChild(exerciseInfo);
        exerciseList.appendChild(exerciseItem);
      });
  
      // Toggle the 'Show More' button
      if (exercisesToShow >= workoutData.length) {
        showMoreBtn.style.display = "none";
      } else {
        showMoreBtn.style.display = "block";
      }
    }
  
    // Show more exercises
    showMoreBtn.addEventListener("click", () => {
      exercisesToShow += 3;
      displayExercises();
    });
  
    displayExercises();
  
  }