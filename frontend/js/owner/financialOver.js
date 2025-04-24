export function initOwner_financialOver() {
    console.log("Initializing financial overview");

    let latestData = null; // To store the latest data fetched from the API

    // Dummy income data
    const dummyIncomeData = {
        daily: 12500,
        weekly: 87500,
        monthly: 375000
    };

    // DOM Elements
    const totalCountElement = document.getElementById("totalCount");
    const todayBtn = document.getElementById("daily");
    const weekBtn = document.getElementById("weekly");
    const monthBtn = document.getElementById("monthly");

    const incomeToggleBtn = document.getElementById("Income");
    const countToggleBtn = document.getElementById("Count");
    const growthToggleBtn = document.getElementById("Growth");

    // Default display
    if (totalCountElement) {
        totalCountElement.textContent = `Rs. ${dummyIncomeData.daily.toLocaleString()}`;
    }

    // Button Events for period selection
    if (todayBtn) {
        todayBtn.addEventListener("click", () => {
            updateIncomeDisplay("daily");
            setActiveButton(todayBtn);
        });
    }

    if (weekBtn) {
        weekBtn.addEventListener("click", () => {
            updateIncomeDisplay("weekly");
            setActiveButton(weekBtn);
        });
    }

    if (monthBtn) {
        monthBtn.addEventListener("click", () => {
            updateIncomeDisplay("monthly");
            setActiveButton(monthBtn);
        });
    }

    if (todayBtn) setActiveButton(todayBtn); // Default active

    function setActiveButton(activeBtn) {
        document.querySelectorAll(".button-container button").forEach(btn => {
            btn.classList.remove("active");
        });
        activeBtn.classList.add("active");
    }

    async function updateIncomeDisplay(period) {
        try {
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/FinancialOverviewController.php?period=${period}`);
            const result = await response.json();

            console.log("Fetched Result:", result);

            if (result.status === "success") {
                const latestIncome = result.data.income[0] || 0;
                totalCountElement.textContent = `Rs. ${latestIncome.toLocaleString()}`;
                latestData = result.data; 
                
                if (chartLoaded) {
                    setupCharts(); // call only after Chart.js is loaded
                } else {
                    console.warn("Chart.js not loaded yet");
                }
            } else {
                console.error("API Error:", result.message || "Unknown error from backend");
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    // Load Chart.js dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js";
    let chartLoaded = false;
    script.onload = () => {
        console.log("Chart.js loaded dynamically");
        chartLoaded = true;
        // If data is already available
        if (latestData) setupCharts();
    };
    script.onerror = () => {
        console.error("Failed to load Chart.js");
    };
    document.head.appendChild(script);

    let financialChart;

    function setupCharts() {

      const ctx = document.getElementById("financialChart");
        if (!ctx) {
            console.error("Canvas element not found");
            return;
        }

        //fallback data for chart
        const chartData = latestData;
        if (!latestData) {
            console.warn("No data available to render chart yet.");
            return;
        }

  
        // Dummy fallback data
        const dummyData = {
            monthly: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                income: [20000, 18000, 22000, 24000, 21000, 20000],
                paymentCounts: [45, 38, 52, 58, 47, 42],
                growth: [10, -5, 15, 20, 12, 8]
            }
        };

        financialChart = new Chart(ctx, getChartConfig("income", latestData));

        // Toggle buttons for chart view
        incomeToggleBtn?.addEventListener("click", () => {
            financialChart.destroy();
            financialChart = new Chart(ctx, getChartConfig("income", latestData));
        });

        countToggleBtn?.addEventListener("click", () => {
            financialChart.destroy();
            financialChart = new Chart(ctx, getChartConfig("count", latestData));
        });

        growthToggleBtn?.addEventListener("click", () => {
            financialChart.destroy();
            financialChart = new Chart(ctx, getChartConfig("growth", latestData));
        });
    }

    function updateChart(data) {
        if (!financialChart) return;

        financialChart.data.labels = data.labels;
        financialChart.data.datasets[0].data = data.income;
        financialChart.data.datasets[1].data = data.payment_count;
        financialChart.update();
    }

    function getChartConfig(type, data) {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: `Monthly ${type.charAt(0).toUpperCase() + type.slice(1)} Overview`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: type === "growth" ? "Growth (%)" : "Amount (Rs.)"
                    }
                }
            }
        };

        switch (type) {
            case "income":
                return {
                    type: "bar",
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: "Income (Rs.)",
                                data: data.income,
                                backgroundColor: "rgba(54, 162, 235, 0.7)",
                                borderColor: "rgba(54, 162, 235, 1)",
                                borderWidth: 1
                            }
                        ]
                    },
                    options: commonOptions
                };

            case "count":
                return {
                    type: "line",
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: "Payment Counts",
                                data: data.payment_count,
                                backgroundColor: "rgba(75, 192, 192, 0.7)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 2,
                                tension: 0.4,
                                fill: false
                            }
                        ]
                    },
                    options: commonOptions
                };

            case "growth":
                return {
                    type: "line",
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: "Growth (%)",
                                data: data.growth_rate,
                                backgroundColor: "rgba(255, 206, 86, 0.7)",
                                borderColor: "rgba(255, 206, 86, 1)",
                                borderWidth: 2,
                                tension: 0.4,
                                fill: false
                            }
                        ]
                    },
                    options: commonOptions
                };

            default:
                return getChartConfig("income", data);
        }
    }
}
