//const chartModule = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/+esm');

export async function initOwner_financialOver() {

    const Chart = window.Chart;
    
    if (!Chart) {
        console.error("Chart.js not loaded");
        return;
    }

    // DOM elements
    const totalIncome = document.getElementById("totalIncome");
    const periodSelector = document.getElementById("periodSelector");
    const monthSelectorContainer = document.getElementById("monthSelectorContainer");
    const monthSelector = document.getElementById("monthSelector");
    const incomeChartCanvas = document.getElementById("incomeChart")?.getContext("2d");
    
    if (!incomeChartCanvas) {
        console.error("Canvas context not found");
        return;
    }

    let incomeChart;
    let payments = [];

    async function fetchPaymentsFromBackend() {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_all_payments",
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            payments = Array.isArray(data?.data) ? data.data : 
                     Array.isArray(data) ? data : [];
            
            return payments;
        } catch (error) {
            console.error("Fetch error:", error);
            throw error;
        }
    }

    function calculateIncome(period, month = null) {
        const now = new Date();
        const currentYear = now.getFullYear();

        let filteredPayments = payments.filter(p => p["Amount"] && p["Date"]);

        if (period === "monthly") {
            filteredPayments = filteredPayments.filter(payment => {
                const date = new Date(payment["Date"]);
                return date.getFullYear() === currentYear && (date.getMonth() + 1) === parseInt(month);
            });
        } else if (period === "annual") {
            filteredPayments = filteredPayments.filter(payment => {
                const date = new Date(payment["Date"]);
                return date.getFullYear() === currentYear;
            });
        }

        const total = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment["Amount"]), 0);
        totalIncome.textContent = `Total Income: Rs.${total.toFixed(2)}`;

        // Prepare chart data
        const chartData = {};
        filteredPayments.forEach(payment => {
            const date = new Date(payment["Date"]);
            const key = period === "monthly" 
                ? `${date.getDate()}` 
                : `${date.getMonth() + 1}`;
            
            chartData[key] = (chartData[key] || 0) + parseFloat(payment["Amount"]);
        });

        const labels = Object.keys(chartData).sort((a, b) => parseInt(a) - parseInt(b));
        const incomeData = labels.map(label => chartData[label]);

        renderGraph(labels, incomeData, period);
    }

    function renderGraph(labels, data, period) {
        if (incomeChart) {
            incomeChart.destroy();
        }

        // Ensure Chart is available
        if (!Chart) {
            console.error("Chart is not available");
            return;
        }

        incomeChart = new Chart(incomeChartCanvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Income',
                    data,
                    backgroundColor: 'rgba(75, 192, 192, 0.3)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Income - ${period.charAt(0).toUpperCase() + period.slice(1)}`
                    }
                }
            }
        });
    }

    // Initialize
    try {
        await fetchPaymentsFromBackend();
        const currentMonth = new Date().getMonth() + 1;
        monthSelector.value = currentMonth.toString().padStart(2, '0');
        calculateIncome("monthly", currentMonth);
        
        // Event listeners
        periodSelector.addEventListener("change", () => {
            const selectedPeriod = periodSelector.value;
            if (selectedPeriod === "monthly") {
                monthSelectorContainer.style.display = "block";
                calculateIncome("monthly", monthSelector.value);
            } else {
                monthSelectorContainer.style.display = "none";
                calculateIncome("annual");
            }
        });

        monthSelector.addEventListener("change", () => {
            calculateIncome("monthly", monthSelector.value);
        });
        
    } catch (error) {
        console.error("Initialization error:", error);
    }
}