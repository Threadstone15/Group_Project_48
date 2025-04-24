export function initOwner_financialOver() {
    console.log("Initializing financial overview");

    let latestData = null; // To store the latest data fetched from the API
    let selectedPeriod = "daily"; // track the current period selection
    let financialChart = null; // Chart instance

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
            setActiveButton(todayBtn);
            updateIncomeDisplay("daily");
        });
    }
    if (weekBtn) {
        weekBtn.addEventListener("click", () => {
            setActiveButton(weekBtn);
            updateIncomeDisplay("weekly");
        });
    }
    if (monthBtn) {
        monthBtn.addEventListener("click", () => {
            setActiveButton(monthBtn);
            updateIncomeDisplay("monthly");
        });
    }

    // Set default active button and load data/chart for daily
    if (todayBtn) {
        setActiveButton(todayBtn);
        updateIncomeDisplay("daily");
    }

    function setActiveButton(activeBtn) {
        document.querySelectorAll(".button-container button").forEach(btn => {
            btn.classList.remove("active");
        });
        activeBtn.classList.add("active");
    }

    async function updateIncomeDisplay(period) {
        selectedPeriod = period;

        try {
            const response = await fetch(
                `http://localhost:8080/Group_Project_48/backend/api/controllers/FinancialOverviewController.php?period=${period}`
            );
            const result = await response.json();
            console.log("Fetched Result:", result);

            if (result.status === "success") {
                const latestIncome = result.data.income[0] || 0;
                totalCountElement.textContent = `Rs. ${latestIncome.toLocaleString()}`;
                latestData = result.data;
                if (chartLoaded) {
                    setupCharts(); // re-render chart with new data
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
        if (latestData) setupCharts();
    };
    script.onerror = () => console.error("Failed to load Chart.js");
    document.head.appendChild(script);

    function setupCharts() {
        const ctx = document.getElementById("financialChart");
        if (!ctx || !latestData) {
            console.warn("Cannot render chart: missing canvas or data.");
            return;
        }

        // Destroy existing chart instance before creating new one
        if (financialChart) {
            financialChart.destroy();
        }

        // Create new chart instance
        financialChart = new Chart(ctx, getChartConfig("income", latestData));

        // Attach toggle events (only once)
        if (!incomeToggleBtn.hasAttribute('data-listener')) {
            incomeToggleBtn.addEventListener("click", () => {
                financialChart.destroy();
                financialChart = new Chart(ctx, getChartConfig("income", latestData));
            });
            incomeToggleBtn.setAttribute('data-listener', 'true');
        }
        if (!countToggleBtn.hasAttribute('data-listener')) {
            countToggleBtn.addEventListener("click", () => {
                financialChart.destroy();
                financialChart = new Chart(ctx, getChartConfig("count", latestData));
            });
            countToggleBtn.setAttribute('data-listener', 'true');
        }
        if (!growthToggleBtn.hasAttribute('data-listener')) {
            growthToggleBtn.addEventListener("click", () => {
                financialChart.destroy();
                financialChart = new Chart(ctx, getChartConfig("growth", latestData));
            });
            growthToggleBtn.setAttribute('data-listener', 'true');
        }
    }

    function getChartConfig(type, data) {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: `${type.charAt(0).toUpperCase() + type.slice(1)} Overview for ${
                        selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                    }`
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

        const datasetMap = {
            income: { label: "Income (Rs.)", data: data.income },
            count: { label: "Payment Counts", data: data.payment_count },
            growth: { label: "Growth (%)", data: data.growth_rate }
        };

        return {
            type: type === 'income' ? 'bar' : 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: datasetMap[type].label,
                    data: datasetMap[type].data,
                    borderWidth: 1,
                    tension: type === 'income' ? 0 : 0.4,
                    fill: type !== 'income'
                }]
            },
            options: commonOptions
        };
    }
}
