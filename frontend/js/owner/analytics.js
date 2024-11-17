document.addEventListener("DOMContentLoaded", function () {
    // Fetch data from PHP backend
    fetch("getMonthlySignups.php")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Process data into labels and values
        const labels = data.map((item) => item.month);
        const values = data.map((item) => item.signups);
  
        // Render the chart
        renderChart(labels, values);
      })
      .catch((error) => {
        console.error("Error fetching signup data:", error);
  
        // Use dummy data if the fetch fails
        const dummyLabels = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const dummyValues = [12, 19, 3, 5, 2, 3, 8, 15, 9, 7, 6, 4];
  
        // Render the chart with dummy data
        renderChart(dummyLabels, dummyValues);
      });
  });
  
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
            backgroundColor: "rgba(255, 95, 0, 0.2)",
            borderColor: "rgba(255, 95, 0, 1)",
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
  