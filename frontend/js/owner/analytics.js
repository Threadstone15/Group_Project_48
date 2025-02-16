export function initOwner_analytics() {
  console.log("Owner Analytics");
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Owner Analytics");
    // Dummy data
    const dummyLabels = [
      "January", "February", "March", "April", 
      "May", "June", "July", "August", 
      "September", "October", "November", "December"
    ];
    
    const dummyValues = [10, 15, 8, 20, 12, 18, 25, 22, 30, 17, 19, 23];
  
    // Render the chart with dummy data
    renderChart(dummyLabels, dummyValues);
  });
  
  // Render chart function
  function renderChart(labels, values) {
    const ctx = document.getElementById("signupChart").getContext("2d");
  
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Monthly Signups",
            data: values,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
  
  
}
